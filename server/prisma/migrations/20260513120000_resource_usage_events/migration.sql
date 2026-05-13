-- CreateTable
CREATE TABLE "resource_usage_events" (
    "id" UUID NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "user_tier" INTEGER NOT NULL,
    "outcome" TEXT NOT NULL,

    CONSTRAINT "resource_usage_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resource_usage_events_user_id_ts_idx" ON "resource_usage_events"("user_id", "ts" DESC);

-- CreateIndex
CREATE INDEX "resource_usage_events_outcome_ts_idx" ON "resource_usage_events"("outcome", "ts" DESC);

-- AddForeignKey
ALTER TABLE "resource_usage_events" ADD CONSTRAINT "resource_usage_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_usage_events" ADD CONSTRAINT "resource_usage_events_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
