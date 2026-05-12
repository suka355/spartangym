import { prisma } from "@/lib/prisma";
import { withTrainer } from "@/middleware/withAuth";
import { ok, err, serverError } from "@/lib/response";

export const GET = withTrainer(async (req, { user }) => {
  try {
    const trainerProfile = await prisma.trainer.findUnique({
      where: { id: user.userId }
    });
    if (!trainerProfile) return err("Trainer profile not found", 404);

    const schedules = await prisma.classSchedule.findMany({
      where: {
        gymClass: { trainerId: trainerProfile.id }
      },
      include: {
        gymClass: true,
        _count: { select: { bookings: true } }
      },
      orderBy: { startsAt: "asc" }
    });

    return ok(schedules);
  } catch (e) {
    return serverError(e);
  }
});

export const POST = withTrainer(async (req, { user }) => {
  try {
    const { classId, startsAt, endsAt, isRecurring, recurRule } = await req.json();

    if (!classId || !startsAt || !endsAt) {
      return err("Required fields missing", 400);
    }

    const classIdInt = parseInt(classId);

    const trainerProfile = await prisma.trainer.findUnique({
      where: { id: user.userId }
    });
    if (!trainerProfile) return err("Trainer profile not found", 404);

    const gymClass = await prisma.gymClass.findFirst({
      where: { id: classIdInt, trainerId: trainerProfile.id }
    });
    if (!gymClass) return err("Unauthorized: You do not teach this class", 403);

    const schedule = await prisma.classSchedule.create({
      data: {
        classId: classIdInt,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        isRecurring: !!isRecurring,
        recurRule,
      }
    });

    return ok(schedule, 201);
  } catch (e) {
    return serverError(e);
  }
});

export const PATCH = withTrainer(async (req, { user }) => {
  try {
    const { id, isCancelled, startsAt, endsAt } = await req.json();

    if (!id) return err("Schedule ID is required", 400);
    const idInt = parseInt(id);

    const trainerProfile = await prisma.trainer.findUnique({
      where: { id: user.userId }
    });
    if (!trainerProfile) return err("Trainer profile not found", 404);

    const schedule = await prisma.classSchedule.findFirst({
      where: { id: idInt, gymClass: { trainerId: trainerProfile.id } }
    });
    if (!schedule) return err("Unauthorized", 403);

    const updated = await prisma.classSchedule.update({
      where: { id: idInt },
      data: {
        ...(isCancelled !== undefined && { isCancelled }),
        ...(startsAt && { startsAt: new Date(startsAt) }),
        ...(endsAt && { endsAt: new Date(endsAt) }),
      }
    });

    return ok(updated);
  } catch (e) {
    return serverError(e);
  }
});

export const DELETE = withTrainer(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");

    if (!idStr) return err("Schedule ID is required", 400);
    const idInt = parseInt(idStr);

    const trainerProfile = await prisma.trainer.findUnique({
      where: { id: user.userId }
    });
    if (!trainerProfile) return err("Trainer profile not found", 404);

    const schedule = await prisma.classSchedule.findFirst({
      where: { id: idInt, gymClass: { trainerId: trainerProfile.id } }
    });
    if (!schedule) return err("Unauthorized", 403);

    await prisma.classSchedule.delete({ where: { id: idInt } });

    return ok({ message: "Schedule deleted" });
  } catch (e) {
    return serverError(e);
  }
});
