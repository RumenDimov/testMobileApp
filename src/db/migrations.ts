import { type SQLiteDatabase } from 'expo-sqlite';
import { CURRENT_SCHEMA_VERSION, initializeSchema } from './schema';

const MIGRATIONS: Record<number, (db: SQLiteDatabase) => Promise<void>> = {
  // Future migrations go here. Example:
  // 2: async (db) => { await db.execAsync('ALTER TABLE ...'); },
};

async function getCurrentVersion(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;',
  );
  return row?.user_version ?? 0;
}

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const currentVersion = await getCurrentVersion(db);

  if (currentVersion === 0) {
    await initializeSchema(db);
    return;
  }

  for (let v = currentVersion + 1; v <= CURRENT_SCHEMA_VERSION; v++) {
    const migration = MIGRATIONS[v];
    if (migration) {
      await db.withTransactionAsync(async () => {
        await migration(db);
        await db.execAsync(`PRAGMA user_version = ${v};`);
      });
    }
  }
}
