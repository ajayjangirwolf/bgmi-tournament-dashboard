import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Tournament from "@/models/Tournament";

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  totalTeams: z.number().int().min(2).max(100).optional(),
  totalMatches: z.number().int().min(1).max(50).optional(),
  killPoints: z.number().min(0).optional(),
  winnerPoints: z.number().min(0).optional(),
  lastRankPoints: z.number().min(0).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();
  const tournament = await Tournament.findById(id).lean();
  if (!tournament) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: tournament });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error.flatten() },
      { status: 400 }
    );
  }

  await connectDB();
  const tournament = await Tournament.findByIdAndUpdate(id, result.data, {
    new: true,
  }).lean();
  if (!tournament) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: tournament });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  await Tournament.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
