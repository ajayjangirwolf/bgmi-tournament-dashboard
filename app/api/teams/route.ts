import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Team from "@/models/Team";

const createSchema = z.object({
  name: z.string().min(1).max(80),
  logo: z.string().url().optional().or(z.literal("")),
  tournamentId: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get("tournamentId");

  await connectDB();
  const filter = tournamentId ? { tournamentId } : {};
  const teams = await Team.find(filter).sort({ name: 1 }).lean();
  return NextResponse.json({ success: true, data: teams });
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
  const team = await Team.create(result.data);
  return NextResponse.json({ success: true, data: team }, { status: 201 });
}
