import { prisma } from "@/lib/prisma";
import { withAuth } from "@/middleware/withAuth";
import { ok, err, serverError } from "@/lib/response";
import { addMonths } from "date-fns";

export const GET = withAuth(async (req, { user }) => {
  try {
    const isAdmin = user.role === "ADMIN";

    const payments = isAdmin
      ? await prisma.payment.findMany({
          include: {
            member: {
              select: {
                email: true,
                firstName: true, 
                lastName: true
              }
            },
          },
          orderBy: { createdAt: "desc" },
          take:    50,
        })
      : await prisma.payment.findMany({
          where: { memberId: user.userId },
          orderBy: { createdAt: "desc" },
        });

    const serialized = payments.map(p => ({
      ...p,
      amount: Number(p.amount),
      ...(isAdmin && "member" in p ? {
        user: {
          email: (p as any).member.email,
          firstName: (p as any).member.firstName || "",
          lastName:  (p as any).member.lastName || "",
        }
      } : {})
    }));

    return ok(serialized);
  } catch (e) {
    return serverError(e);
  }
});

export const POST = withAuth(async (req, { user }) => {
  try {
    const { planId, method } = await req.json();
    if (!planId) return err("planId is required");
    const planIdInt = parseInt(planId);

    const plan = await prisma.membershipPlan.findUnique({ where: { id: planIdInt } });
    if (!plan) return err("Invalid plan");

    const price = Number(plan.price);

    const result = await prisma.$transaction(async (tx) => {
      const updatedProfile = await tx.member.update({
        where: { id: user.userId },
        data: {
          planId: planIdInt,
          membershipStatus: "ACTIVE",
          membershipStartDate: new Date(),
          membershipEndDate: addMonths(new Date(), 1),
          membershipAutoRenew: true,
        }
      });

      const payment = await tx.payment.create({
        data: {
          memberId:  user.userId,
          amount:  price,
          method:  method || "CREDIT_CARD",
          status:  "COMPLETED",
          paidAt:  new Date(),
        },
      });

      return { 
        profile: { ...updatedProfile },
        payment: { ...payment, amount: Number(payment.amount) }
      };
    });

    return ok(result, 201);
  } catch (e) {
    return serverError(e);
  }
});