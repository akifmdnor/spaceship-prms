-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "min_required_tier" INTEGER NOT NULL,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "capacity_percent" INTEGER NOT NULL DEFAULT 0,
    "facility_bonus" TEXT,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_ts_idx" ON "audit_logs"("ts" DESC);
