import { type SQLiteDatabase } from 'expo-sqlite';

let dbInstance: SQLiteDatabase | undefined;

export function setDb(db: SQLiteDatabase): void {
  dbInstance = db;
}

export function getDb(): SQLiteDatabase {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call setDb() before accessing.');
  }
  return dbInstance;
}
