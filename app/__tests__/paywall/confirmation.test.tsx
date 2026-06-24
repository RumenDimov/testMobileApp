/// <reference types="jest" />
import { render, fireEvent } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import PurchaseConfirmationScreen from '../../paywall/confirmation';

const mockRouter = router;
const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PurchaseConfirmationScreen', () => {
  it('renders the welcome message', () => {
    mockUseLocalSearchParams.mockReturnValue({ source: 'purchase' });
    const { getByText } = render(<PurchaseConfirmationScreen />);
    expect(getByText('Welcome to full access!')).toBeTruthy();
  });

  it('renders the what-happens-next section', () => {
    mockUseLocalSearchParams.mockReturnValue({ source: 'purchase' });
    const { getByText } = render(<PurchaseConfirmationScreen />);
    expect(getByText('What happens next:')).toBeTruthy();
    expect(getByText(/All locked topics are now available/)).toBeTruthy();
    expect(getByText(/Mock exam mode is unlocked/)).toBeTruthy();
    expect(getByText(/Your purchase is saved/)).toBeTruthy();
  });

  it('navigates home on Back to Home', () => {
    mockUseLocalSearchParams.mockReturnValue({ source: 'purchase' });
    const { getByText } = render(<PurchaseConfirmationScreen />);
    fireEvent.press(getByText('Back to Home'));
    expect(mockRouter.replace).toHaveBeenCalledWith('/');
  });

  it('renders with source=purchase', () => {
    mockUseLocalSearchParams.mockReturnValue({ source: 'purchase' });
    const { getByTestId } = render(<PurchaseConfirmationScreen />);
    expect(getByTestId('confirmation-screen')).toBeTruthy();
  });

  it('renders with source=restore', () => {
    mockUseLocalSearchParams.mockReturnValue({ source: 'restore' });
    const { getByTestId } = render(<PurchaseConfirmationScreen />);
    expect(getByTestId('confirmation-screen')).toBeTruthy();
  });

  it('renders without crashing with no source param', () => {
    mockUseLocalSearchParams.mockReturnValue({});
    const { getByTestId } = render(<PurchaseConfirmationScreen />);
    expect(getByTestId('confirmation-screen')).toBeTruthy();
  });
});
