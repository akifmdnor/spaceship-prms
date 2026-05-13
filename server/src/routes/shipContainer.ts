import type { TierStrategy } from "../domain/TierStrategy.js";
import type { CrewLeadRegistry } from "../domain/CrewLeadRegistry.js";
import type { AdminService } from "../services/AdminService.js";
import type { AuditLogService } from "../services/AuditLogService.js";
import type { ResourceService } from "../services/ResourceService.js";
import type {
  IAuditLogRepository,
  IUserRepository,
  IResourceRepository
} from "../repositories/interfaces.js";

export interface ShipContainer {
  tierStrategy: TierStrategy;
  users: IUserRepository;
  resources: IResourceRepository;
  audit: IAuditLogRepository;
  crewRegistry: CrewLeadRegistry;
  resourceService: ResourceService;
  adminService: AdminService;
  auditService: AuditLogService;
}
