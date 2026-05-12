import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/middleware/withAuth";
import { ok, err, serverError } from "@/lib/response";

// anyone can list classes, no auth needed
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryName = searchParams.get("categoryName");

    const classes = await prisma.gymClass.findMany({
      where: {
        isActive: true,
        ...(categoryName ? { categoryName } : {}),
      },
      include: {
        trainer:  { select: { firstName: true, lastName: true, specialties: true } },
        schedules: {
          where:   { startsAt: { gte: new Date() }, isCancelled: false },
          orderBy: { startsAt: "asc" },
          take:    5,
          include: {
            _count: { select: { bookings: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return ok(classes);
  } catch (e) {
    return serverError(e);
  }
}

// create a new class — admin only
export const POST = withAdmin(async (req) => {
  try {
    const {
      name, description, trainerId,
      categoryName, categoryColor,
      duration, maxCapacity, difficulty, location,
    } = await req.json();

    const gymClass = await prisma.gymClass.create({
      data: {
        name,
        description,
        trainerId: trainerId ? parseInt(trainerId) : null,
        categoryName,
        categoryColor,
        duration: parseInt(duration),
        maxCapacity: parseInt(maxCapacity),
        difficulty,
        location,
      },
    });

    return ok(gymClass, 201);
  } catch (e) {
    return serverError(e);
  }
});

// update class fields — admin only
export const PATCH = withAdmin(async (req) => {
  try {
    const { id, trainerId, duration, maxCapacity, ...rest } = await req.json();
    if (!id) return err("Class ID is required", 400);

    const gymClass = await prisma.gymClass.update({
      where: { id: parseInt(id) },
      data: {
        ...rest,
        ...(trainerId !== undefined && { trainerId: trainerId ? parseInt(trainerId) : null }),
        ...(duration !== undefined && { duration: parseInt(duration) }),
        ...(maxCapacity !== undefined && { maxCapacity: parseInt(maxCapacity) }),
      },
    });

    return ok(gymClass);
  } catch (e) {
    return serverError(e);
  }
});

// remove a class entirely — admin only
export const DELETE = withAdmin(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");

    if (!idStr) return err("Class ID is required", 400);

    await prisma.gymClass.delete({
      where: { id: parseInt(idStr) },
    });

    return ok({ message: "Class deleted successfully" });
  } catch (e) {
    return serverError(e);
  }
});