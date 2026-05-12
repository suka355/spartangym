import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/middleware/withAuth";
import { ok, serverError } from "@/lib/response";

// public — landing page needs this to show pricing
export async function GET() {
  try {
    const plans = await prisma.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" }
    });
    // Decimal doesn't serialize to JSON nicely, cast it
    const serialized = plans.map(p => ({ ...p, price: Number(p.price) }));
    return ok(serialized);
  } catch (e) {
    return serverError(e);
  }
}

// update a plan's price/features — admin only
export const PUT = withAdmin(async (req) => {
  try {
    const { id, price, name, description, features } = await req.json();

    const plan = await prisma.membershipPlan.update({
      where: { id: parseInt(id) },
      data: {
        ...(price !== undefined && { price }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(features !== undefined && { features }),
      }
    });

    return ok({ ...plan, price: Number(plan.price) });
  } catch (e) {
    return serverError(e);
  }
});
