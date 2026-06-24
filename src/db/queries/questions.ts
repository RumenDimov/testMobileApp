import { type SQLiteDatabase } from 'expo-sqlite';
import type { AnswerOption, Question, Topic } from '../schema';

export type QuestionWithOptions = Question & {
  options: AnswerOption[];
};

export type TopicSummary = Topic & {
  question_count: number;
};

export async function getTopic(
  db: SQLiteDatabase,
  topicId: string,
): Promise<Topic | undefined> {
  const row = await db.getFirstAsync<Topic>(
    'SELECT id, qualification_id, title, summary, sort_order, is_free FROM topics WHERE id = ?;',
    [topicId],
  );
  return row ?? undefined;
}

export async function getTopicWithCount(
  db: SQLiteDatabase,
  topicId: string,
): Promise<TopicSummary | undefined> {
  const row = await db.getFirstAsync<TopicSummary>(
    `SELECT t.id, t.qualification_id, t.title, t.summary, t.sort_order, t.is_free,
            COUNT(q.id) as question_count
     FROM topics t
     LEFT JOIN questions q ON q.topic_id = t.id
     WHERE t.id = ?
     GROUP BY t.id;`,
    [topicId],
  );
  return row ?? undefined;
}

export async function getQuestionsByTopic(
  db: SQLiteDatabase,
  topicId: string,
): Promise<QuestionWithOptions[]> {
  const questions = await db.getAllAsync<Question>(
    'SELECT id, topic_id, source_criterion, prompt, explanation, sort_order FROM questions WHERE topic_id = ? ORDER BY sort_order;',
    [topicId],
  );

  if (questions.length === 0) {
    return [];
  }

  const placeholders = questions.map(() => '?').join(', ');
  const options = await db.getAllAsync<AnswerOption>(
    `SELECT id, question_id, label, is_correct, sort_order
     FROM answer_options WHERE question_id IN (${placeholders})
     ORDER BY sort_order;`,
    questions.map((q) => q.id),
  );

  const byQuestion = new Map<string, AnswerOption[]>();
  for (const option of options) {
    const list = byQuestion.get(option.question_id) ?? [];
    list.push(option);
    byQuestion.set(option.question_id, list);
  }

  return questions.map((question) => ({
    ...question,
    options: byQuestion.get(question.id) ?? [],
  }));
}

export async function getAllTopics(
  db: SQLiteDatabase,
): Promise<TopicSummary[]> {
  return db.getAllAsync<TopicSummary>(
    `SELECT t.id, t.qualification_id, t.title, t.summary, t.sort_order, t.is_free,
            COUNT(q.id) as question_count
     FROM topics t
     LEFT JOIN questions q ON q.topic_id = t.id
     GROUP BY t.id
     ORDER BY t.sort_order;`,
  );
}
