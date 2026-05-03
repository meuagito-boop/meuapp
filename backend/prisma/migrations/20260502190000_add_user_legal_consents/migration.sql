ALTER TABLE "User"
ADD COLUMN "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN "termsVersion" TEXT,
ADD COLUMN "privacyPolicyAcceptedAt" TIMESTAMP(3),
ADD COLUMN "privacyPolicyVersion" TEXT;
