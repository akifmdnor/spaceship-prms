import type { NextFunction, Request, Response } from "express";
import { CrewLeadRegistry } from "../domain/CrewLeadRegistry.js";
import type { IUserRepository } from "../repositories/interfaces.js";

/** Enforces the Rule of Three before a crew-lead promotion is processed */
export function createRuleOfThreeMiddleware(deps: {
  users: IUserRepository;
  registry: CrewLeadRegistry;
}) {
  const { users, registry } = deps;

  return async function ruleOfThree(_req: Request, res: Response, next: NextFunction) {
    const count = await users.countCrewLeads();
    if (!registry.canRegisterCrewLead(count)) {
      return res.status(403).json({
        error: "Rule of Three: maximum crew leads reached (3 slots full)"
      });
    }
    next();
  };
}
