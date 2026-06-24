import { type SQLiteDatabase } from 'expo-sqlite';

export const CURRENT_SCHEMA_VERSION = 1;

export const CREATE_QUALIFICATIONS = `CREATE TABLE IF NOT EXISTS qualifications (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  sort_order    INTEGER NOT NULL
);`;

export const CREATE_TOPICS = `CREATE TABLE IF NOT EXISTS topics (
  id              TEXT PRIMARY KEY,
  qualification_id TEXT NOT NULL REFERENCES qualifications(id),
  title           TEXT NOT NULL,
  summary         TEXT NOT NULL,
  sort_order      INTEGER NOT NULL,
  is_free         INTEGER NOT NULL DEFAULT 0
);`;

export const CREATE_QUESTIONS = `CREATE TABLE IF NOT EXISTS questions (
  id              TEXT PRIMARY KEY,
  topic_id        TEXT NOT NULL REFERENCES topics(id),
  source_criterion TEXT NOT NULL,
  prompt          TEXT NOT NULL,
  explanation     TEXT NOT NULL,
  sort_order      INTEGER NOT NULL
);`;

export const CREATE_ANSWER_OPTIONS = `CREATE TABLE IF NOT EXISTS answer_options (
  id            TEXT PRIMARY KEY,
  question_id   TEXT NOT NULL REFERENCES questions(id),
  label         TEXT NOT NULL,
  is_correct    INTEGER NOT NULL DEFAULT 0,
  sort_order    INTEGER NOT NULL
);`;

export const CREATE_PROGRESS = `CREATE TABLE IF NOT EXISTS progress (
  id              TEXT PRIMARY KEY,
  topic_id        TEXT NOT NULL REFERENCES topics(id),
  attempted_at    TEXT NOT NULL,
  score_correct   INTEGER NOT NULL,
  score_total     INTEGER NOT NULL,
  is_mock_exam    INTEGER NOT NULL DEFAULT 0
);`;

export const ALL_TABLES = [
  CREATE_QUALIFICATIONS,
  CREATE_TOPICS,
  CREATE_QUESTIONS,
  CREATE_ANSWER_OPTIONS,
  CREATE_PROGRESS,
] as const;

export type Qualification = {
  id: string;
  title: string;
  description: string;
  sort_order: number;
};

export type Topic = {
  id: string;
  qualification_id: string;
  title: string;
  summary: string;
  sort_order: number;
  is_free: number;
};

export type Question = {
  id: string;
  topic_id: string;
  source_criterion: string;
  prompt: string;
  explanation: string;
  sort_order: number;
};

export type AnswerOption = {
  id: string;
  question_id: string;
  label: string;
  is_correct: number;
  sort_order: number;
};

export type Progress = {
  id: string;
  topic_id: string;
  attempted_at: string;
  score_correct: number;
  score_total: number;
  is_mock_exam: number;
};

export async function initializeSchema(db: SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.execAsync('PRAGMA foreign_keys = ON;');
    for (const statement of ALL_TABLES) {
      await db.execAsync(statement);
    }
    await db.execAsync(`PRAGMA user_version = ${CURRENT_SCHEMA_VERSION};`);
  });
}
