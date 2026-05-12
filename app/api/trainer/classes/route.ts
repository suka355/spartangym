import { prisma } from "@/lib/prisma";
import { withTrainer } from "@/middleware/withAuth";
import { ok, err, serverError } from "@/lib/response";

export const GET = withTrainer(async (_req, { user }) => {
  try {
    const trainerProfile = await prisma.trainer.findUnique({
      where: { id: user.userId }
    });

    if (!trainerProfile) return err("Trainer profile not found", 404);

    const classes = await prisma.gymClass.findMany({
      where: { trainerId: trainerProfile.id },
      include: {
        schedules: {
          where: { startsAt: { gte: new Date() } },
          orderBy: { startsAt: "asc" },
          take: 10,
          include: {
            _count: { select: { bookings: true } }
          }
        }
      },
      orderBy: { name: "asc" }
    });

    return ok(classes);
  } catch (e) {
    return serverError(e);
  }
});

export const PATCH = withTrainer(async (req, { user }) => {
  try {
    const { classId } = await req.json();
    if (!classId) return err("Class ID is required", 400);

    const trainerProfile = await prisma.trainer.findUnique({
      where: { id: user.userId }
    });

    if (!trainerProfile) return err("Trainer profile not found", 404);

    const gymClass = await prisma.gymClass.update({
      where: { id: parseInt(classId) },
      data: { trainerId: trainerProfile.id }
    });

    return ok(gymClass);
  } catch (e) {
    return serverError(e);
  }
});
