import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Team from "@/models/Team";
import Score from "@/models/Score";

const updateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  logo: z.string().url().optional().or(z.literal("")).optional(),
});

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
  const team = await Team.findByIdAndUpdate(id, result.data, { new: true }).lean();
  if (!team) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: team });
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
  await Team.findByIdAndDelete(id);
  await Score.deleteMany({ teamId: id });
  return NextResponse.json({ success: true });
}
