/// <reference types="jest" />
import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import ProgressScreen from '../progress';
import { useProgressStore } from '../../src/store/useProgressStore';

const mockRouter = useRouter();

beforeEach(() => {
  jest.clearAllMocks();
  // Prevent loadAll from actually calling DB queries
  jest.spyOn(useProgressStore.getState(), 'loadAll').mockImplementation(() => Promise.resolve());

  useProgressStore.setState({
    overallStats: undefined,
    topicProgress: [],
    mockExamStats: undefined,
    isLoading: false,
    error: undefined,
  });
});

describe('ProgressScreen', () => {
  it('renders loading state when isLoading is true', () => {
    useProgressStore.setState({ isLoading: true });
    const { toJSON } = render(<ProgressScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders empty state when no progress exists', () => {
    useProgressStore.setState({
      overallStats: { total_attempts: 0, topics_attempted: 0, questions_answered: 0, average_score_pct: 0 },
      isLoading: false,
    });
    const { getByText } = render(<ProgressScreen />);
    expect(getByText('No progress yet')).toBeTruthy();
    expect(getByText('Complete a quiz to see your stats here.')).toBeTruthy();
  });

  it('renders progress data when progress exists', () => {
    useProgressStore.setState({
      overallStats: {
        total_attempts: 5,
        topics_attempted: 3,
        questions_answered: 25,
        average_score_pct: 72,
      },
      topicProgress: [
        {
          topic_id: 'topic-1',
          topic_title: 'Standard 1',
          is_free: 1,
          attempts: 2,
          best_correct: 8,
          best_total: 10,
          last_attempted_at: '2025-06-01T12:00:00.000Z',
        },
      ],
      mockExamStats: undefined,
      isLoading: false,
    });

    const { getByText } = render(<ProgressScreen />);
    expect(getByText('Your Progress')).toBeTruthy();
    expect(getByText('Overall')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    expect(getByText('72%')).toBeTruthy();
    expect(getByText('Standard 1')).toBeTruthy();
  });

  it('shows Free badge for free topics', () => {
    useProgressStore.setState({
      overallStats: { total_attempts: 1, topics_attempted: 1, questions_answered: 5, average_score_pct: 60 },
      topicProgress: [
        { topic_id: 'topic-1', topic_title: 'Standard 1', is_free: 1, attempts: 1, best_correct: 3, best_total: 5, last_attempted_at: '' },
      ],
      isLoading: false,
    });
    const { getByText } = render(<ProgressScreen />);
    expect(getByText('Free')).toBeTruthy();
  });

  it('navigates back to home from empty state', () => {
    useProgressStore.setState({
      overallStats: { total_attempts: 0, topics_attempted: 0, questions_answered: 0, average_score_pct: 0 },
      isLoading: false,
    });
    const { getByText } = render(<ProgressScreen />);
    fireEvent.press(getByText('Back to Home'));
    expect(mockRouter.replace).toHaveBeenCalledWith('/');
  });

  it('navigates back on ← Back press', () => {
    useProgressStore.setState({
      overallStats: { total_attempts: 5, topics_attempted: 3, questions_answered: 25, average_score_pct: 72 },
      topicProgress: [
        { topic_id: 'topic-1', topic_title: 'Standard 1', is_free: 1, attempts: 2, best_correct: 8, best_total: 10, last_attempted_at: '' },
      ],
      isLoading: false,
    });
    const { getByText } = render(<ProgressScreen />);
    fireEvent.press(getByText('← Back'));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('renders error state and retry button', () => {
    useProgressStore.setState({
      isLoading: false,
      error: 'Failed to load progress',
    });
    const { getByText } = render(<ProgressScreen />);
    expect(getByText('Failed to load progress')).toBeTruthy();
    expect(getByText('Try again')).toBeTruthy();
  });
});
