/// <reference types="jest" />
import { useQuizStore } from './useQuizStore';
import { getQuestionsByTopic } from '../db/queries/questions';
import { saveProgress } from '../db/queries/progress';
import { getDb } from '../lib/db';

jest.mock('../lib/db', () => ({
  getDb: jest.fn(),
}));

jest.mock('../db/queries/questions', () => ({
  getQuestionsByTopic: jest.fn(),
}));

jest.mock('../db/queries/progress', () => ({
  saveProgress: jest.fn(),
}));

const mockQuestions = [
  {
    id: 'q1',
    topic_id: 'topic-1',
    source_criterion: '1.1',
    prompt: 'What is safeguarding?',
    explanation: 'Protecting health and wellbeing.',
    sort_order: 1,
    options: [
      { id: 'o1', question_id: 'q1', label: 'Correct answer', is_correct: 1, sort_order: 1 },
      { id: 'o2', question_id: 'q1', label: 'Wrong answer', is_correct: 0, sort_order: 2 },
    ],
  },
  {
    id: 'q2',
    topic_id: 'topic-1',
    source_criterion: '1.2',
    prompt: 'Who is responsible?',
    explanation: 'Everyone involved in care.',
    sort_order: 2,
    options: [
      { id: 'o3', question_id: 'q2', label: 'All staff', is_correct: 1, sort_order: 1 },
      { id: 'o4', question_id: 'q2', label: 'Only managers', is_correct: 0, sort_order: 2 },
    ],
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  useQuizStore.setState({
    topicId: '',
    questions: [],
    currentIndex: 0,
    answers: {},
    hasRevealed: false,
    isComplete: false,
    isLoading: false,
    error: undefined,
  });
});

describe('useQuizStore', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      const state = useQuizStore.getState();

      expect(state.topicId).toBe('');
      expect(state.questions).toEqual([]);
      expect(state.currentIndex).toBe(0);
      expect(state.answers).toEqual({});
      expect(state.hasRevealed).toBe(false);
      expect(state.isComplete).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeUndefined();
    });
  });

  describe('loadQuestions', () => {
    it('loads questions and sets state', async () => {
      const mockDb = {};
      (getDb as jest.Mock).mockReturnValue(mockDb);
      (getQuestionsByTopic as jest.Mock).mockResolvedValue(mockQuestions);

      await useQuizStore.getState().loadQuestions('topic-1');

      const state = useQuizStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeUndefined();
      expect(state.topicId).toBe('topic-1');
      expect(state.questions).toEqual(mockQuestions);
      expect(state.currentIndex).toBe(0);
    });

    it('sets error when no questions found', async () => {
      const mockDb = {};
      (getDb as jest.Mock).mockReturnValue(mockDb);
      (getQuestionsByTopic as jest.Mock).mockResolvedValue([]);

      await useQuizStore.getState().loadQuestions('topic-1');

      const state = useQuizStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('No questions found for this topic');
      expect(state.questions).toEqual([]);
    });

    it('sets error when query throws', async () => {
      const mockDb = {};
      (getDb as jest.Mock).mockReturnValue(mockDb);
      (getQuestionsByTopic as jest.Mock).mockRejectedValue(new Error('DB failure'));

      await useQuizStore.getState().loadQuestions('topic-1');

      const state = useQuizStore.getState();
      expect(state.error).toBe('DB failure');
    });
  });

  describe('selectAnswer', () => {
    it('records selected option for a question', () => {
      useQuizStore.setState({ questions: mockQuestions });

      useQuizStore.getState().selectAnswer('q1', 'o1');

      expect(useQuizStore.getState().answers).toEqual({ q1: 'o1' });
    });

    it('does not allow selection after reveal', () => {
      useQuizStore.setState({
        questions: mockQuestions,
        answers: { q1: 'o1' },
        hasRevealed: true,
      });

      useQuizStore.getState().selectAnswer('q1', 'o2');

      expect(useQuizStore.getState().answers).toEqual({ q1: 'o1' });
    });
  });

  describe('revealAnswer', () => {
    it('sets hasRevealed when a selection exists', () => {
      useQuizStore.setState({
        questions: mockQuestions,
        answers: { q1: 'o1' },
      });

      useQuizStore.getState().revealAnswer();

      expect(useQuizStore.getState().hasRevealed).toBe(true);
    });

    it('does nothing when no selection exists', () => {
      useQuizStore.setState({ questions: mockQuestions });

      useQuizStore.getState().revealAnswer();

      expect(useQuizStore.getState().hasRevealed).toBe(false);
    });
  });

  describe('advanceQuestion', () => {
    it('moves to next question when not on last', async () => {
      useQuizStore.setState({
        questions: mockQuestions,
        currentIndex: 0,
        answers: { q1: 'o1' },
        hasRevealed: true,
      });

      await useQuizStore.getState().advanceQuestion();

      const state = useQuizStore.getState();
      expect(state.currentIndex).toBe(1);
      expect(state.hasRevealed).toBe(false);
      expect(state.isComplete).toBe(false);
    });

    it('completes quiz and saves progress on last question', async () => {
      const mockDb = {};
      (getDb as jest.Mock).mockReturnValue(mockDb);
      (saveProgress as jest.Mock).mockResolvedValue('prog-1');

      useQuizStore.setState({
        topicId: 'topic-1',
        questions: mockQuestions,
        currentIndex: 1,
        answers: { q1: 'o1', q2: 'o3' },
        hasRevealed: true,
      });

      await useQuizStore.getState().advanceQuestion();

      const state = useQuizStore.getState();
      expect(state.isComplete).toBe(true);
      expect(saveProgress).toHaveBeenCalledWith(mockDb, 'topic-1', 2, 2, false);
    });

    it('does nothing when already complete', async () => {
      useQuizStore.setState({ isComplete: true });

      await useQuizStore.getState().advanceQuestion();

      expect(saveProgress).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('resets quiz state but keeps questions loaded', () => {
      useQuizStore.setState({
        topicId: 'topic-1',
        questions: mockQuestions,
        currentIndex: 1,
        answers: { q1: 'o1' },
        hasRevealed: true,
        isComplete: false,
        error: 'some error',
      });

      useQuizStore.getState().reset();

      const state = useQuizStore.getState();
      expect(state.currentIndex).toBe(0);
      expect(state.answers).toEqual({});
      expect(state.hasRevealed).toBe(false);
      expect(state.isComplete).toBe(false);
      expect(state.error).toBeUndefined();
      expect(state.questions).toEqual(mockQuestions);
    });
  });

  describe('score calculations', () => {
    it('getScoreCorrect counts correct answers', () => {
      useQuizStore.setState({
        questions: mockQuestions,
        answers: { q1: 'o1', q2: 'o4' },
      });

      expect(useQuizStore.getState().getScoreCorrect()).toBe(1);
    });

    it('getScoreTotal returns total question count', () => {
      useQuizStore.setState({ questions: mockQuestions });

      expect(useQuizStore.getState().getScoreTotal()).toBe(2);
    });

    it('getSelectedOptionId returns answer for current question', () => {
      useQuizStore.setState({
        questions: mockQuestions,
        currentIndex: 0,
        answers: { q1: 'o1' },
      });

      expect(useQuizStore.getState().getSelectedOptionId()).toBe('o1');
    });

    it('getSelectedOptionId returns undefined when no answer', () => {
      useQuizStore.setState({
        questions: mockQuestions,
        currentIndex: 0,
        answers: {},
      });

      expect(useQuizStore.getState().getSelectedOptionId()).toBeUndefined();
    });
  });
});
