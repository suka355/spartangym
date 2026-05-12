import { prisma } from "@/lib/prisma";
import { withTrainer } from "@/middleware/withAuth";
import { ok, err, serverError } from "@/lib/response";

export const GET = withTrainer(async (_req, { user }) => {
  try {
    const trainerProfile = await prisma.trainer.findUnique({
      where: { id: user.userId },
    });

    if (!trainerProfile) return err("Trainer profile not found", 404);

    const athletes = await prisma.member.findMany({
      where: {
        bookings: {
          some: {
            schedule: { gymClass: { trainerId: trainerProfile.id } },
          },
        },
      },
      select: {
        id: true,
        email: true,
        joinedAt: true,
        firstName: true,
        lastName: true,
        phone: true,
        membershipStatus: true,
        plan: { select: { name: true } },
        bookings: {
          where: {
            schedule: { gymClass: { trainerId: trainerProfile.id } },
          },
          orderBy: { bookedAt: "desc" },
          take: 1,
          include: {
            schedule: {
              include: { gymClass: { select: { name: true } } }
            }
          }
        },
        _count: {
          select: {
            bookings: {
              where: {
                schedule: { gymClass: { trainerId: trainerProfile.id } },
              },
            },
          },
        },
      },
    });

    const serialized = athletes.map(a => ({
      id: a.id,
      email: a.email,
      createdAt: a.joinedAt, 
      memberProfile: {
        firstName: a.firstName,
        lastName: a.lastName,
        phone: a.phone,
        membershipStatus: a.membershipStatus,
        plan: a.plan
      },
      bookings: a.bookings,
      _count: a._count
    }));

    return ok(serialized);
  } catch (e) {
    console.error("[GET /api/trainer/athletes] Error:", e);
    return serverError(e);
  }
});
