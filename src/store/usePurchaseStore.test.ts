import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePurchaseStore } from './usePurchaseStore';

// We test the Zustand store's synchronous actions.
// Async actions (initialize, purchase, restore) wrap react-native-iap native
// module calls which are only available on a real device — those are
// integration-tested on-device.

beforeEach(() => {
  usePurchaseStore.setState({
    isPurchased: false,
    isLoadingProducts: false,
    isPurchasing: false,
    isRestoring: false,
    error: undefined,
    product: undefined,
    connected: false,
    initialized: false,
  });
});

describe('usePurchaseStore', () => {
  describe('initial state', () => {
    it('starts unpurchased with no loading or error state', () => {
      const state = usePurchaseStore.getState();
      expect(state.isPurchased).toBe(false);
      expect(state.isLoadingProducts).toBe(false);
      expect(state.isPurchasing).toBe(false);
      expect(state.isRestoring).toBe(false);
      expect(state.error).toBeUndefined();
      expect(state.product).toBeUndefined();
      expect(state.connected).toBe(false);
      expect(state.initialized).toBe(false);
    });
  });

  describe('setPurchased', () => {
    it('sets isPurchased to true', async () => {
      await usePurchaseStore.getState().setPurchased(true);
      expect(usePurchaseStore.getState().isPurchased).toBe(true);
    });

    it('sets isPurchased to false', async () => {
      await usePurchaseStore.getState().setPurchased(false);
      expect(usePurchaseStore.getState().isPurchased).toBe(false);
    });

    it('persists to AsyncStorage', async () => {
      await usePurchaseStore.getState().setPurchased(true);
      const stored = await AsyncStorage.getItem('is_purchased');
      expect(stored).toBe('true');
    });
  });

  describe('purchase action', () => {
    it('sets isPurchasing true and clears error when starting purchase', async () => {
      // Set an error first to verify it gets cleared
      usePurchaseStore.setState({ error: 'Previous error' });
      // purchase() calls requestPurchase (mocked) — the setState before it is synchronous
      const promise = usePurchaseStore.getState().purchase();
      expect(usePurchaseStore.getState().isPurchasing).toBe(true);
      expect(usePurchaseStore.getState().error).toBeUndefined();
      await promise;
    });
  });

  describe('restorePurchases action', () => {
    it('sets isRestoring true and clears error when starting restore', async () => {
      usePurchaseStore.setState({ error: 'Previous error' });
      const promise = usePurchaseStore.getState().restorePurchases();
      expect(usePurchaseStore.getState().isRestoring).toBe(true);
      expect(usePurchaseStore.getState().error).toBeUndefined();
      await promise;
    });

    it('reports no purchases found when account has none', async () => {
      await usePurchaseStore.getState().restorePurchases();
      expect(usePurchaseStore.getState().isRestoring).toBe(false);
      expect(usePurchaseStore.getState().error).toBe(
        'No previous purchases found on this account.',
      );
    });
  });

  describe('loadProducts action', () => {
    it('sets isLoadingProducts true and clears error', async () => {
      usePurchaseStore.setState({ error: 'Previous error' });
      const promise = usePurchaseStore.getState().loadProducts();
      expect(usePurchaseStore.getState().isLoadingProducts).toBe(true);
      expect(usePurchaseStore.getState().error).toBeUndefined();
      await promise;
    });
  });

  describe('cleanup', () => {
    it('resets to initial state', () => {
      usePurchaseStore.setState({
        isPurchased: true,
        connected: true,
        initialized: true,
      });
      usePurchaseStore.getState().cleanup();
      const state = usePurchaseStore.getState();
      expect(state.isPurchased).toBe(false);
      expect(state.connected).toBe(false);
      expect(state.initialized).toBe(false);
    });
  });
});
