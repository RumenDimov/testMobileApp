/// <reference types="jest" />
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopicResultsScreen from '../../../topic/[topicId]/results';
import { useQuizStore } from '../../../../src/store/useQuizStore';
import { setDb } from '../../../../src/lib/db';
import { createMockDb } from '../../../../src/test-utils/mocks';

const mockRouter = useRouter();
const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockDb = createMockDb();

beforeEach(() => {
  jest.clearAllMocks();
  setDb(mockDb);
  mockUseLocalSearchParams.mockReturnValue({ topicId: 'topic-test-1' });
  useQuizStore.setState({
    topicId: 'topic-test-1',
    questions: [
      {
        id: 'q1', topic_id: 'topic-test-1', source_criterion: '1.1',
        prompt: 'Q1?', explanation: 'Exp1', sort_order: 1,
        options: [
          { id: 'o1', question_id: 'q1', label: 'Correct', is_correct: 1, sort_order: 1 },
          { id: 'o2', question_id: 'q1', label: 'Wrong', is_correct: 0, sort_order: 2 },
        ],
      },
    ],
    currentIndex: 0,
    answers: { q1: 'o1' },
    hasRevealed: false,
    isComplete: true,
    isLoading: false,
    error: undefined,
  });
});

describe('TopicResultsScreen', () => {
  it('shows "No quiz session" when scoreTotal is 0', () => {
    useQuizStore.setState({
      questions: [],
      answers: {},
    });
    const { getByText } = render(<TopicResultsScreen />);
    expect(getByText('No quiz session in progress.')).toBeTruthy();
  });

  it('displays score correctly', () => {
    const { getByText, getByTestId } = render(<TopicResultsScreen />);
    expect(getByText('Topic Complete')).toBeTruthy();
    expect(getByTestId('results-screen')).toBeTruthy();
  });

  it('renders retry and home buttons', () => {
    const { getByText, getByTestId } = render(<TopicResultsScreen />);
    expect(getByTestId('retry-button')).toBeTruthy();
    expect(getByTestId('home-button')).toBeTruthy();
  });

  it('navigates back to quiz on retry', () => {
    const { getByText } = render(<TopicResultsScreen />);
    fireEvent.press(getByText('Retry Quiz'));
    expect(mockRouter.replace).toHaveBeenCalledWith('/topic/topic-test-1');
  });

  it('navigates to home on Back to Home', () => {
    const { getByText } = render(<TopicResultsScreen />);
    fireEvent.press(getByText('Back to Home'));
    expect(mockRouter.replace).toHaveBeenCalledWith('/');
  });

  it('resets quiz state on retry', () => {
    const resetSpy = jest.spyOn(useQuizStore.getState(), 'reset');
    const { getByText } = render(<TopicResultsScreen />);
    fireEvent.press(getByText('Retry Quiz'));
    expect(resetSpy).toHaveBeenCalled();
  });

  it('shows score for low percentage (< 50%)', () => {
    useQuizStore.setState({
      questions: [
        { id: 'q1', topic_id: 'topic-test-1', source_criterion: '1.1', prompt: 'Q1', explanation: 'E1', sort_order: 1,
          options: [
            { id: 'o1', question_id: 'q1', label: 'Correct', is_correct: 1, sort_order: 1 },
            { id: 'o2', question_id: 'q1', label: 'Wrong', is_correct: 0, sort_order: 2 },
          ] },
        { id: 'q2', topic_id: 'topic-test-1', source_criterion: '1.2', prompt: 'Q2', explanation: 'E2', sort_order: 2,
          options: [
            { id: 'o3', question_id: 'q2', label: 'Correct', is_correct: 1, sort_order: 1 },
            { id: 'o4', question_id: 'q2', label: 'Wrong', is_correct: 0, sort_order: 2 },
          ] },
      ],
      answers: { q1: 'o2', q2: 'o4' },
    });
    const { getByText } = render(<TopicResultsScreen />);
    expect(getByText(/Keep studying/)).toBeTruthy();
  });

  it('shows score for high percentage (>= 80%)', () => {
    useQuizStore.setState({
      questions: [
        { id: 'q1', topic_id: 'topic-test-1', source_criterion: '1.1', prompt: 'Q1', explanation: 'E1', sort_order: 1,
          options: [
            { id: 'o1', question_id: 'q1', label: 'Correct', is_correct: 1, sort_order: 1 },
            { id: 'o2', question_id: 'q1', label: 'Wrong', is_correct: 0, sort_order: 2 },
          ] },
      ],
      answers: { q1: 'o1' },
    });
    const { getByText } = render(<TopicResultsScreen />);
    expect(getByText(/Great job/)).toBeTruthy();
  });

  it('checks AsyncStorage for completion key', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('true');
    render(<TopicResultsScreen />);
    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('completion_shown_topic-test-1');
    });
  });
});
