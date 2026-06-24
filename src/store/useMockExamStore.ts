import { create } from 'zustand';
import type { QuestionWithOptions } from '../db/queries/questions';
import { getMockExamQuestions } from '../db/queries/questions';
import { saveProgress } from '../db/queries/progress';
import { getDb } from '../lib/db';

const MOCK_EXAM_DURATION = 30 * 60; // 30 minutes in seconds
const MOCK_EXAM_QUESTION_COUNT = 20;

type MockExamState = {
  questions: QuestionWithOptions[];
  currentIndex: number;
  answers: Record<string, string>;
  hasRevealed: boolean;
  isComplete: boolean;
  isLoading: boolean;
  error: string | undefined;
  timeRemaining: number;

  loadQuestions: () => Promise<void>;
  selectAnswer: (questionId: string, optionId: string) => void;
  revealAnswer: () => void;
  advanceQuestion: () => Promise<void>;
  reset: () => void;
  tick: () => void;
  getCurrentQuestion: () => QuestionWithOptions | undefined;
  getSelectedOptionId: () => string | undefined;
  getScoreCorrect: () => number;
  getScoreTotal: () => number;
};

export const useMockExamStore = create<MockExamState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  answers: {},
  hasRevealed: false,
  isComplete: false,
  isLoading: false,
  error: undefined,
  timeRemaining: MOCK_EXAM_DURATION,

  loadQuestions: async (): Promise<void> => {
    set({
      isLoading: true,
      error: undefined,
      questions: [],
      currentIndex: 0,
      answers: {},
      hasRevealed: false,
      isComplete: false,
      timeRemaining: MOCK_EXAM_DURATION,
    });

    try {
      const db = getDb();
      const questions = await getMockExamQuestions(db, MOCK_EXAM_QUESTION_COUNT);

      if (questions.length === 0) {
        set({
          error: 'No mock exam questions available. Please try again later.',
          isLoading: false,
        });
        return;
      }

      set({
        questions,
        currentIndex: 0,
        answers: {},
        hasRevealed: false,
        isComplete: false,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load mock exam questions',
        isLoading: false,
      });
    }
  },

  selectAnswer: (questionId: string, optionId: string): void => {
    const { hasRevealed } = get();
    if (hasRevealed) return;

    set((state) => ({
      answers: { ...state.answers, [questionId]: optionId },
    }));
  },

  revealAnswer: (): void => {
    const { questions, currentIndex, answers } = get();
    const question = questions[currentIndex];
    if (!question) return;

    const selectedId = answers[question.id];
    if (!selectedId) return;

    set({ hasRevealed: true });
  },

  advanceQuestion: async (): Promise<void> => {
    const { currentIndex, questions, answers, isComplete } = get();

    if (isComplete) return;

    if (currentIndex >= questions.length - 1) {
      const scoreCorrect = questions.filter((q) => {
        const selectedId = answers[q.id];
        if (!selectedId) return false;
        return q.options.find((o) => o.id === selectedId)?.is_correct === 1;
      }).length;

      try {
        const db = getDb();
        await saveProgress(db, 'mock-exam', scoreCorrect, questions.length, true);
      } catch {
        // Progress save failing should not block mock exam completion
      }

      set({ isComplete: true, hasRevealed: false });
    } else {
      set({
        currentIndex: currentIndex + 1,
        hasRevealed: false,
      });
    }
  },

  reset: (): void => {
    set({
      questions: [],
      currentIndex: 0,
      answers: {},
      hasRevealed: false,
      isComplete: false,
      isLoading: false,
      error: undefined,
      timeRemaining: MOCK_EXAM_DURATION,
    });
  },

  tick: (): void => {
    const { timeRemaining, isComplete } = get();
    if (timeRemaining <= 0 || isComplete) return;

    const newTime = timeRemaining - 1;

    if (newTime <= 0) {
      const { questions, answers } = get();

      const scoreCorrect = questions.filter((q) => {
        const selectedId = answers[q.id];
        if (!selectedId) return false;
        return q.options.find((o) => o.id === selectedId)?.is_correct === 1;
      }).length;

      try {
        const db = getDb();
        void saveProgress(db, 'mock-exam', scoreCorrect, questions.length, true).catch(() => {});
      } catch {
        // getDb() failure should not block mock exam completion
      }

      set({ timeRemaining: 0, isComplete: true, hasRevealed: false });
    } else {
      set({ timeRemaining: newTime });
    }
  },

  getCurrentQuestion: (): QuestionWithOptions | undefined => {
    const { questions, currentIndex } = get();
    return questions[currentIndex];
  },

  getSelectedOptionId: (): string | undefined => {
    const { questions, currentIndex, answers } = get();
    const question = questions[currentIndex];
    if (!question) return undefined;
    return answers[question.id];
  },

  getScoreCorrect: (): number => {
    const { questions, answers } = get();
    return questions.filter((q) => {
      const selectedId = answers[q.id];
      if (!selectedId) return false;
      return q.options.find((o) => o.id === selectedId)?.is_correct === 1;
    }).length;
  },

  getScoreTotal: (): number => {
    return get().questions.length;
  },
}));
