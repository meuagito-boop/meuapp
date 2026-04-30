CREATE TYPE "PushPlatform" AS ENUM ('ANDROID', 'IOS');
CREATE TYPE "PushProvider" AS ENUM ('SNS');
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'PUSH', 'EMAIL');
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'DISABLED');

ALTER TABLE "Notification"
ADD COLUMN "entityType" TEXT,
ADD COLUMN "entityId" TEXT,
ADD COLUMN "payload" JSONB;

CREATE TABLE "PushToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "PushPlatform" NOT NULL,
    "provider" "PushProvider" NOT NULL DEFAULT 'SNS',
    "deviceToken" TEXT NOT NULL,
    "endpointArn" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastValidatedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NotificationDelivery" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT,
    "userId" TEXT NOT NULL,
    "pushTokenId" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "provider" "PushProvider",
    "status" "NotificationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "externalMessageId" TEXT,
    "errorMessage" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PushToken_deviceToken_key" ON "PushToken"("deviceToken");
CREATE INDEX "PushToken_userId_isActive_idx" ON "PushToken"("userId", "isActive");
CREATE INDEX "PushToken_platform_isActive_idx" ON "PushToken"("platform", "isActive");
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
CREATE INDEX "NotificationDelivery_notificationId_idx" ON "NotificationDelivery"("notificationId");
CREATE INDEX "NotificationDelivery_userId_status_idx" ON "NotificationDelivery"("userId", "status");
CREATE INDEX "NotificationDelivery_pushTokenId_idx" ON "NotificationDelivery"("pushTokenId");

ALTER TABLE "PushToken"
ADD CONSTRAINT "PushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NotificationDelivery"
ADD CONSTRAINT "NotificationDelivery_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "NotificationDelivery"
ADD CONSTRAINT "NotificationDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NotificationDelivery"
ADD CONSTRAINT "NotificationDelivery_pushTokenId_fkey" FOREIGN KEY ("pushTokenId") REFERENCES "PushToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;
