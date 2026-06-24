import { type SQLiteDatabase } from 'expo-sqlite';
import type { Qualification } from './schema';
import {
  type ContentTopic,
  ensureQualification,
  seedContentTopic,
} from './seed';
import ccStandard1 from '../../docs/questions/cc-standard-1.json';
import ccStandard2 from '../../docs/questions/cc-standard-2.json';
import ccStandard3 from '../../docs/questions/cc-standard-3.json';
import ccStandard4 from '../../docs/questions/cc-standard-4.json';
import ccStandard5 from '../../docs/questions/cc-standard-5.json';
import ccStandard6 from '../../docs/questions/cc-standard-6.json';
import ccStandard7 from '../../docs/questions/cc-standard-7.json';
import ccStandard8 from '../../docs/questions/cc-standard-8.json';
import ccStandard9 from '../../docs/questions/cc-standard-9.json';
import ccStandard10 from '../../docs/questions/cc-standard-10.json';
import ccStandard11 from '../../docs/questions/cc-standard-11.json';
import ccStandard12 from '../../docs/questions/cc-standard-12.json';
import ccStandard13 from '../../docs/questions/cc-standard-13.json';
import ccStandard14 from '../../docs/questions/cc-standard-14.json';
import ccStandard15 from '../../docs/questions/cc-standard-15.json';
import ccStandard16 from '../../docs/questions/cc-standard-16.json';

const CARE_CERTIFICATE: Qualification = {
  id: 'care-certificate',
  title: 'Care Certificate',
  description:
    'The 16 standards that all health and social care workers must meet before they can work unsupervised.',
  sort_order: 1,
};

type JsonOption = {
  label: string;
  is_correct: boolean;
};

type JsonQuestion = {
  id: string;
  source_criterion: string;
  prompt: string;
  explanation: string;
  options: JsonOption[];
};

type JsonTopic = {
  topic: {
    id: string;
    qualification_id: string;
    title: string;
    summary: string;
    sort_order: number;
    is_free: number;
  };
  questions: JsonQuestion[];
};

function toContentTopic(json: JsonTopic): ContentTopic {
  return {
    topic: json.topic,
    questions: json.questions.map((q) => ({
      id: q.id,
      source_criterion: q.source_criterion,
      prompt: q.prompt,
      explanation: q.explanation,
      options: q.options.map((opt) => ({
        label: opt.label,
        is_correct: opt.is_correct ? 1 : 0,
      })),
    })),
  };
}

const allStandards: JsonTopic[] = [
  ccStandard1 as JsonTopic,
  ccStandard2 as JsonTopic,
  ccStandard3 as JsonTopic,
  ccStandard4 as JsonTopic,
  ccStandard5 as JsonTopic,
  ccStandard6 as JsonTopic,
  ccStandard7 as JsonTopic,
  ccStandard8 as JsonTopic,
  ccStandard9 as JsonTopic,
  ccStandard10 as JsonTopic,
  ccStandard11 as JsonTopic,
  ccStandard12 as JsonTopic,
  ccStandard13 as JsonTopic,
  ccStandard14 as JsonTopic,
  ccStandard15 as JsonTopic,
  ccStandard16 as JsonTopic,
];

export async function seedAllContent(db: SQLiteDatabase): Promise<void> {
  await ensureQualification(db, CARE_CERTIFICATE);
  for (const standard of allStandards) {
    await seedContentTopic(db, toContentTopic(standard));
  }

  // Seed a synthetic topic for mock exam progress records
  await db.runAsync(
    `INSERT OR IGNORE INTO topics (id, qualification_id, title, summary, sort_order, is_free)
     VALUES (?, ?, ?, ?, ?, ?);`,
    ['mock-exam', 'care-certificate', 'Mock Exam', 'Mixed-topic mock exam', 99, 0],
  );
}
