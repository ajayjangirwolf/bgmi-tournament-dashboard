import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AdminPayload {
  username: string;
  role: "admin";
  iat?: number;
  exp?: number;
}

export function signAdminToken(username: string): string {
  return jwt.sign({ username, role: "admin" }, JWT_SECRET, {
    expiresIn: "24h",
  });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const cookie = req.cookies.get("admin_token");
  return cookie?.value ?? null;
}

export function requireAdmin(req: NextRequest): AdminPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyAdminToken(token);
}
