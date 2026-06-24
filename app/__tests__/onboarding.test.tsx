/// <reference types="jest" />
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from '../onboarding';

const mockRouter = router;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('OnboardingScreen', () => {
  it('renders all onboarding content sections', () => {
    const { getByText } = render(<OnboardingScreen />);

    expect(getByText('Care Practice')).toBeTruthy();
    expect(getByText('Understand it. Don\'t just copy it.')).toBeTruthy();
    expect(getByText('Free and paid — no subscription, ever')).toBeTruthy();
    expect(getByText('Works offline')).toBeTruthy();
    expect(getByText('Get started')).toBeTruthy();
  });

  it('renders the key selling points', () => {
    const { getByText } = render(<OnboardingScreen />);

    expect(getByText('Pay once. Keep forever. No surprises.')).toBeTruthy();
    expect(getByText(/No account needed, no internet required/)).toBeTruthy();
  });

  it('marks onboarding complete and navigates on Get started tap', async () => {
    const { getByText } = render(<OnboardingScreen />);

    fireEvent.press(getByText('Get started'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'onboarding_complete',
        'true',
      );
    });

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/');
    });
  });

  it('renders Get started button with correct testID', () => {
    const { getByTestId } = render(<OnboardingScreen />);
    expect(getByTestId('get-started-button')).toBeTruthy();
  });
});
