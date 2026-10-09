-- Existing posts retain their identities, slugs, content, and relations.
CREATE TYPE "ContentKind" AS ENUM ('blog', 'project');
ALTER TABLE "Post" ADD COLUMN "kind" "ContentKind" NOT NULL DEFAULT 'blog',
                   ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX "Post_kind_status_publishedAt_idx" ON "Post"("kind", "status", "publishedAt" DESC);

CREATE TABLE "SiteStats" (
  "id" TEXT NOT NULL DEFAULT 'site',
  "visitCount" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "SiteStats_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "VisitEvent" (
  "id" TEXT NOT NULL,
  "visitorHash" TEXT NOT NULL,
  "targetKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VisitEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "VisitEvent_visitorHash_targetKey_key" ON "VisitEvent"("visitorHash", "targetKey");
CREATE INDEX "VisitEvent_createdAt_idx" ON "VisitEvent"("createdAt");
