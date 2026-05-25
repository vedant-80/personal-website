-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM ('pending', 'confirmed', 'unsubscribed');

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "excerpt" TEXT,
    "coverImage" TEXT,
    "content" JSONB NOT NULL,
    "contentPlaintext" TEXT,
    "readingTimeMinutes" INTEGER,
    "lastEmailedAt" TIMESTAMP(3),
    "lastEmailedContentHash" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flair" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Flair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostFlair" (
    "postId" TEXT NOT NULL,
    "flairId" TEXT NOT NULL,

    CONSTRAINT "PostFlair_pkey" PRIMARY KEY ("postId","flairId")
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "status" "SubscriberStatus" NOT NULL DEFAULT 'pending',
    "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "source" TEXT,
    "signupIp" TEXT,
    "userAgent" TEXT,
    "confirmTokenHash" TEXT,
    "confirmTokenExpiresAt" TIMESTAMP(3),
    "unsubscribeTokenHash" TEXT,
    "lastEmailSentAt" TIMESTAMP(3),

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Flair_slug_key" ON "Flair"("slug");

-- CreateIndex
CREATE INDEX "PostFlair_flairId_idx" ON "PostFlair"("flairId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- CreateIndex
CREATE INDEX "Subscriber_status_idx" ON "Subscriber"("status");

-- AddForeignKey
ALTER TABLE "PostFlair" ADD CONSTRAINT "PostFlair_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostFlair" ADD CONSTRAINT "PostFlair_flairId_fkey" FOREIGN KEY ("flairId") REFERENCES "Flair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
