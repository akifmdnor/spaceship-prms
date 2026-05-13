import type { IAuditLogRepository } from "../repositories/interfaces.js";

export class AuditLogService {
  constructor(private readonly audit: IAuditLogRepository) {}

  list(limit = 100) {
    return this.audit.findRecent(limit);
  }

  search(query: string) {
    return this.audit.search(query);
  }
}
