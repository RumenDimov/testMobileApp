import { type SQLiteDatabase } from 'expo-sqlite';

export type ProgressRow = {
  id: string;
  topic_id: string;
  attempted_at: string;
  score_correct: number;
  score_total: number;
  is_mock_exam: number;
};

export type OverallStats = {
  total_attempts: number;
  topics_attempted: number;
  questions_answered: number;
  average_score_pct: number;
};

export type TopicProgressSummary = {
  topic_id: string;
  topic_title: string;
  is_free: number;
  attempts: number;
  best_correct: number;
  best_total: number;
  last_attempted_at: string;
};

export type MockExamStats = {
  attempts: number;
  best_correct: number;
  best_total: number;
};

export async function saveProgress(
  db: SQLiteDatabase,
  topicId: string,
  scoreCorrect: number,
  scoreTotal: number,
  isMockExam: boolean,
): Promise<string> {
  const id = `prog-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
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

export async function getOverallStats(
  db: SQLiteDatabase,
): Promise<OverallStats | undefined> {
  const row = await db.getFirstAsync<OverallStats>(
    `SELECT
       COUNT(*) as total_attempts,
       COUNT(DISTINCT topic_id) as topics_attempted,
       COALESCE(SUM(score_total), 0) as questions_answered,
       CASE WHEN COUNT(*) > 0
         THEN ROUND(AVG(CAST(score_correct AS REAL) / CAST(score_total AS REAL)) * 100)
         ELSE 0
       END as average_score_pct
     FROM progress
     WHERE is_mock_exam = 0;`,
  );
  return row ?? undefined;
}

export async function getAllTopicProgress(
  db: SQLiteDatabase,
): Promise<TopicProgressSummary[]> {
  return db.getAllAsync<TopicProgressSummary>(
    `SELECT
       t.id as topic_id,
       t.title as topic_title,
       t.is_free,
       COUNT(p.id) as attempts,
       COALESCE(
         (SELECT score_correct FROM progress p2
          WHERE p2.topic_id = t.id AND p2.is_mock_exam = 0
          ORDER BY CAST(p2.score_correct AS REAL) / CAST(p2.score_total AS REAL) DESC, p2.score_correct DESC
          LIMIT 1),
         0
       ) as best_correct,
       COALESCE(
         (SELECT score_total FROM progress p2
          WHERE p2.topic_id = t.id AND p2.is_mock_exam = 0
          ORDER BY CAST(p2.score_correct AS REAL) / CAST(p2.score_total AS REAL) DESC, p2.score_correct DESC
          LIMIT 1),
         0
       ) as best_total,
       MAX(p.attempted_at) as last_attempted_at
     FROM topics t
     LEFT JOIN progress p ON p.topic_id = t.id AND p.is_mock_exam = 0
     GROUP BY t.id
     ORDER BY t.sort_order;`,
  );
}

export async function getMockExamStats(
  db: SQLiteDatabase,
): Promise<MockExamStats | undefined> {
  const row = await db.getFirstAsync<MockExamStats>(
    `SELECT
       COUNT(*) as attempts,
       COALESCE(
         (SELECT score_correct FROM progress
          WHERE is_mock_exam = 1
          ORDER BY CAST(score_correct AS REAL) / CAST(score_total AS REAL) DESC, score_correct DESC
          LIMIT 1),
         0
       ) as best_correct,
       COALESCE(
         (SELECT score_total FROM progress
          WHERE is_mock_exam = 1
          ORDER BY CAST(score_correct AS REAL) / CAST(score_total AS REAL) DESC, score_correct DESC
          LIMIT 1),
         0
       ) as best_total
     FROM progress
     WHERE is_mock_exam = 1;`,
  );
  return row ?? undefined;
}

export async function getTopicCompletionCount(
  db: SQLiteDatabase,
  topicId: string,
): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM progress WHERE topic_id = ? AND is_mock_exam = 0;',
    [topicId],
  );
  return row?.count ?? 0;
}
