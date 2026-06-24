import { create } from 'zustand';
import type { OverallStats, TopicProgressSummary, MockExamStats } from '../db/queries/progress';
import { getOverallStats, getAllTopicProgress, getMockExamStats } from '../db/queries/progress';
import { getDb } from '../lib/db';

type ProgressState = {
  overallStats: OverallStats | undefined;
  topicProgress: TopicProgressSummary[];
  mockExamStats: MockExamStats | undefined;
  isLoading: boolean;
  error: string | undefined;

  loadAll: () => Promise<void>;
  reset: () => void;
};

export const useProgressStore = create<ProgressState>((set) => ({
  overallStats: undefined,
  topicProgress: [],
  mockExamStats: undefined,
  isLoading: false,
  error: undefined,

  loadAll: async (): Promise<void> => {
    set({ isLoading: true, error: undefined });

    try {
      const db = getDb();
      const [overallStats, topicProgress, mockExamStats] = await Promise.all([
        getOverallStats(db),
        getAllTopicProgress(db),
        getMockExamStats(db),
      ]);

      set({
        overallStats,
        topicProgress,
        mockExamStats,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load progress',
        isLoading: false,
      });
    }
  },

  reset: (): void => {
    set({
      overallStats: undefined,
      topicProgress: [],
      mockExamStats: undefined,
      isLoading: false,
      error: undefined,
    });
  },
}));
