import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Match from "@/models/Match";

const MAPS = ["Erangel", "Miramar", "Sanhok", "Vikendi"] as const;

const createSchema = z.object({
  tournamentId: z.string().min(1),
  matchNumber: z.number().int().min(1),
  matchName: z.string().optional(),
  mapName: z.enum(MAPS),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get("tournamentId");

  await connectDB();
  const filter = tournamentId ? { tournamentId } : {};
  const matches = await Match.find(filter).sort({ matchNumber: 1 }).lean();
  return NextResponse.json({ success: true, data: matches });
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = createSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();
  const match = await Match.create(result.data);
  return NextResponse.json({ success: true, data: match }, { status: 201 });
}
