import { prisma } from "@/lib/prisma";
import { withMember } from "@/middleware/withAuth";
import { ok, err, serverError } from "@/lib/response";

export const GET = withMember(async (_req, { user }) => {
  try {
    const fullUser = await prisma.member.findUnique({
      where: { id: user.userId },
      include: {
        plan: true,
        bookings: {
          where: {
            status: "CONFIRMED",
            schedule: { startsAt: { gte: new Date() } },
          },
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
          },
          orderBy: { schedule: { startsAt: "asc" } },
          take: 5,
        },
        progress: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!fullUser) return err("User not found", 404);

    const now = new Date();

    const [totalPastClasses, totalClassesAttended] = await Promise.all([
      prisma.booking.count({
        where: {
          memberId: user.userId,
          status: { in: ["ATTENDED", "CONFIRMED"] },
          schedule: { startsAt: { lt: now } },
        },
      }),
      prisma.booking.count({
        where: { memberId: user.userId, status: "ATTENDED" },
      }),
    ]);

    const membership = fullUser.plan ? {
      type: fullUser.plan.tier,
      name: fullUser.plan.name,
      price: Number(fullUser.plan.price),
      status: fullUser.membershipStatus,
      startDate: fullUser.membershipStartDate,
      endDate: fullUser.membershipEndDate,
      autoRenew: fullUser.membershipAutoRenew,
    } : null;

    const latestProgress = fullUser.progress[0] ? {
      ...fullUser.progress[0],
      weight: fullUser.progress[0].weight ? Number(fullUser.progress[0].weight) : null,
      bodyFat: fullUser.progress[0].bodyFat ? Number(fullUser.progress[0].bodyFat) : null,
      muscleMass: fullUser.progress[0].muscleMass ? Number(fullUser.progress[0].muscleMass) : null,
    } : null;

    return ok({
      member: {
        id: fullUser.id,
        email: fullUser.email,
        firstName: fullUser.firstName || "",
        lastName: fullUser.lastName || "",
        joinedAt: fullUser.joinedAt,
      },
      membership,
      upcomingBookings: fullUser.bookings,
      totalPastClasses,
      totalClassesAttended,
      latestProgress,
      daysUntilExpiry: fullUser.membershipEndDate
        ? Math.ceil((new Date(fullUser.membershipEndDate).getTime() - now.getTime()) / 86400000)
        : null,
    });
  } catch (e) {
    return serverError(e);
  }
});