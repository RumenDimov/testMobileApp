import { type SQLiteDatabase } from 'expo-sqlite';

export type ProgressRow = {
  id: string;
  topic_id: string;
  attempted_at: string;
  score_correct: number;
  score_total: number;
  is_mock_exam: number;
};

export async function saveProgress(
  db: SQLiteDatabase,
  topicId: string,
  scoreCorrect: number,
  scoreTotal: number,
  isMockExam: boolean,
): Promise<string> {
  const id = `prog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const attemptedAt = new Date().toISOString();

  await db.runAsync(
    'INSERT INTO progress (id, topic_id, attempted_at, score_correct, score_total, is_mock_exam) VALUES (?, ?, ?, ?, ?, ?);',
    [id, topicId, attemptedAt, scoreCorrect, scoreTotal, isMockExam ? 1 : 0],
  );

  return id;
}

export async function getProgressByTopic(
  db: SQLiteDatabase,
  topicId: string,
): Promise<ProgressRow[]> {
  return db.getAllAsync<ProgressRow>(
    'SELECT id, topic_id, attempted_at, score_correct, score_total, is_mock_exam FROM progress WHERE topic_id = ? ORDER BY attempted_at DESC;',
    [topicId],
  );
}
