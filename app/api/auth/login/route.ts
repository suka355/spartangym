import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthCookieHeaders, SessionPayload } from "@/lib/auth";

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );

    let user: any = await prisma.member.findUnique({ where: { email } });
    let role: "MEMBER" | "ADMIN" | "TRAINER" = "MEMBER";

    if (!user) {
      user = await prisma.trainer.findUnique({ where: { email } });
      role = "TRAINER";
    }

    if (!user) {
      user = await prisma.admin.findUnique({ where: { email } });
      role = "ADMIN";
    }

    if (!user)
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );

    const valid = password === user.password;
    if (!valid)
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );

    const payload: SessionPayload = { userId: user.id, role, email: user.email };
    const cookieHeaders = getAuthCookieHeaders(payload);

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id:        user.id,
            email:     user.email,
            firstName: user.firstName,
            lastName:  user.lastName,
            role,
          },
        },
      }
    );

    cookieHeaders.forEach(cookie => response.headers.append("Set-Cookie", cookie));
    return response;
  } catch (e) {
    console.error("[login]", e);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}