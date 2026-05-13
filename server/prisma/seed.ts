import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { SEED_ACCOUNTS, SEED_AUDIT_MESSAGES, SEED_RESOURCES } from "./seedData.js";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.resourceUsageEvent.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();

  const rounds = 10;
  for (const u of SEED_ACCOUNTS) {
    const passwordHash = await bcrypt.hash(u.password, rounds);
    await prisma.user.create({
      data: {
        id: u.id,
        email: u.email,
        passwordHash,
        name: u.name,
        tier: u.tier,
        isAdmin: u.isAdmin,
        role: u.role
      }
    });
  }

  for (const r of SEED_RESOURCES) {
    await prisma.resource.create({
      data: {
        id: r.id,
        name: r.name,
        minRequiredTier: r.minRequiredTier,
        usageCount: r.usageCount,
        capacityPercent: r.capacityPercent,
        facilityBonus: r.facilityBonus
      }
    });
  }

  let base = Date.now();
  for (const line of SEED_AUDIT_MESSAGES) {
    base -= 60_000;
    await prisma.auditLog.create({
      data: {
        id: randomUUID(),
        ts: new Date(base),
        severity: line.severity,
        message: line.message
      }
    });
  }

  console.log("[seed] Users, resources, and audit log seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
