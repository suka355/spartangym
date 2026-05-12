import { prisma } from "@/lib/prisma";
import { withTrainer } from "@/middleware/withAuth";
import { ok, err, serverError } from "@/lib/response";

export const GET = withTrainer(async (_req, { user }) => {
  try {
    const trainerProfile = await prisma.trainer.findUnique({
      where: { id: user.userId },
      include: {
        classes: {
          include: {
            _count: {
              select: { schedules: { where: { startsAt: { gte: new Date() } } } }
            }
          }
        }
      }
    });

    if (!trainerProfile) return err("Trainer profile not found", 404);

    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    // fetch what's coming up in the next 7 days for this trainer
    const upcomingSchedules = await prisma.classSchedule.findMany({
      where: {
        gymClass: { trainerId: trainerProfile.id },
        startsAt: { gte: now, lte: nextWeek },
        isCancelled: false,
      },
      include: {
        gymClass: true,
        _count: { select: { bookings: true } }
      },
      orderBy: { startsAt: "asc" }
    });

    // how many confirmed bookings are sitting on future classes
    const totalBookingsResult = await prisma.booking.count({
      where: {
        schedule: {
          gymClass: { trainerId: trainerProfile.id },
          startsAt: { gte: now }
        },
        status: "CONFIRMED"
      }
    });

    // count how many sessions have already happened (not cancelled)
    const totalPastClasses = await prisma.classSchedule.count({
      where: {
        gymClass: { trainerId: trainerProfile.id },
        startsAt: { lt: now },
        isCancelled: false
      }
    });

    return ok({
      trainer: {
        id: trainerProfile.id,
        firstName: trainerProfile.firstName,
        lastName: trainerProfile.lastName,
      },
      stats: {
        assignedClasses: trainerProfile.classes.length,
        upcomingSchedulesCount: upcomingSchedules.length,
        totalActiveBookings: totalBookingsResult,
        totalPastClasses,
      },
      upcomingSchedules
    });
  } catch (e) {
    return serverError(e);
  }
});
