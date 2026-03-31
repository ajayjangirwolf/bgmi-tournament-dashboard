import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Tournament from "@/models/Tournament";

const createSchema = z.object({
  name: z.string().min(2).max(100),
  totalTeams: z.number().int().min(2).max(100),
  totalMatches: z.number().int().min(1).max(50),
  killPoints: z.number().min(0),
  winnerPoints: z.number().min(0),
  lastRankPoints: z.number().min(0),
});

export async function GET() {
  await connectDB();
  const tournaments = await Tournament.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, data: tournaments });
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
  const tournament = await Tournament.create(result.data);
  return NextResponse.json({ success: true, data: tournament }, { status: 201 });
}
