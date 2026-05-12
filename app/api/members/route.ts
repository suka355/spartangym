import { prisma } from "@/lib/prisma";
import { withAdmin } from "@/middleware/withAuth";
import { ok, err, serverError } from "@/lib/response";

// list all members with search + pagination
export const GET = withAdmin(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page   = parseInt(searchParams.get("page")  || "1");
    const limit  = parseInt(searchParams.get("limit") || "20");
    const skip   = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName:  { contains: search, mode: "insensitive" as const } },
          ]
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        select: {
          id:        true,
          email:     true,
          firstName: true,
          lastName:  true,
          phone:     true,
          joinedAt:  true,
          membershipStatus: true,
          membershipEndDate: true,
          plan: {
            select: {
              tier: true
            }
          }
        },
        orderBy: { joinedAt: "desc" },
      }),
      prisma.member.count({ where }),
    ]);

    const members = users.map(u => ({
      id: u.id,
      email: u.email,
      isActive: true, // no soft-delete on members yet, so always true
      createdAt: u.joinedAt,
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      phone: u.phone || "",
      joinedAt: u.joinedAt,
      membershipStatus: u.membershipStatus || "PENDING",
      membershipEndDate: u.membershipEndDate || null,
      membershipType: u.plan?.tier || "NONE"
    }));

    return ok({ members, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (e) {
    return serverError(e);
  }
});

// admin can manually add a member (e.g. walk-ins)
export const POST = withAdmin(async (req) => {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, password = "Spartan123!" } = body;

    if (!firstName || !lastName || !email) {
      return err("First name, last name, and email are required");
    }

    const existing = await prisma.member.findUnique({ where: { email } });
    if (existing) return err("Email already in use");

    const user = await prisma.member.create({
      data: {
        email,
        password: password, // no hashing for now, keeping it simple locally
        firstName,
        lastName,
        phone
      }
    });

    return ok({ id: user.id, email: user.email, firstName: user.firstName }, 201);
  } catch (e) {
    return serverError(e);
  }
});