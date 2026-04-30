/**
 * Test setup for backend suites.
 * Loads test env, checks DB connectivity and exposes a DB reset helper.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const envPath = path.resolve(__dirname, '..', '.env.test');
dotenv.config({ path: envPath, override: true });

const prisma = new PrismaClient();

afterAll(async () => {
  await prisma.$disconnect();
});

export async function assertTestDatabaseConnection(timeoutMs = 5000): Promise<void> {
  let timeoutRef: NodeJS.Timeout | null = null;
  try {
    await Promise.race([
      prisma.$executeRaw`SELECT 1`,
      new Promise((_, reject) => {
        timeoutRef = setTimeout(() => reject(new Error('Timeout')), timeoutMs);
      }),
    ]);
  } catch (error) {
    throw new Error(
      `Test DB unavailable. Ensure postgres-test is up and .env.test is correct. ` +
        `Current DATABASE_URL=${process.env.DATABASE_URL || '<undefined>'}. ` +
        `Root cause: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    if (timeoutRef) {
      clearTimeout(timeoutRef);
    }
  }
}

/**
 * Reset all public tables except migration history.
 */
export async function resetDatabase() {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> '_prisma_migrations'
  `;

  if (tables.length === 0) {
    return;
  }

  const tableList = tables.map(({ tablename }) => `"${tablename.replace(/"/g, '""')}"`).join(', ');

  await prisma.$executeRawUnsafe('SET session_replication_role = replica;');
  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE;`);
  } finally {
    await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');
  }
}

export function getTestDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || '';
  if (!url.includes('test')) {
    console.warn("DATABASE_URL does not contain 'test'. Verify .env.test configuration.");
  }
  return url;
}

export { prisma };
