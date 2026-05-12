import { NextRequest } from "next/server";

export type SessionPayload = {
  userId: number;
  role: "ADMIN" | "MEMBER" | "TRAINER";
  email: string;
};

// grab the session cookie and parse it out
export async function getCurrentUser(req: NextRequest): Promise<SessionPayload | null> {
  const cookie = req.cookies.get("spartan_session")?.value;
  if (!cookie) return null;

  try {
    const session = JSON.parse(decodeURIComponent(cookie)) as SessionPayload;
    if (session && session.userId && session.role) {
      return session;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// build the Set-Cookie header — 7 days, httponly so JS can't touch it
export function getAuthCookieHeaders(session: SessionPayload) {
  const isProd = process.env.NODE_ENV === "production";
  const sessionStr = encodeURIComponent(JSON.stringify(session));
  // expires in 7 days
  return [
    `spartan_session=${sessionStr}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${isProd ? "; Secure" : ""}`,
  ];
}

export function getClearCookieHeaders() {
  return [
    `spartan_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
  ];
}