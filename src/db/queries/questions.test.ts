/// <reference types="jest" />
import { type SQLiteDatabase } from 'expo-sqlite';
import {
  getTopic,
  getTopicWithCount,
  getQuestionsByTopic,
  getAllTopics,
  getTopicBestScores,
  getMockExamQuestions,
} from './questions';

function createMockDb(): SQLiteDatabase {
  return {
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(),
    runAsync: jest.fn(),
    execAsync: jest.fn(),
    withTransactionAsync: jest.fn(),
  } as unknown as SQLiteDatabase;
}

describe('getTopic', () => {
  it('returns a topic when found', async () => {
    const db = createMockDb();
    const expected = { id: 't1', title: 'Test Topic' };
    (db.getFirstAsync as jest.Mock).mockResolvedValue(expected);

    const result = await getTopic(db, 't1');

    expect(db.getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      ['t1'],
    );
    expect(result).toEqual(expected);
  });

  it('returns undefined when not found', async () => {
    const db = createMockDb();
    (db.getFirstAsync as jest.Mock).mockResolvedValue(null);

    const result = await getTopic(db, 'nonexistent');

    expect(result).toBeUndefined();
  });
});

describe('getTopicWithCount', () => {
  it('returns topic summary with question count', async () => {
    const db = createMockDb();
    const expected = { id: 't1', title: 'Test', question_count: 5 };
    (db.getFirstAsync as jest.Mock).mockResolvedValue(expected);

    const result = await getTopicWithCount(db, 't1');

    expect(db.getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('COUNT(q.id)'),
      ['t1'],
    );
    expect(result).toEqual(expected);
  });

  it('returns undefined when topic not found', async () => {
    const db = createMockDb();
    (db.getFirstAsync as jest.Mock).mockResolvedValue(null);

    const result = await getTopicWithCount(db, 'missing');

    expect(result).toBeUndefined();
  });
});

describe('getQuestionsByTopic', () => {
  it('returns questions grouped with options (single query)', async () => {
    const db = createMockDb();
    const questions = [
      { id: 'q1', topic_id: 't1', prompt: 'Q1', explanation: 'E1', source_criterion: 'SC1', sort_order: 0 },
    ];
    const options = [
      { id: 'o1', question_id: 'q1', label: 'A', is_correct: 1, sort_order: 0 },
      { id: 'o2', question_id: 'q1', label: 'B', is_correct: 0, sort_order: 1 },
    ];
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce(questions).mockResolvedValueOnce(options);

    const result = await getQuestionsByTopic(db, 't1');

    expect(db.getAllAsync).toHaveBeenCalledTimes(2);
    // Second call should use IN query with placeholders
    const secondCall = (db.getAllAsync as jest.Mock).mock.calls[1];
    expect(secondCall[0]).toContain('WHERE question_id IN');
    expect(secondCall[1]).toEqual(['q1']);
    expect(result).toHaveLength(1);
    expect(result[0].options).toHaveLength(2);
  });

  it('returns empty array when no questions exist', async () => {
    const db = createMockDb();
    (db.getAllAsync as jest.Mock).mockResolvedValue([]);

    const result = await getQuestionsByTopic(db, 'empty');

    expect(result).toEqual([]);
    // Should not query options at all
    expect(db.getAllAsync).toHaveBeenCalledTimes(1);
  });

  it('handles questions with no matching options', async () => {
    const db = createMockDb();
    const questions = [
      { id: 'q1', topic_id: 't1', prompt: 'Q1', explanation: 'E1', source_criterion: 'SC1', sort_order: 0 },
    ];
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce(questions).mockResolvedValueOnce([]);

    const result = await getQuestionsByTopic(db, 't1');

    expect(result[0].options).toEqual([]);
  });
});

describe('getAllTopics', () => {
  it('returns all topics with question counts ordered by sort_order', async () => {
    const db = createMockDb();
    const expected = [
      { id: 't1', title: 'First', question_count: 3, sort_order: 1 },
      { id: 't2', title: 'Second', question_count: 5, sort_order: 2 },
    ];
    (db.getAllAsync as jest.Mock).mockResolvedValue(expected);

    const result = await getAllTopics(db);

    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY t.sort_order'),
    );
    expect(result).toEqual(expected);
  });

  it('returns empty array when no topics exist', async () => {
    const db = createMockDb();
    (db.getAllAsync as jest.Mock).mockResolvedValue([]);

    const result = await getAllTopics(db);

    expect(result).toEqual([]);
  });
});

describe('getTopicBestScores', () => {
  it('returns best scores grouped by topic', async () => {
    const db = createMockDb();
    const expected = [
      { topic_id: 't1', best_correct: 8, best_total: 10 },
      { topic_id: 't2', best_correct: 5, best_total: 10 },
    ];
    (db.getAllAsync as jest.Mock).mockResolvedValue(expected);

    const result = await getTopicBestScores(db);

    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('MAX(score_correct)'),
    );
    expect(result).toEqual(expected);
  });

  it('returns empty array when no progress exists', async () => {
    const db = createMockDb();
    (db.getAllAsync as jest.Mock).mockResolvedValue([]);

    const result = await getTopicBestScores(db);

    expect(result).toEqual([]);
  });
});

describe('getMockExamQuestions', () => {
  it('returns random questions from paid topics with options', async () => {
    const db = createMockDb();
    const questions = [
      { id: 'q1', topic_id: 't2', prompt: 'Q1', explanation: 'E1', source_criterion: 'SC1', sort_order: 0 },
      { id: 'q2', topic_id: 't3', prompt: 'Q2', explanation: 'E2', source_criterion: 'SC2', sort_order: 1 },
    ];
    const options = [
      { id: 'o1', question_id: 'q1', label: 'A', is_correct: 1, sort_order: 0 },
      { id: 'o2', question_id: 'q1', label: 'B', is_correct: 0, sort_order: 1 },
      { id: 'o3', question_id: 'q2', label: 'C', is_correct: 1, sort_order: 0 },
      { id: 'o4', question_id: 'q2', label: 'D', is_correct: 0, sort_order: 1 },
    ];
    (db.getAllAsync as jest.Mock).mockResolvedValueOnce(questions).mockResolvedValueOnce(options);

    const result = await getMockExamQuestions(db, 2);

    expect(db.getAllAsync).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(2);
    expect(result[0].options).toHaveLength(2);
    expect(result[1].options).toHaveLength(2);
  });

  it('returns empty array when no questions exist', async () => {
    const db = createMockDb();
    (db.getAllAsync as jest.Mock).mockResolvedValue([]);

    const result = await getMockExamQuestions(db, 10);

    expect(result).toEqual([]);
  });
});
