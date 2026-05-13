import type { Express } from "express";
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { PrismaClient } from "@prisma/client";
import { TIER_LABEL } from "../domain/TierLevel.js";
import { TierLevel } from "../domain/TierLevel.js";
import { createRequireAuth } from "../middleware/requireAuth.js";

const loginSchema = (body: unknown): { email: string; password: string } | null => {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  if (typeof o.email !== "string" || typeof o.password !== "string") return null;
  return { email: o.email, password: o.password };
};

export function createAuthRouter(prisma: PrismaClient, jwtSecret: string): Router {
  const r = Router();
  const requireAuth = createRequireAuth(jwtSecret);

  r.post("/login", async (req, res, next) => {
    try {
      const parsed = loginSchema(req.body);
      if (!parsed) {
        return res.status(400).json({ error: "Email and password required" });
      }
      const email = parsed.email.toLowerCase().trim();
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const pwOk = await bcrypt.compare(parsed.password, user.passwordHash);
      if (!pwOk) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ sub: user.id, email: user.email }, jwtSecret, {
        expiresIn: "8h"
      });

      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tier: user.tier,
          tierLabel: TIER_LABEL[user.tier as TierLevel],
          isAdmin: user.isAdmin,
          role: user.role
        }
      });
    } catch (e) {
      next(e);
    }
  });

  r.get("/me", requireAuth, async (req, res, next) => {
    try {
      const id = req.authUserId!;
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      return res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        tier: user.tier,
        tierLabel: TIER_LABEL[user.tier as TierLevel],
        isAdmin: user.isAdmin,
        role: user.role
      });
    } catch (e) {
      next(e);
    }
  });

  return r;
}

/** Public demo account list for login screen hints (matches seed). */
export function mountDemoAccountsHint(app: Express): void {
  app.get("/api/meta/demo-accounts", (_req, res) => {
    res.json({
      accounts: [
        { email: "afni@prms.local", password: "silver-demo", role: "Silver passenger" },
        { email: "zoe@prms.local", password: "silver-demo", role: "Silver passenger" },
        { email: "everest@prms.local", password: "admin-demo", role: "Admin (full roster)" },
        { email: "jack@prms.local", password: "gold-demo", role: "Gold passenger" },
        { email: "rhea@prms.local", password: "crew-demo", role: "Crew lead" },
        { email: "morgan@prms.local", password: "crew-demo", role: "Crew lead" },
        { email: "kim@prms.local", password: "crew-demo", role: "Crew lead" }
      ]
    });
  });
}
