import { create } from 'zustand';
import type { QuestionWithOptions } from '../db/queries/questions';
import { getQuestionsByTopic } from '../db/queries/questions';
import { saveProgress } from '../db/queries/progress';
import { getDb } from '../lib/db';

function emptyQuizState(): { questions: QuestionWithOptions[]; currentIndex: number; answers: Record<string, string>; hasRevealed: boolean; isComplete: boolean } {
  return {
    questions: [] as QuestionWithOptions[],
    currentIndex: 0,
    answers: {} as Record<string, string>,
    hasRevealed: false,
    isComplete: false,
  };
}

type QuizState = {
  topicId: string;
  questions: QuestionWithOptions[];
  currentIndex: number;
  answers: Record<string, string>;
  hasRevealed: boolean;
  isComplete: boolean;
  isLoading: boolean;
  error: string | undefined;

  loadQuestions: (topicId: string) => Promise<void>;
  selectAnswer: (questionId: string, optionId: string) => void;
  revealAnswer: () => void;
  advanceQuestion: () => Promise<void>;
  reset: () => void;
  getCurrentQuestion: () => QuestionWithOptions | undefined;
  getSelectedOptionId: () => string | undefined;
  getScoreCorrect: () => number;
  getScoreTotal: () => number;
};

export const useQuizStore = create<QuizState>((set, get) => ({
  topicId: '',
  questions: [],
  currentIndex: 0,
  answers: {},
  hasRevealed: false,
  isComplete: false,
  isLoading: false,
  error: undefined,

  loadQuestions: async (topicId: string): Promise<void> => {
    set({ isLoading: true, error: undefined, topicId, ...emptyQuizState() });

    try {
      const db = getDb();
      const questions = await getQuestionsByTopic(db, topicId);

      if (questions.length === 0) {
        set({ error: 'No questions found for this topic', isLoading: false, ...emptyQuizState() });
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
        error: err instanceof Error ? err.message : 'Failed to load questions',
        isLoading: false,
        ...emptyQuizState(),
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
    const { currentIndex, questions, topicId, answers, isComplete } = get();

    if (isComplete) return;

    if (currentIndex >= questions.length - 1) {
      const scoreCorrect = questions.filter(
        (q) => {
          const selectedId = answers[q.id];
          if (!selectedId) return false;
          return q.options.find((o) => o.id === selectedId)?.is_correct === 1;
        },
      ).length;

      try {
        const db = getDb();
        await saveProgress(db, topicId, scoreCorrect, questions.length, false);
      } catch {
        // Progress save failing should not block quiz completion
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
      currentIndex: 0,
      answers: {},
      hasRevealed: false,
      isComplete: false,
      error: undefined,
    });
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
