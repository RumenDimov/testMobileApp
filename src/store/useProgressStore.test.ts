/// <reference types="jest" />
import { useProgressStore } from './useProgressStore';
import { getOverallStats, getAllTopicProgress, getMockExamStats } from '../db/queries/progress';
import { getDb } from '../lib/db';

jest.mock('../lib/db', () => ({
  getDb: jest.fn(),
}));

jest.mock('../db/queries/progress', () => ({
  getOverallStats: jest.fn(),
  getAllTopicProgress: jest.fn(),
  getMockExamStats: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  useProgressStore.setState({
    overallStats: undefined,
    topicProgress: [],
    mockExamStats: undefined,
    isLoading: false,
    error: undefined,
  });
});

describe('useProgressStore', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      const state = useProgressStore.getState();

      expect(state.overallStats).toBeUndefined();
      expect(state.topicProgress).toEqual([]);
      expect(state.mockExamStats).toBeUndefined();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeUndefined();
    });
  });

  describe('loadAll', () => {
    it('sets loading true then loads all stats', async () => {
      const mockDb = {};
      (getDb as jest.Mock).mockReturnValue(mockDb);

      (getOverallStats as jest.Mock).mockResolvedValue({
        total_attempts: 3,
        topics_attempted: 2,
        questions_answered: 30,
        average_score_pct: 80,
      });

      (getAllTopicProgress as jest.Mock).mockResolvedValue([
        {
          topic_id: 't1',
          topic_title: 'Standard 1',
          is_free: 1,
          attempts: 2,
          best_correct: 8,
          best_total: 10,
          last_attempted_at: '2025-01-01',
        },
      ]);

      (getMockExamStats as jest.Mock).mockResolvedValue({
        attempts: 2,
        best_correct: 15,
        best_total: 20,
      });

      await useProgressStore.getState().loadAll();

      const state = useProgressStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeUndefined();
      expect(state.overallStats).toEqual({
        total_attempts: 3,
        topics_attempted: 2,
        questions_answered: 30,
        average_score_pct: 80,
      });
      expect(state.topicProgress).toHaveLength(1);
      expect(state.mockExamStats).toEqual({
        attempts: 2,
        best_correct: 15,
        best_total: 20,
      });
    });

    it('sets error when a query fails', async () => {
      const mockDb = {};
      (getDb as jest.Mock).mockReturnValue(mockDb);
      (getOverallStats as jest.Mock).mockRejectedValue(new Error('DB error'));

      await useProgressStore.getState().loadAll();

      const state = useProgressStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('DB error');
    });
  });

  describe('reset', () => {
    it('clears all progress state', async () => {
      useProgressStore.setState({
        overallStats: { total_attempts: 1, topics_attempted: 1, questions_answered: 10, average_score_pct: 70 },
        topicProgress: [{ topic_id: 't1', topic_title: 'Test', is_free: 1, attempts: 1, best_correct: 7, best_total: 10, last_attempted_at: '2025-01-01' }],
        mockExamStats: { attempts: 1, best_correct: 10, best_total: 20 },
      });

      useProgressStore.getState().reset();

      const state = useProgressStore.getState();
      expect(state.overallStats).toBeUndefined();
      expect(state.topicProgress).toEqual([]);
      expect(state.mockExamStats).toBeUndefined();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeUndefined();
    });
  });
});
