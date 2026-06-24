/// <reference types="jest" />
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import PaywallScreen from '../../paywall/index';
import { usePurchaseStore } from '../../../src/store/usePurchaseStore';

const mockRouter = useRouter();

beforeEach(() => {
  jest.clearAllMocks();
  usePurchaseStore.setState({
    isPurchased: false,
    isLoadingProducts: false,
    isPurchasing: false,
    isRestoring: false,
    error: undefined,
    product: { id: 'full_unlock', displayPrice: '£4.99', type: 'in-app', localizedPrice: '£4.99', currency: 'GBP', price: '4.99' },
    connected: true,
    initialized: true,
  });
});

describe('PaywallScreen', () => {
  it('renders the paywall heading', () => {
    const { getByText, getByTestId } = render(<PaywallScreen />);
    expect(getByTestId('paywall-screen')).toBeTruthy();
    expect(getByText('Unlock Full Access')).toBeTruthy();
  });

  it('shows the one-time purchase message', () => {
    const { getByText } = render(<PaywallScreen />);
    expect(getByText('One-time purchase. No subscription. Ever.')).toBeTruthy();
  });

  it('shows the product price', () => {
    const { getByText } = render(<PaywallScreen />);
    expect(getByText('£4.99')).toBeTruthy();
  });

  it('renders the feature list', () => {
    const { getByText } = render(<PaywallScreen />);
    expect(getByText('What you get:')).toBeTruthy();
    expect(getByText(/All 16 Care Certificate standards/)).toBeTruthy();
    expect(getByText(/Mock exam mode/)).toBeTruthy();
  });

  it('renders purchase button', () => {
    const { getByTestId } = render(<PaywallScreen />);
    expect(getByTestId('purchase-button')).toBeTruthy();
  });

  it('renders restore button', () => {
    const { getByTestId } = render(<PaywallScreen />);
    expect(getByTestId('restore-button')).toBeTruthy();
  });

  it('renders dismiss button', () => {
    const { getByTestId } = render(<PaywallScreen />);
    expect(getByTestId('dismiss-paywall')).toBeTruthy();
  });

  it('shows loading state when not initialized', () => {
    usePurchaseStore.setState({ initialized: false });
    const { getByText } = render(<PaywallScreen />);
    expect(getByText('Loading store...')).toBeTruthy();
  });

  it('navigates back on dismiss', () => {
    const { getByText } = render(<PaywallScreen />);
    fireEvent.press(getByText('Not now — go back'));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('shows no-connection message when not connected', () => {
    usePurchaseStore.setState({ connected: false, product: undefined });
    const { getByText } = render(<PaywallScreen />);
    expect(getByText(/No connection to Google Play Store/)).toBeTruthy();
  });

  it('shows "Connect to Play Store" when no product loaded', () => {
    usePurchaseStore.setState({ product: undefined });
    const { getByText } = render(<PaywallScreen />);
    expect(getByText('Connect to Play Store')).toBeTruthy();
  });

  it('shows error message when error is set', () => {
    usePurchaseStore.setState({ error: 'Purchase failed' });
    const { getByText } = render(<PaywallScreen />);
    expect(getByText('Purchase failed')).toBeTruthy();
  });

  it('shows "Pay once, keep forever" when connected', () => {
    const { getByText } = render(<PaywallScreen />);
    expect(getByText('Pay once, keep forever.')).toBeTruthy();
  });

  it('calls purchase on purchase button tap', async () => {
    const purchaseSpy = jest.spyOn(usePurchaseStore.getState(), 'purchase');
    const { getByTestId } = render(<PaywallScreen />);
    fireEvent.press(getByTestId('purchase-button'));
    await waitFor(() => {
      expect(purchaseSpy).toHaveBeenCalled();
    });
  });
});
