import type { SQLiteDatabase } from 'expo-sqlite';
import type { QuestionWithOptions, TopicSummary, TopicBestScore } from '../db/queries/questions';
import type { OverallStats, TopicProgressSummary, MockExamStats } from '../db/queries/progress';

// ---------------------------------------------------------------------------
// Mock data factories — deterministic, reusable across all test files
// ---------------------------------------------------------------------------

export function createMockQuestion(overrides?: Partial<QuestionWithOptions>): QuestionWithOptions {
  return {
    id: 'q-test-1',
    topic_id: 'topic-test-1',
    source_criterion: '1.1',
    prompt: 'What is the primary role of a care worker?',
    explanation: 'To support individuals with their daily needs while promoting independence.',
    sort_order: 1,
    options: [
      { id: 'opt-1', question_id: 'q-test-1', label: 'To support individuals with daily needs', is_correct: 1, sort_order: 1 },
      { id: 'opt-2', question_id: 'q-test-1', label: 'To manage the care home budget', is_correct: 0, sort_order: 2 },
      { id: 'opt-3', question_id: 'q-test-1', label: 'To prescribe medication independently', is_correct: 0, sort_order: 3 },
      { id: 'opt-4', question_id: 'q-test-1', label: 'To enforce rules without question', is_correct: 0, sort_order: 4 },
    ],
    ...overrides,
  };
}

export function createMockQuestions(count: number): QuestionWithOptions[] {
  return Array.from({ length: count }, (_, i) =>
    createMockQuestion({
      id: `q-test-${i + 1}`,
      topic_id: 'topic-test-1',
      prompt: `Test question ${i + 1}?`,
      explanation: `Explanation for question ${i + 1}.`,
      sort_order: i + 1,
      options: [
        { id: `opt-${i * 4 + 1}`, question_id: `q-test-${i + 1}`, label: `Correct answer ${i + 1}`, is_correct: 1, sort_order: 1 },
        { id: `opt-${i * 4 + 2}`, question_id: `q-test-${i + 1}`, label: `Wrong answer A`, is_correct: 0, sort_order: 2 },
      ],
    }),
  );
}

export function createMockTopic(overrides?: Partial<TopicSummary>): TopicSummary {
  return {
    id: 'topic-test-1',
    qualification_id: 'qual-1',
    title: 'Standard 1: Understand Your Role',
    summary: 'Learn about your role as a care worker.',
    sort_order: 1,
    is_free: 1,
    question_count: 10,
    ...overrides,
  };
}

export function createMockTopics(count: number): TopicSummary[] {
  return Array.from({ length: count }, (_, i) =>
    createMockTopic({
      id: `topic-test-${i + 1}`,
      title: `Standard ${i + 1}`,
      summary: `Summary for standard ${i + 1}`,
      sort_order: i + 1,
      is_free: i < 5 ? 1 : 0,
      question_count: 5 + i,
    }),
  );
}

export function createMockBestScore(overrides?: Partial<TopicBestScore>): TopicBestScore {
  return {
    topic_id: 'topic-test-1',
    best_correct: 7,
    best_total: 10,
    ...overrides,
  };
}

export function createMockOverallStats(overrides?: Partial<OverallStats>): OverallStats {
  return {
    total_attempts: 3,
    topics_attempted: 2,
    questions_answered: 15,
    average_score_pct: 70,
    ...overrides,
  };
}

export function createMockTopicProgress(overrides?: Partial<TopicProgressSummary>): TopicProgressSummary {
  return {
    topic_id: 'topic-test-1',
    topic_title: 'Standard 1',
    is_free: 1,
    attempts: 2,
    best_correct: 7,
    best_total: 10,
    last_attempted_at: '2025-06-01T12:00:00.000Z',
    ...overrides,
  };
}

export function createMockExamStats(overrides?: Partial<MockExamStats>): MockExamStats {
  return {
    attempts: 1,
    best_correct: 14,
    best_total: 20,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Mock SQLite database — used when screens need useSQLiteContext
// ---------------------------------------------------------------------------

export function createMockDb(): SQLiteDatabase {
  return {
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(),
    runAsync: jest.fn(),
    execAsync: jest.fn(),
    withTransactionAsync: jest.fn((fn) => fn()),
  } as unknown as SQLiteDatabase;
}
