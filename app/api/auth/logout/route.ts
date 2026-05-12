import { NextResponse } from "next/server";
import { getClearCookieHeaders } from "@/lib/auth";

// POST /api/auth/logout
export async function POST() {
  try {
    const cookieHeaders = getClearCookieHeaders();

    return NextResponse.json(
      { success: true, data: { message: "Logged out successfully" } },
      { headers: { "Set-Cookie": cookieHeaders.join(", ") } }
    );
  } catch (e) {
    console.error("[logout]", e);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}