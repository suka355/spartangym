import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/middleware/withAuth";
import { ok, serverError } from "@/lib/response";

// GET /api/dashboard/admin — Overview stats for admin
export const GET = withAdmin(async () => {
  try {
    const now      = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      newMembersLastMonth,
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      upcomingClasses,
      totalBookingsThisMonth,
      recentMembers,
      membershipBreakdown,
      plans,
    ] = await Promise.all([
      // Total members
      prisma.member.count(),

      // Active memberships
      prisma.member.count({ where: { membershipStatus: "ACTIVE" } }),

      // New members this month
      prisma.member.count({
        where: { joinedAt: { gte: thisMonth } },
      }),

      // New members last month
      prisma.member.count({
        where: { joinedAt: { gte: lastMonth, lt: thisMonth } },
      }),

      // Total revenue (completed payments)
      prisma.payment.aggregate({
        where:  { status: "COMPLETED" },
        _sum:   { amount: true },
      }),

      // Revenue this month
      prisma.payment.aggregate({
        where:  { status: "COMPLETED", paidAt: { gte: thisMonth } },
        _sum:   { amount: true },
      }),

      // Revenue last month
      prisma.payment.aggregate({
        where:  { status: "COMPLETED", paidAt: { gte: lastMonth, lt: thisMonth } },
        _sum:   { amount: true },
      }),

      // Upcoming classes (next 7 days)
      prisma.classSchedule.count({
        where: {
          startsAt:   { gte: now, lte: new Date(now.getTime() + 7 * 86400000) },
          isCancelled: false,
        },
      }),

      // Bookings this month
      prisma.booking.count({
        where: { bookedAt: { gte: thisMonth }, status: { not: "CANCELLED" } },
      }),

      // Recent 5 members
      prisma.member.findMany({
        orderBy: { joinedAt: "desc" },
        take:    5,
        include: {
          plan: { select: { tier: true } }
        },
      }),

      // Membership type breakdown
      prisma.member.groupBy({
        by:     ["planId"],
        where:  { membershipStatus: "ACTIVE" },
        _count: { planId: true },
      }),
      
      // Plans to map planId to tier
      prisma.membershipPlan.findMany()
    ]);

    const memberGrowth = newMembersLastMonth
      ? (((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) * 100).toFixed(1)
      : "0";

    const revThis  = Number(revenueThisMonth._sum.amount  || 0);
    const revLast  = Number(revenueLastMonth._sum.amount  || 0);
    const revenueGrowth = revLast
      ? (((revThis - revLast) / revLast) * 100).toFixed(1)
      : "0";

    const recentMembersFormatted = recentMembers.map(u => ({
      id: u.id,
      email: u.email,
      createdAt: u.joinedAt,
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      membershipStatus: u.membershipStatus || "PENDING",
      membershipType: u.plan?.tier || "NONE"
    }));

    const membershipBreakdownFormatted = membershipBreakdown.map(b => ({
      membershipType: plans.find(p => p.id === b.planId)?.tier || "NONE",
      _count: { membershipType: b._count.planId }
    }));

    return ok({
      stats: {
        totalMembers,
        activeMembers,
        newMembersThisMonth,
        memberGrowth: `${memberGrowth}%`,
        totalRevenue:      Number(totalRevenue._sum.amount || 0),
        revenueThisMonth:  revThis,
        revenueGrowth:     `${revenueGrowth}%`,
        upcomingClasses,
        totalBookingsThisMonth,
      },
      membershipBreakdown: membershipBreakdownFormatted,
      recentMembers: recentMembersFormatted,
    });
  } catch (e) {
    return serverError(e);
  }
});