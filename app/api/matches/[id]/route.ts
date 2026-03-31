import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Match from "@/models/Match";
import Score from "@/models/Score";

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
  await Match.findByIdAndDelete(id);
  await Score.deleteMany({ matchId: id });
  return NextResponse.json({ success: true });
}
