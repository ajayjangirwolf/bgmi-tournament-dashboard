import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Score from "@/models/Score";
import Tournament from "@/models/Tournament";
import { calcMatchScore } from "@/lib/scoring";
import { broadcastScoreUpdate, broadcastLeaderboardUpdate } from "@/sockets/io";
import { buildLeaderboard } from "@/lib/leaderboard";

const upsertSchema = z.object({
  teamId: z.string().min(1),
  matchId: z.string().min(1),
  tournamentId: z.string().min(1),
  kills: z.number().int().min(0),
  placement: z.number().int().min(1),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get("tournamentId");

  await connectDB();
  const filter = tournamentId ? { tournamentId } : {};
  const scores = await Score.find(filter)
    .populate("teamId", "name logo")
    .populate("matchId", "matchNumber matchName mapName")
    .lean();
  return NextResponse.json({ success: true, data: scores });
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = upsertSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.flatten() },
      { status: 400 }
    );
  }

  const { teamId, matchId, tournamentId, kills, placement } = result.data;

  await connectDB();
  const tournament = await Tournament.findById(tournamentId).lean();
  if (!tournament) {
    return NextResponse.json({ success: false, error: "Tournament not found" }, { status: 404 });
  }

  const totalScore = calcMatchScore(
    kills,
    placement,
    tournament.totalTeams,
    tournament.killPoints,
    tournament.winnerPoints,
    tournament.lastRankPoints
  );

  const score = await Score.findOneAndUpdate(
    { teamId, matchId },
    { teamId, matchId, tournamentId, kills, placement, totalScore },
    { upsert: true, new: true }
  );

  // Broadcast real-time updates
  try {
    broadcastScoreUpdate(tournamentId, { teamId, matchId, kills, placement, totalScore });
    const leaderboard = await buildLeaderboard(tournamentId);
    broadcastLeaderboardUpdate(tournamentId, leaderboard);
  } catch {
    // Socket may not be initialized in all environments
  }

  return NextResponse.json({ success: true, data: score });
}
