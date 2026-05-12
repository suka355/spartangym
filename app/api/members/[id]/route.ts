import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/middleware/withAuth";
import { ok, notFound, serverError } from "@/lib/response";

// pull full member profile — bookings, payments, progress included
export const GET = withAdmin(async (_req, { params }) => {
  try {
    const id = parseInt(params?.id ?? "");
    const user = await prisma.member.findUnique({
      where: { id },
      select: {
        id:        true,
        email:     true,
        firstName: true,
        lastName:  true,
        phone:     true,
        dateOfBirth: true,
        address:   true,
        joinedAt:  true,
        membershipStatus: true,
        membershipStartDate: true,
        membershipEndDate: true,
        membershipAutoRenew: true,
        plan: true,
        bookings: {
          include: { schedule: { include: { gymClass: true } } },
          take:    10,
          orderBy: { bookedAt: "desc" },
        },
        payments: { orderBy: { createdAt: "desc" }, take: 10 },
        progress: { orderBy: { recordedAt: "desc" }, take: 5 },
      },
    });

    if (!user) return notFound("Member");

    const serialized = {
      id: user.id,
      email: user.email,
      isActive: true, // keeping this field around for legacy UI compatibility
      createdAt: user.joinedAt,
      firstName: user.firstName || "",
      lastName:  user.lastName || "",
      phone:     user.phone || null,
      dateOfBirth: user.dateOfBirth || null,
      address: user.address || null,
      joinedAt: user.joinedAt,
      membershipStatus: user.membershipStatus || "PENDING",
      membershipStartDate: user.membershipStartDate || null,
      membershipEndDate: user.membershipEndDate || null,
      membershipAutoRenew: user.membershipAutoRenew || false,
      plan: user.plan
        ? { ...user.plan, price: Number(user.plan.price) }
        : null,
      bookings: user.bookings,
      payments: user.payments.map(p => ({ ...p, amount: Number(p.amount) })),
      progress: user.progress.map(p => ({
        ...p,
        weight:     p.weight     ? Number(p.weight)     : null,
        bodyFat:    p.bodyFat    ? Number(p.bodyFat)    : null,
        muscleMass: p.muscleMass ? Number(p.muscleMass) : null,
      })),
    };

    return ok(serialized);
  } catch (e) {
    return serverError(e);
  }
});

// update whatever fields the admin changes — only writes non-undefined values
export const PATCH = withAdmin(async (req, { params }) => {
  try {
    const id = parseInt(params?.id ?? "");
    const body = await req.json();
    const { firstName, lastName, phone, isActive, membershipStatus, planId } = body;

    const profileUpdate: Record<string, unknown> = {};
    if (firstName !== undefined) profileUpdate.firstName = firstName;
    if (lastName !== undefined) profileUpdate.lastName = lastName;
    if (phone !== undefined) profileUpdate.phone = phone;
    if (membershipStatus !== undefined) profileUpdate.membershipStatus = membershipStatus;
    if (planId !== undefined) profileUpdate.planId = parseInt(planId);

    if (Object.keys(profileUpdate).length > 0) {
      await prisma.member.update({ where: { id }, data: profileUpdate });
    }

    const updated = await prisma.member.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true, membershipStatus: true,
        plan: { select: { tier: true, name: true } }
      }
    });

    return ok({
      id: updated?.id,
      email: updated?.email,
      isActive: true,
      firstName: updated?.firstName || "",
      lastName:  updated?.lastName || "",
      membershipStatus: updated?.membershipStatus,
      membershipType: updated?.plan?.tier,
    });
  } catch (e) {
    return serverError(e);
  }
});

// delete a member entirely — no soft delete here
export const DELETE = withAdmin(async (_req, { params }) => {
  try {
    await prisma.member.delete({ where: { id: parseInt(params?.id ?? "") } });
    return ok({ message: "Member deleted" });
  } catch (e) {
    return serverError(e);
  }
});