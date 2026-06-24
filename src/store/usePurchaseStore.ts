import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product, Purchase, PurchaseError } from 'react-native-iap';
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  finishTransaction,
  getAvailablePurchases,
  purchaseUpdatedListener,
  purchaseErrorListener,
} from 'react-native-iap';
import type { EventSubscription } from 'react-native-iap';

const PURCHASED_KEY = 'is_purchased';
const PRODUCT_SKU = 'full_unlock';

type PurchaseState = {
  isPurchased: boolean;
  isLoadingProducts: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  error: string | undefined;
  product: Product | undefined;
  connected: boolean;
  initialized: boolean;
};

type PurchaseActions = {
  initialize: () => Promise<void>;
  loadProducts: () => Promise<void>;
  purchase: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  setPurchased: (value: boolean) => Promise<void>;
  cleanup: () => void;
};

const initialState: PurchaseState = {
  isPurchased: false,
  isLoadingProducts: false,
  isPurchasing: false,
  isRestoring: false,
  error: undefined,
  product: undefined,
  connected: false,
  initialized: false,
};

let purchaseListener: EventSubscription | undefined;
let errorListener: EventSubscription | undefined;
let initializePromise: Promise<void> | undefined;

async function loadStoredPurchaseFlag(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(PURCHASED_KEY);
    return stored === 'true';
  } catch {
    return false;
  }
}

export const usePurchaseStore = create<PurchaseState & PurchaseActions>(
  (set, get) => ({
    ...initialState,

    initialize: async (): Promise<void> => {
      if (get().initialized) return;
      if (initializePromise) return initializePromise;

      initializePromise = (async (): Promise<void> => {
        try {
          await initConnection();
          set({ connected: true });

          purchaseListener = purchaseUpdatedListener(
            async (purchase: Purchase) => {
              if (
                purchase.productId === PRODUCT_SKU &&
                purchase.purchaseState === 'purchased'
              ) {
                try {
                  await finishTransaction({
                    purchase,
                    isConsumable: false,
                  });
                  await get().setPurchased(true);
                } catch {
                  // Transaction finish failure should not block state update
                }
                set({ isPurchasing: false });
              }
            },
          );

          errorListener = purchaseErrorListener(
            (iapError: PurchaseError) => {
              set({
                isPurchasing: false,
                isRestoring: false,
                error:
                  iapError.message || 'Purchase failed. Please try again.',
              });
            },
          );

          // Check purchases: always consult Play Store first, use cached flag as offline fallback
          let hasValidPurchase = false;
          try {
            const purchases = await getAvailablePurchases();
            hasValidPurchase = purchases.some(
              (p) => p.productId === PRODUCT_SKU,
            );
          } catch {
            // Store query failed — fall through to cached flag
          }

          if (hasValidPurchase) {
            await get().setPurchased(true);
          } else {
            const storedFlag = await loadStoredPurchaseFlag();
            if (storedFlag) {
              set({ isPurchased: true });
            }
          }

          set({ initialized: true });
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Failed to connect to store';
          // Leave initialized false so callers can retry
          set({ error: message, connected: false });
        }
      })();

      try {
        await initializePromise;
      } finally {
        initializePromise = undefined;
      }
    },

    loadProducts: async (): Promise<void> => {
      set({ isLoadingProducts: true, error: undefined });
      try {
        const result = await fetchProducts({
          skus: [PRODUCT_SKU],
          type: 'in-app',
        });
        const found = Array.isArray(result)
          ? (result as Product[]).find((p) => p.id === PRODUCT_SKU)
          : undefined;
        set({ product: found, isLoadingProducts: false });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to load product information';
        set({ error: message, isLoadingProducts: false });
      }
    },

    purchase: async (): Promise<void> => {
      set({ isPurchasing: true, error: undefined });
      try {
        await requestPurchase({
          request: {
            google: { skus: [PRODUCT_SKU] },
            apple: { sku: PRODUCT_SKU },
          },
          type: 'in-app',
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Purchase could not be started';
        set({ isPurchasing: false, error: message });
      }
    },

    restorePurchases: async (): Promise<void> => {
      set({ isRestoring: true, error: undefined });
      try {
        const purchases = await getAvailablePurchases();
        const hasUnlock = purchases.some(
          (p) => p.productId === PRODUCT_SKU,
        );
        if (hasUnlock) {
          await get().setPurchased(true);
          set({ isRestoring: false });
        } else {
          set({
            isRestoring: false,
            error: 'No previous purchases found on this account.',
          });
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to restore purchases. Check your internet connection.';
        set({ isRestoring: false, error: message });
      }
    },

    setPurchased: async (value: boolean): Promise<void> => {
      try {
        await AsyncStorage.setItem(PURCHASED_KEY, JSON.stringify(value));
      } catch {
        // Persistence failure should not block use
      }
      set({ isPurchased: value });
    },

    cleanup: (): void => {
      purchaseListener?.remove();
      errorListener?.remove();
      purchaseListener = undefined;
      errorListener = undefined;
      endConnection().catch(() => {});
      set({ ...initialState });
    },
  }),
);
