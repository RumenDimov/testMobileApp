/// <reference types="jest" />
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import SettingsScreen from '../settings';
import { usePurchaseStore } from '../../src/store/usePurchaseStore';
import { Linking } from 'react-native';
import { setDb } from '../../src/lib/db';
import { createMockDb } from '../../src/test-utils/mocks';

const mockRouter = router;
const mockDb = createMockDb();

beforeEach(() => {
  jest.clearAllMocks();
  setDb(mockDb);
  usePurchaseStore.setState({
    isPurchased: false,
    isLoadingProducts: false,
    isPurchasing: false,
    isRestoring: false,
    error: undefined,
    product: undefined,
    connected: false,
    initialized: true,
  });
});

describe('SettingsScreen', () => {
  it('renders the settings title', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Settings')).toBeTruthy();
  });

  it('renders Restore Purchase section', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Restore Purchase')).toBeTruthy();
  });

  it('shows "already purchased" when isPurchased is true', () => {
    usePurchaseStore.setState({ isPurchased: true });
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('You already have full access.')).toBeTruthy();
  });

  it('shows restore prompt when not purchased', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText(/If you've purchased before/)).toBeTruthy();
  });

  it('renders Send feedback section', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Send feedback')).toBeTruthy();
  });

  it('opens email client on feedback tap', () => {
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText('Email feedback'));
    expect(Linking.openURL).toHaveBeenCalledWith(
      expect.stringContaining('mailto:carepractice.feedback@gmail.com'),
    );
  });

  it('renders Disclaimer section', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Disclaimer')).toBeTruthy();
    expect(getByText(/This app is a study aid/)).toBeTruthy();
  });

  it('renders version info', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText(/CarePractice v/)).toBeTruthy();
  });

  it('navigates back on back press', () => {
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText('← Back'));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('calls restorePurchases on restore tap', async () => {
    const { getByText } = render(<SettingsScreen />);
    fireEvent.press(getByText('Restore previous purchase'));
    await waitFor(() => {
      expect(usePurchaseStore.getState().isRestoring).toBe(false);
    });
  });
});
