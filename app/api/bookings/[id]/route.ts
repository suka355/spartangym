import { prisma } from "@/lib/prisma";
import { withAuth } from "@/middleware/withAuth";
import { ok, err, notFound, serverError } from "@/lib/response";

export const PATCH = withAuth(async (req, { user, params }) => {
  try {
    const id = parseInt(params?.id ?? "");
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) return notFound("Booking");

    if (user.role !== "ADMIN" && booking.memberId !== user.userId)
      return err("Forbidden", 403);

    if (booking.status === "CANCELLED")
      return err("Booking is already cancelled");

    const updated = await prisma.booking.update({
      where: { id },
      data:  { status: "CANCELLED", cancelledAt: new Date() },
    });

    return ok(updated);
  } catch (e) {
    return serverError(e);
  }
});