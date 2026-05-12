import { prisma } from "@/lib/prisma";
import { withAuth, withMember } from "@/middleware/withAuth";
import { ok, err, serverError } from "@/lib/response";

export const GET = withAuth(async (req, { user }) => {
  try {
    const isAdmin = user.role === "ADMIN";
    const { searchParams } = new URL(req.url);
    const scheduleIdStr = searchParams.get("scheduleId");
    const scheduleId = scheduleIdStr ? parseInt(scheduleIdStr) : undefined;

    const where = isAdmin
      ? scheduleId ? { scheduleId } : {}
      : { memberId: user.userId };

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        schedule: {
          include: {
            gymClass: {
              include: {
                trainer: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
        member: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        },
      },
      orderBy: { bookedAt: "desc" },
    });

    const result = bookings.map(b => ({
      ...b,
      user: {
        email: b.member.email,
        firstName: b.member.firstName || "",
        lastName: b.member.lastName || "",
      }
    }));

    return ok(result);
  } catch (e) {
    return serverError(e);
  }
});

export const POST = withMember(async (req, { user }) => {
  try {
    const body = await req.json();
    const { scheduleId } = body;

    if (!scheduleId) return err("scheduleId is required");
    const scheduleIdInt = parseInt(scheduleId);

    const member = await prisma.member.findUnique({
      where: { id: user.userId }
    });

    if (!member || member.membershipStatus !== "ACTIVE")
      return err("No active membership found. Please upgrade your plan.", 403);

    const schedule = await prisma.classSchedule.findUnique({
      where: { id: scheduleIdInt },
      include: {
        gymClass: true,
        _count:   { select: { bookings: true } },
      },
    });

    if (!schedule) return err("Class schedule not found", 404);
    if (schedule.isCancelled) return err("This class session has been cancelled");

    if (schedule._count.bookings >= schedule.gymClass.maxCapacity)
      return err("This class session is fully booked");

    const existing = await prisma.booking.findUnique({
      where: { memberId_scheduleId: { memberId: user.userId, scheduleId: scheduleIdInt } },
    });
    if (existing) return err("You are already booked for this class");

    const booking = await prisma.booking.create({
      data: { memberId: user.userId, scheduleId: scheduleIdInt },
    });

    return ok(booking, 201);
  } catch (e) {
    console.error("[bookings:POST]", e);
    return serverError(e);
  }
});