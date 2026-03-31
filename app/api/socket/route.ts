// Socket.IO is initialized via a custom server (server.ts).
// This route returns the socket connection info for clients.
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    path: "/api/socket",
  });
}
