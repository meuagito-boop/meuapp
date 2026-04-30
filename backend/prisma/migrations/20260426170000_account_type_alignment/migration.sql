UPDATE "User"
SET "profileType" = 'USER'
WHERE "profileType" = 'PESSOA_FISICA';

UPDATE "User"
SET "profileType" = 'ESTABLISHMENT'
WHERE "profileType" = 'PESSOA_JURIDICA';

UPDATE "User"
SET "profileType" = 'USER'
WHERE "profileType" IS NULL OR BTRIM("profileType") = '';

ALTER TABLE "User"
ALTER COLUMN "profileType" SET DEFAULT 'USER';
