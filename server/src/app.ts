import cors from "cors";
import express from "express";
import { CrewLeadRegistry } from "./domain/CrewLeadRegistry.js";
import { TierStrategy } from "./domain/TierStrategy.js";
import { InMemoryUsageEventRepository } from "./repositories/InMemoryRepositories.js";
import {
  PrismaAuditLogRepository,
  PrismaResourceRepository,
  PrismaUserRepository,
  PrismaUsageEventRepository
} from "./repositories/prismaRepositories.js";
import { AdminService } from "./services/AdminService.js";
import { AuditLogService } from "./services/AuditLogService.js";
import { ResourceService } from "./services/ResourceService.js";
import type { ShipContainer } from "./routes/shipContainer.js";
import { createApiRouter } from "./routes/api.js";
import { createAuthRouter, mountDemoAccountsHint } from "./routes/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { createRequireAuth } from "./middleware/requireAuth.js";
import { getPrisma } from "./lib/prisma.js";
import { mountWebClientDistIfPresent } from "./serveWebDist.js";

/**
 * In-memory mode (tests): pass `users`, `resources`, and `audit` overrides together.
 * Database mode: set DATABASE_URL and run migrations + seed.
 */
export function createApp(overrides?: Partial<ShipContainer>) {
  const inMemoryMode = Boolean(overrides?.users && overrides?.resources && overrides?.audit);

  if (!inMemoryMode && !process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Copy server/.env.example to server/.env, run docker compose up -d, then npm run db:migrate && npm run db:seed (from server/)."
    );
  }

  const jwtSecret = process.env.JWT_SECRET ?? "dev-jwt-insecure-change-in-prod";
  const prisma = inMemoryMode ? null : getPrisma();

  const tierStrategy = overrides?.tierStrategy ?? new TierStrategy();
  const users = overrides?.users ?? new PrismaUserRepository(prisma!);
  const resources = overrides?.resources ?? new PrismaResourceRepository(prisma!);
  const audit = overrides?.audit ?? new PrismaAuditLogRepository(prisma!);
  const crewRegistry = overrides?.crewRegistry ?? CrewLeadRegistry.getInstance(3);

  const usageEvents =
    overrides?.usageEvents ??
    (inMemoryMode ? new InMemoryUsageEventRepository() : new PrismaUsageEventRepository(prisma!));

  const resourceService =
    overrides?.resourceService ??
    new ResourceService(tierStrategy, users, resources, audit, usageEvents);
  const adminService = overrides?.adminService ?? new AdminService(users, audit, crewRegistry);
  const auditService = overrides?.auditService ?? new AuditLogService(audit);

  const container: ShipContainer = {
    tierStrategy,
    users,
    resources,
    audit,
    usageEvents,
    crewRegistry,
    resourceService,
    adminService,
    auditService
  };

  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  mountDemoAccountsHint(app);

  if (prisma) {
    app.use("/api/auth", createAuthRouter(prisma, jwtSecret));
  }

  const requireAuth = createRequireAuth(jwtSecret);
  app.use("/api", createApiRouter(container, { requireAuth }));

  mountWebClientDistIfPresent(app);

  app.use(errorHandler);

  return app;
}

export type { ShipContainer } from "./routes/shipContainer.js";
