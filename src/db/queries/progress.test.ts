/// <reference types="jest" />
import { type SQLiteDatabase } from 'expo-sqlite';
import {
  saveProgress,
  getProgressByTopic,
  getOverallStats,
  getAllTopicProgress,
  getMockExamStats,
  getTopicCompletionCount,
} from './progress';

function createMockDb(): SQLiteDatabase {
  return {
    runAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    execAsync: jest.fn(),
    withTransactionAsync: jest.fn(),
  } as unknown as SQLiteDatabase;
}

describe('saveProgress', () => {
  it('inserts a progress row and returns the generated id', async () => {
    const db = createMockDb();
    (db.runAsync as jest.Mock).mockResolvedValue(undefined);

    const id = await saveProgress(db, 'topic-1', 8, 10, false);

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO progress'),
      expect.arrayContaining(['topic-1', 8, 10, 0]),
    );
    expect(id).toMatch(/^prog-/);
  });

  it('marks is_mock_exam as 1 when true', async () => {
    const db = createMockDb();
    (db.runAsync as jest.Mock).mockResolvedValue(undefined);

    await saveProgress(db, 'topic-1', 0, 0, true);

    const params = (db.runAsync as jest.Mock).mock.calls[0][1];
    expect(params).toContain(1);
  });
});

describe('getProgressByTopic', () => {
  it('returns progress rows ordered by attempted_at DESC', async () => {
    const db = createMockDb();
    const expected = [
      { id: 'p1', topic_id: 'topic-1', attempted_at: '2025-01-02', score_correct: 8, score_total: 10, is_mock_exam: 0 },
      { id: 'p2', topic_id: 'topic-1', attempted_at: '2025-01-01', score_correct: 5, score_total: 10, is_mock_exam: 0 },
    ];
    (db.getAllAsync as jest.Mock).mockResolvedValue(expected);

    const result = await getProgressByTopic(db, 'topic-1');

    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY attempted_at DESC'),
      ['topic-1'],
    );
    expect(result).toEqual(expected);
  });

  it('returns empty array when no progress exists', async () => {
    const db = createMockDb();
    (db.getAllAsync as jest.Mock).mockResolvedValue([]);

    const result = await getProgressByTopic(db, 'unknown');

    expect(result).toEqual([]);
  });
});

describe('getOverallStats', () => {
  it('returns aggregate stats for non-mock-exam progress', async () => {
    const db = createMockDb();
    (db.getFirstAsync as jest.Mock).mockResolvedValue({
      total_attempts: 5,
      topics_attempted: 3,
      questions_answered: 50,
      average_score_pct: 72,
    });

    const result = await getOverallStats(db);

    expect(result).toEqual({
      total_attempts: 5,
      topics_attempted: 3,
      questions_answered: 50,
      average_score_pct: 72,
    });
  });

  it('returns undefined when no progress exists', async () => {
    const db = createMockDb();
    (db.getFirstAsync as jest.Mock).mockResolvedValue(undefined);

    const result = await getOverallStats(db);

    expect(result).toBeUndefined();
  });
});

describe('getAllTopicProgress', () => {
  it('returns all topics with progress data joined', async () => {
    const db = createMockDb();
    const expected = [
      {
        topic_id: 't1',
        topic_title: 'Standard 1',
        is_free: 1,
        attempts: 2,
        best_correct: 8,
        best_total: 10,
        last_attempted_at: '2025-01-02',
      },
      {
        topic_id: 't2',
        topic_title: 'Standard 2',
        is_free: 0,
        attempts: 0,
        best_correct: 0,
        best_total: 0,
        last_attempted_at: null,
      },
    ];
    (db.getAllAsync as jest.Mock).mockResolvedValue(expected);

    const result = await getAllTopicProgress(db);

    expect(result).toEqual(expected);
    expect(result).toHaveLength(2);
  });
});

describe('getMockExamStats', () => {
  it('returns mock exam aggregate stats', async () => {
    const db = createMockDb();
    (db.getFirstAsync as jest.Mock).mockResolvedValue({
      attempts: 3,
      best_correct: 14,
      best_total: 20,
    });

    const result = await getMockExamStats(db);

    expect(result).toEqual({
      attempts: 3,
      best_correct: 14,
      best_total: 20,
    });
  });

  it('returns undefined when no mock exams taken', async () => {
    const db = createMockDb();
    (db.getFirstAsync as jest.Mock).mockResolvedValue(undefined);

    const result = await getMockExamStats(db);

    expect(result).toBeUndefined();
  });
});

describe('getTopicCompletionCount', () => {
  it('returns the count of non-mock-exam attempts for a topic', async () => {
    const db = createMockDb();
    (db.getFirstAsync as jest.Mock).mockResolvedValue({ count: 4 });

    const result = await getTopicCompletionCount(db, 'topic-1');

    expect(result).toBe(4);
  });

  it('returns 0 when no attempts exist', async () => {
    const db = createMockDb();
    (db.getFirstAsync as jest.Mock).mockResolvedValue({ count: 0 });

    const result = await getTopicCompletionCount(db, 'unknown');

    expect(result).toBe(0);
  });
});
