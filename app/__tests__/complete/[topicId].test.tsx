/// <reference types="jest" />
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Share } from 'react-native';
import CompletionScreen from '../../complete/[topicId]';
import { useQuizStore } from '../../../src/store/useQuizStore';
import { useMockExamStore } from '../../../src/store/useMockExamStore';
import { setDb } from '../../../src/lib/db';
import { createMockDb } from '../../../src/test-utils/mocks';

const mockRouter = useRouter();
const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockDb = createMockDb();

beforeEach(() => {
  jest.clearAllMocks();
  setDb(mockDb);

  useQuizStore.setState({
    topicId: 'topic-test-1',
    questions: [
      { id: 'q1', topic_id: 'topic-test-1', source_criterion: '1.1', prompt: 'Q1', explanation: 'E1', sort_order: 1,
        options: [
          { id: 'o1', question_id: 'q1', label: 'Correct', is_correct: 1, sort_order: 1 },
          { id: 'o2', question_id: 'q1', label: 'Wrong', is_correct: 0, sort_order: 2 },
        ] },
    ],
    currentIndex: 0,
    answers: { q1: 'o1' },
    hasRevealed: false,
    isComplete: true,
    isLoading: false,
    error: undefined,
  });

  useMockExamStore.setState({
    questions: [],
    currentIndex: 0,
    answers: {},
    hasRevealed: false,
    isComplete: false,
    isLoading: false,
    error: undefined,
    timeRemaining: 1800,
  });
});

describe('CompletionScreen (topic)', () => {
  it('renders completion heading for topic', () => {
    mockUseLocalSearchParams.mockReturnValue({ topicId: 'topic-test-1' });
    const { getByText, getByTestId } = render(<CompletionScreen />);
    expect(getByTestId('completion-screen')).toBeTruthy();
    expect(getByText('Topic Complete!')).toBeTruthy();
  });

  it('shows score on completion screen', () => {
    mockUseLocalSearchParams.mockReturnValue({ topicId: 'topic-test-1' });
    const { getByText } = render(<CompletionScreen />);
    expect(getByText(/correct/)).toBeTruthy();
  });

  it('renders share section with prompt', () => {
    mockUseLocalSearchParams.mockReturnValue({ topicId: 'topic-test-1' });
    const { getByText } = render(<CompletionScreen />);
    expect(getByText('Enjoying the app?')).toBeTruthy();
  });

  it('renders share button', () => {
    mockUseLocalSearchParams.mockReturnValue({ topicId: 'topic-test-1' });
    const { getByTestId } = render(<CompletionScreen />);
    expect(getByTestId('share-button')).toBeTruthy();
  });

  it('triggers share on button press', async () => {
    mockUseLocalSearchParams.mockReturnValue({ topicId: 'topic-test-1' });
    const { getByText } = render(<CompletionScreen />);
    fireEvent.press(getByText('Share'));
    await waitFor(() => {
      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('CarePractice'),
        }),
      );
    });
  });

  it('navigates home on Back to Home', () => {
    mockUseLocalSearchParams.mockReturnValue({ topicId: 'topic-test-1' });
    const { getByText } = render(<CompletionScreen />);
    fireEvent.press(getByText('Back to Home'));
    expect(mockRouter.replace).toHaveBeenCalledWith('/');
  });

  it('sets completion AsyncStorage key', async () => {
    mockUseLocalSearchParams.mockReturnValue({ topicId: 'topic-test-1' });
    render(<CompletionScreen />);
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'completion_shown_topic-test-1',
        'true',
      );
    });
  });
});

describe('CompletionScreen (mock exam)', () => {
  it('renders Mock Exam Complete for mock-exam', () => {
    mockUseLocalSearchParams.mockReturnValue({ topicId: 'mock-exam' });
    useMockExamStore.setState({
      questions: [
        { id: 'q1', topic_id: 'topic-test-1', source_criterion: '1.1', prompt: 'Q1', explanation: 'E1', sort_order: 1,
          options: [
            { id: 'o1', question_id: 'q1', label: 'Correct', is_correct: 1, sort_order: 1 },
            { id: 'o2', question_id: 'q1', label: 'Wrong', is_correct: 0, sort_order: 2 },
          ] },
      ],
      answers: { q1: 'o1' },
    });
    const { getByText } = render(<CompletionScreen />);
    expect(getByText('Mock Exam Complete!')).toBeTruthy();
  });

  it('resets mock exam store on home navigation', () => {
    mockUseLocalSearchParams.mockReturnValue({ topicId: 'mock-exam' });
    useMockExamStore.setState({
      questions: [
        { id: 'q1', topic_id: 'topic-test-1', source_criterion: '1.1', prompt: 'Q1', explanation: 'E1', sort_order: 1,
          options: [
            { id: 'o1', question_id: 'q1', label: 'Correct', is_correct: 1, sort_order: 1 },
          ] },
      ],
      answers: { q1: 'o1' },
    });
    const resetSpy = jest.spyOn(useMockExamStore.getState(), 'reset');
    const { getByText } = render(<CompletionScreen />);
    fireEvent.press(getByText('Back to Home'));
    expect(resetSpy).toHaveBeenCalled();
  });
});
