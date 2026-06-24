import { type SQLiteDatabase } from 'expo-sqlite';
import type { Qualification } from './schema';
import {
  type ContentTopic,
  ensureQualification,
  seedContentTopic,
} from './seed';
import ccStandard10 from '../../docs/questions/cc-standard-10.json';

const CARE_CERTIFICATE: Qualification = {
  id: 'care-certificate',
  title: 'Care Certificate',
  description:
    'The 15 standards that all health and social care workers must meet before they can work unsupervised.',
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

export async function seedAllContent(db: SQLiteDatabase): Promise<void> {
  await ensureQualification(db, CARE_CERTIFICATE);
  await seedContentTopic(db, toContentTopic(ccStandard10 as JsonTopic));
}
