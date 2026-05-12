
import { MembershipType } from "@prisma/client";

import { prisma } from "../../lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // ── Membership Plans (required for registration to work) ──
  const plans = await Promise.all([
    prisma.membershipPlan.upsert({
      where: { tier: MembershipType.BASIC },
      update: {},
      create: {
        tier: MembershipType.BASIC,
        name: "Basic",
        price: 99.00,
        description: "Open access to the floor.",
        features: ["24/7 Open Gym Access", "Standard Equipment", "Locker Room Access", "1 Guest Pass/Month"],
        isFeatured: false,
      }
    }),
    prisma.membershipPlan.upsert({
      where: { tier: MembershipType.STANDARD },
      update: {},
      create: {
        tier: MembershipType.STANDARD,
        name: "Standard",
        price: 149.00,
        description: "For the dedicated athlete.",
        features: ["24/7 Open Gym Access", "All Premium Equipment", "Recovery Zone Access", "Unlimited Classes", "3 Guest Passes/Month"],
        isFeatured: true,
      }
    }),
    prisma.membershipPlan.upsert({
      where: { tier: MembershipType.PREMIUM },
      update: {},
      create: {
        tier: MembershipType.PREMIUM,
        name: "Premium",
        price: 299.00,
        description: "The elite standard.",
        features: ["Everything in Standard", "2 Personal Training Sessions", "Custom Nutrition Plan", "Priority Class Booking"],
        isFeatured: false,
      }
    }),
  ]);
  console.log(`✅ ${plans.length} Membership Plans ready`);

  // ── Admin User ──────────────────────────────────────────────
  const adminEmail = "admin@spartangym.com";
  const adminPassword = "admin123";

  const existing = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.admin.create({
      data: {
        email: adminEmail,
        password: adminPassword,
        firstName: "Admin",
        lastName: "Spartan",
        phone: "",
      },
    });
    console.log(`✅ Admin created: ${adminEmail} (Pass: ${adminPassword})`);
  } else {
    // Update existing admin to use plain text password
    await prisma.admin.update({
      where: { email: adminEmail },
      data: { password: adminPassword }
    });
    console.log(`ℹ️  Admin already exists, updated to plain text password: ${adminEmail}`);
  }

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
