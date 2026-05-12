import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthCookieHeaders, SessionPayload } from "@/lib/auth";

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// POST /api/auth/register
export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, phone, membershipType } = await req.json();

    if (!firstName || !lastName || !email || !password)
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );

    if (password.length < 8)
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );

    const existingMember = await prisma.member.findUnique({ where: { email } });
    const existingTrainer = await prisma.trainer.findUnique({ where: { email } });
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    
    if (existingMember || existingTrainer || existingAdmin)
      return NextResponse.json(
        { success: false, error: "Email already in use" },
        { status: 400 }
      );

    // if they picked a plan during sign-up, wire it up and activate them straight away
    let planId = null;
    let membershipData = {};
    if (membershipType) {
      // look up the plan so we can grab its id
      const plan = await prisma.membershipPlan.findUnique({
        where: { tier: membershipType }
      });
      
      if (plan) {
        planId = plan.id;
        membershipData = {
          membershipStatus: "ACTIVE",
          membershipStartDate: new Date(),
          membershipEndDate: addMonths(new Date(), 1),
          membershipAutoRenew: true,
        };
      }
    }

    const member = await prisma.member.create({
      data: {
        email,
        password,
        firstName,
        lastName,
        phone: phone || null,
        planId,
        ...membershipData,
      },
      include: {
        plan: true
      }
    });

    const payload: SessionPayload = { userId: member.id, role: "MEMBER", email: member.email };
    const cookieHeaders = getAuthCookieHeaders(payload);

    const response = NextResponse.json(
      {
        success: true,
        data: {
          id:        member.id,
          email:     member.email,
          firstName: member.firstName,
          lastName:  member.lastName,
          role:      "MEMBER",
        },
      },
      { status: 201 }
    );

    cookieHeaders.forEach(cookie => response.headers.append("Set-Cookie", cookie));
    return response;
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}