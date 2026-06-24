import { useEffect, type ReactElement } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { usePurchaseStore } from '../../src/store/usePurchaseStore';

function LoadingState(): ReactElement {
  return (
    <View className="flex-1 justify-center items-center bg-background">
      <ActivityIndicator size="large" color="#7C3AED" />
      <Text className="text-body text-text-secondary mt-md">
        Loading store...
      </Text>
    </View>
  );
}

export default function PaywallScreen(): ReactElement {
  const connected = usePurchaseStore((s) => s.connected);
  const initialized = usePurchaseStore((s) => s.initialized);
  const isPurchased = usePurchaseStore((s) => s.isPurchased);
  const isLoadingProducts = usePurchaseStore((s) => s.isLoadingProducts);
  const isPurchasing = usePurchaseStore((s) => s.isPurchasing);
  const isRestoring = usePurchaseStore((s) => s.isRestoring);
  const error = usePurchaseStore((s) => s.error);
  const product = usePurchaseStore((s) => s.product);
  const initialize = usePurchaseStore((s) => s.initialize);
  const loadProducts = usePurchaseStore((s) => s.loadProducts);
  const purchase = usePurchaseStore((s) => s.purchase);
  const restorePurchases = usePurchaseStore((s) => s.restorePurchases);

  useEffect(() => {
    initialize().then(() => {
      loadProducts();
    });
  }, [initialize, loadProducts]);

  // If already purchased, redirect to confirmation
  useEffect(() => {
    if (isPurchased) {
      router.replace('/paywall/confirmation');
    }
  }, [isPurchased]);

  if (!initialized) {
    return <LoadingState />;
  }

  const handlePurchase = (): void => {
    if (isPurchasing || isRestoring) return;
    purchase();
  };

  const handleRestore = (): void => {
    if (isPurchasing || isRestoring) return;
    restorePurchases();
  };

  const handleDismiss = (): void => {
    router.back();
  };

  const isBusy = isPurchasing || isRestoring;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
      >
        {/* Hero section */}
        <View className="items-center mb-lg mt-lg">
          <Text className="text-title text-text-primary text-center mb-sm">
            Unlock Full Access
          </Text>
          <Text className="text-display text-primary text-center font-bold mb-md">
            {isLoadingProducts
              ? '---'
              : product?.displayPrice ?? '£4.99'}
          </Text>
          <Text className="text-body text-text-secondary text-center">
            One-time purchase. No subscription. Ever.
          </Text>
        </View>

        {/* Feature list */}
        <View className="bg-surface rounded-card p-md mb-lg border border-divider">
          <Text className="text-heading text-text-primary mb-md">
            What you get:
          </Text>

          <View className="mb-sm">
            <Text className="text-body text-text-primary mb-xs">
              ✓ All 16 Care Certificate standards
            </Text>
            <Text className="text-caption text-text-secondary ml-sm">
              Every topic with full question sets and explanations.
            </Text>
          </View>

          <View className="mb-sm">
            <Text className="text-body text-text-primary mb-xs">
              ✓ Mock exam mode
            </Text>
            <Text className="text-caption text-text-secondary ml-sm">
              Timed, mixed-topic exams that simulate the real assessment.
            </Text>
          </View>

          <View className="mb-sm">
            <Text className="text-body text-text-primary mb-xs">
              ✓ All future content updates
            </Text>
            <Text className="text-caption text-text-secondary ml-sm">
              NVQ units and new questions — included at no extra cost.
            </Text>
          </View>

          <View>
            <Text className="text-body text-text-primary mb-xs">
              ✓ No tracking, no ads, no account
            </Text>
            <Text className="text-caption text-text-secondary ml-sm">
              Your progress stays on your device. Forever.
            </Text>
          </View>
        </View>

        {/* Error message */}
        {error && (
          <View className="bg-[#FEF2F2] rounded-card p-md mb-lg border border-incorrect">
            <Text className="text-body text-incorrect">{error}</Text>
          </View>
        )}

        {/* CTA section */}
        <View className="items-center">
          <Pressable
            onPress={handlePurchase}
            disabled={isBusy || !product}
            className={`bg-primary py-3.5 px-xl rounded-button items-center min-h-[52px] justify-center w-full mb-3 ${
              !product ? 'opacity-50' : ''
            }`}
          >
            {isBusy ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="text-button text-white">
                {product
                  ? `Unlock full access — ${product.displayPrice}`
                  : 'Connect to Play Store'}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={handleRestore}
            disabled={isBusy}
            className="py-3 px-xl items-center min-h-[48px] justify-center"
          >
            {isRestoring ? (
              <ActivityIndicator color="#7C3AED" size="small" />
            ) : (
              <Text className="text-button text-primary">
                Restore previous purchase
              </Text>
            )}
          </Pressable>

          {!connected && initialized && (
            <Text className="text-caption text-incorrect text-center mt-md">
              No connection to Google Play Store.{'\n'}
              Check your internet connection and try again.
            </Text>
          )}

          {connected && (
            <Text className="text-caption text-text-secondary text-center mt-md">
              Pay once, keep forever.
            </Text>
          )}

          <Pressable
            onPress={handleDismiss}
            className="py-3 px-xl items-center min-h-[48px] justify-center mt-md"
          >
            <Text className="text-body text-text-secondary">
              Not now — go back
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
