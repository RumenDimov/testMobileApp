import { type SQLiteDatabase } from 'expo-sqlite';
import {
  type Qualification,
  type Topic,
  type Question,
  type AnswerOption,
} from './schema';

export type SeedTopic = {
  topic: Omit<Topic, 'qualification_id'>;
  questions: Array<
    Omit<Question, 'topic_id' | 'id'> & {
      id?: string;
      options: Array<Omit<AnswerOption, 'question_id' | 'id'> & { id?: string }>;
    }
  >;
};

export type SeedBundle = {
  qualification: Omit<Qualification, 'id'> & { id?: string };
  topics: SeedTopic[];
};

function generateId(prefix: string, index: number): string {
  return `${prefix}-${String(index).padStart(3, '0')}`;
}

export async function seedFromBundle(
  db: SQLiteDatabase,
  bundle: SeedBundle,
): Promise<void> {
  const qualId = bundle.qualification.id ?? bundle.qualification.title.toLowerCase().replace(/\s+/g, '-');

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT OR IGNORE INTO qualifications (id, title, description, sort_order) VALUES (?, ?, ?, ?);',
      [qualId, bundle.qualification.title, bundle.qualification.description, bundle.qualification.sort_order],
    );

    let topicIndex = 0;
    let questionIndex = 0;
    let optionIndex = 0;

    for (const seedTopic of bundle.topics) {
      const topicId = seedTopic.topic.id ?? generateId('topic', topicIndex);

      await db.runAsync(
        'INSERT OR IGNORE INTO topics (id, qualification_id, title, summary, sort_order, is_free) VALUES (?, ?, ?, ?, ?, ?);',
        [topicId, qualId, seedTopic.topic.title, seedTopic.topic.summary, seedTopic.topic.sort_order, seedTopic.topic.is_free],
      );

      for (const seedQuestion of seedTopic.questions) {
        const correctCount = seedQuestion.options.filter(
          (opt) => opt.is_correct === 1,
        ).length;
        if (correctCount !== 1) {
          throw new Error(
            `Question "${seedQuestion.prompt}" must have exactly one correct answer, found ${correctCount}`,
          );
        }

        const questionId = seedQuestion.id ?? generateId('q', questionIndex);

        await db.runAsync(
          'INSERT OR IGNORE INTO questions (id, topic_id, source_criterion, prompt, explanation, sort_order) VALUES (?, ?, ?, ?, ?, ?);',
          [questionId, topicId, seedQuestion.source_criterion, seedQuestion.prompt, seedQuestion.explanation, seedQuestion.sort_order],
        );

        for (const seedOption of seedQuestion.options) {
          const optionId = seedOption.id ?? generateId('opt', optionIndex);

          await db.runAsync(
            'INSERT OR IGNORE INTO answer_options (id, question_id, label, is_correct, sort_order) VALUES (?, ?, ?, ?, ?);',
            [optionId, questionId, seedOption.label, seedOption.is_correct, seedOption.sort_order],
          );

          optionIndex++;
        }

        questionIndex++;
      }

      topicIndex++;
    }
  });
}

export async function isSeeded(db: SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM qualifications;',
  );
  return (row?.count ?? 0) > 0;
}
