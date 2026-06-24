/// <reference types="jest" />
import { type SQLiteDatabase } from 'expo-sqlite';
import { saveProgress, getProgressByTopic } from './progress';

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
