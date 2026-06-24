/// <reference types="jest" />
import { act } from 'react';
import { useMockExamStore } from './useMockExamStore';
import type { QuestionWithOptions } from '../db/queries/questions';
import type { SQLiteDatabase } from 'expo-sqlite';
import { getDb } from '../lib/db';
import { getMockExamQuestions } from '../db/queries/questions';
import { saveProgress } from '../db/queries/progress';

jest.mock('../lib/db', () => ({
  getDb: jest.fn(),
}));

jest.mock('../db/queries/questions', () => ({
  getMockExamQuestions: jest.fn(),
}));

jest.mock('../db/queries/progress', () => ({
  saveProgress: jest.fn(),
}));

function createMockQuestion(overrides?: Partial<QuestionWithOptions>): QuestionWithOptions {
  const id = overrides?.id ?? 'q1';
  return {
    id,
    topic_id: 'cc-standard-1',
    source_criterion: '1.1a',
    prompt: 'Test question?',
    explanation: 'Test explanation',
    sort_order: 0,
    options: [
      { id: `${id}-opt-0`, question_id: id, label: 'Correct answer', is_correct: 1, sort_order: 0 },
      { id: `${id}-opt-1`, question_id: id, label: 'Wrong answer', is_correct: 0, sort_order: 1 },
    ],
    ...overrides,
  };
}

describe('useMockExamStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store to initial state between tests
    act(() => {
      useMockExamStore.getState().reset();
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('loadQuestions', () => {
    it('loads questions and sets loading to false', async () => {
      const mockQuestions = [createMockQuestion()];
      (getDb as jest.Mock).mockReturnValue({} as SQLiteDatabase);
      (getMockExamQuestions as jest.Mock).mockResolvedValue(mockQuestions);

      await act(async () => {
        await useMockExamStore.getState().loadQuestions();
      });

      const state = useMockExamStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.questions).toEqual(mockQuestions);
      expect(state.error).toBeUndefined();
    });

    it('sets error when no questions returned', async () => {
      (getDb as jest.Mock).mockReturnValue({} as SQLiteDatabase);
      (getMockExamQuestions as jest.Mock).mockResolvedValue([]);

      await act(async () => {
        await useMockExamStore.getState().loadQuestions();
      });

      const state = useMockExamStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toContain('No mock exam questions');
    });

    it('sets error on exception', async () => {
      (getDb as jest.Mock).mockReturnValue({} as SQLiteDatabase);
      (getMockExamQuestions as jest.Mock).mockRejectedValue(new Error('DB error'));

      await act(async () => {
        await useMockExamStore.getState().loadQuestions();
      });

      const state = useMockExamStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toContain('DB error');
    });
  });

  describe('selectAnswer and revealAnswer', () => {
    it('selects and reveals an answer', async () => {
      const mockQuestions = [createMockQuestion()];
      (getDb as jest.Mock).mockReturnValue({} as SQLiteDatabase);
      (getMockExamQuestions as jest.Mock).mockResolvedValue(mockQuestions);

      await act(async () => {
        await useMockExamStore.getState().loadQuestions();
      });

      act(() => {
        useMockExamStore.getState().selectAnswer('q1', 'q1-opt-0');
      });

      expect(useMockExamStore.getState().answers['q1']).toBe('q1-opt-0');

      act(() => {
        useMockExamStore.getState().revealAnswer();
      });

      expect(useMockExamStore.getState().hasRevealed).toBe(true);
    });

    it('ignores selection after reveal', async () => {
      const mockQuestions = [createMockQuestion()];
      (getDb as jest.Mock).mockReturnValue({} as SQLiteDatabase);
      (getMockExamQuestions as jest.Mock).mockResolvedValue(mockQuestions);

      await act(async () => {
        await useMockExamStore.getState().loadQuestions();
      });

      act(() => {
        useMockExamStore.getState().selectAnswer('q1', 'q1-opt-0');
      });
      act(() => {
        useMockExamStore.getState().revealAnswer();
      });
      act(() => {
        useMockExamStore.getState().selectAnswer('q1', 'q1-opt-1');
      });

      expect(useMockExamStore.getState().answers['q1']).toBe('q1-opt-0');
    });
  });

  describe('nextQuestion', () => {
    it('moves to next question when not at the end', async () => {
      const mockQuestions = [createMockQuestion({ id: 'q1' }), createMockQuestion({ id: 'q2' })];
      (getDb as jest.Mock).mockReturnValue({} as SQLiteDatabase);
      (getMockExamQuestions as jest.Mock).mockResolvedValue(mockQuestions);

      await act(async () => {
        await useMockExamStore.getState().loadQuestions();
      });

      act(() => {
        useMockExamStore.getState().selectAnswer('q1', 'q1-opt-0');
      });
      act(() => {
        useMockExamStore.getState().revealAnswer();
      });
      await act(async () => {
        await useMockExamStore.getState().nextQuestion();
      });

      expect(useMockExamStore.getState().currentIndex).toBe(1);
      expect(useMockExamStore.getState().hasRevealed).toBe(false);
    });

    it('completes the exam on last question and saves progress', async () => {
      const mockQuestions = [createMockQuestion()];
      (getDb as jest.Mock).mockReturnValue({} as SQLiteDatabase);
      (getMockExamQuestions as jest.Mock).mockResolvedValue(mockQuestions);
      (saveProgress as jest.Mock).mockResolvedValue('prog-1');

      await act(async () => {
        await useMockExamStore.getState().loadQuestions();
      });

      act(() => {
        useMockExamStore.getState().selectAnswer('q1', 'q1-opt-0');
      });
      act(() => {
        useMockExamStore.getState().revealAnswer();
      });
      await act(async () => {
        await useMockExamStore.getState().nextQuestion();
      });

      expect(useMockExamStore.getState().isComplete).toBe(true);
      expect(saveProgress).toHaveBeenCalledWith(
        expect.anything(),
        'mock-exam',
        1,
        1,
        true,
      );
    });
  });

  describe('tick', () => {
    it('decrements timeRemaining', () => {
      useMockExamStore.setState({ timeRemaining: 100 });

      act(() => {
        useMockExamStore.getState().tick();
      });

      expect(useMockExamStore.getState().timeRemaining).toBe(99);
    });

    it('auto-submits when timer reaches zero', () => {
      useMockExamStore.setState({
        timeRemaining: 1,
        questions: [createMockQuestion()],
        answers: { q1: 'q1-opt-0' },
      });
      (getDb as jest.Mock).mockReturnValue({} as SQLiteDatabase);
      (saveProgress as jest.Mock).mockResolvedValue('prog-1');

      act(() => {
        useMockExamStore.getState().tick();
      });

      const state = useMockExamStore.getState();
      expect(state.timeRemaining).toBe(0);
      expect(state.isComplete).toBe(true);
      expect(saveProgress).toHaveBeenCalled();
    });

    it('does not tick when already complete', () => {
      useMockExamStore.setState({ timeRemaining: 100, isComplete: true });

      act(() => {
        useMockExamStore.getState().tick();
      });

      expect(useMockExamStore.getState().timeRemaining).toBe(100);
    });
  });

  describe('score computation', () => {
    it('computes correct and total scores', async () => {
      const mockQuestions = [
        createMockQuestion({ id: 'q1' }),
        createMockQuestion({ id: 'q2', options: [
          { id: 'q2-opt-0', question_id: 'q2', label: 'Wrong', is_correct: 0, sort_order: 0 },
          { id: 'q2-opt-1', question_id: 'q2', label: 'Right', is_correct: 1, sort_order: 1 },
        ]}),
      ];
      (getDb as jest.Mock).mockReturnValue({} as SQLiteDatabase);
      (getMockExamQuestions as jest.Mock).mockResolvedValue(mockQuestions);

      await act(async () => {
        await useMockExamStore.getState().loadQuestions();
      });

      // Answer q1 correctly, q2 incorrectly
      act(() => {
        useMockExamStore.getState().selectAnswer('q1', 'q1-opt-0');
      });
      act(() => {
        useMockExamStore.getState().selectAnswer('q2', 'q2-opt-0');
      });

      expect(useMockExamStore.getState().getScoreCorrect()).toBe(1);
      expect(useMockExamStore.getState().getScoreTotal()).toBe(2);
    });
  });

  describe('reset', () => {
    it('resets all state to initial values', async () => {
      const mockQuestions = [createMockQuestion()];
      (getDb as jest.Mock).mockReturnValue({} as SQLiteDatabase);
      (getMockExamQuestions as jest.Mock).mockResolvedValue(mockQuestions);

      await act(async () => {
        await useMockExamStore.getState().loadQuestions();
      });
      act(() => {
        useMockExamStore.getState().selectAnswer('q1', 'q1-opt-0');
      });

      act(() => {
        useMockExamStore.getState().reset();
      });

      const state = useMockExamStore.getState();
      expect(state.questions).toEqual([]);
      expect(state.currentIndex).toBe(0);
      expect(state.answers).toEqual({});
      expect(state.isComplete).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeUndefined();
    });
  });
});
