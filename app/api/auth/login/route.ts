import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signAdminToken } from "@/lib/auth";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 400 }
    );
  }

  const { username, password } = result.data;
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin";

  if (username !== adminUsername || password !== adminPassword) {
    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = signAdminToken(username);

  const response = NextResponse.json({ success: true, token });
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
}
