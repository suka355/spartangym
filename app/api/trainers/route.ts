import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/middleware/withAuth";
import { ok, err, serverError } from "@/lib/response";

export const GET = withAdmin(async () => {
  try {
    const trainers = await prisma.trainer.findMany({
      include: {
        _count: {
          select: { classes: true }
        }
      },
      orderBy: { firstName: "asc" }
    });

    const serialized = trainers.map(t => ({
      ...t,
      isActive: true, // old field that doesn't exist on trainer anymore, just keeping the shape consistent
    }));

    return ok(serialized);
  } catch (e) {
    return serverError(e);
  }
});

export const POST = withAdmin(async (req) => {
  try {
    let { firstName, lastName, email, password, specialties, bio, phone } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return err("Required fields missing", 400);
    }

    email = email.toLowerCase().trim();

    const existing = await prisma.trainer.findUnique({ where: { email } });
    if (existing) return err("Email already in use", 400);

    const trainer = await prisma.trainer.create({
      data: {
        email,
        password, // plain text — no bcrypt in this project by design
        firstName,
        lastName,
        phone,
        bio,
        specialties: specialties || [],
      }
    });

    return ok(trainer, 201);
  } catch (e: any) {
    console.error("[POST /api/trainers] Error:", e);
    if (e.code === 'P2002' && e.meta?.target?.includes('email')) {
      return err("Email already in use", 400);
    }
    
    return NextResponse.json(
      { success: false, error: e.message || "Internal server error" },
      { status: 500 }
    );
  }
});
