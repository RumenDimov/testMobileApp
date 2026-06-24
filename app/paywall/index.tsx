import { useEffect, type ReactElement } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import type { Product } from 'react-native-iap';
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

type HeroSectionProps = {
  isLoadingProducts: boolean;
  displayPrice: string | undefined;
};

function HeroSection({
  isLoadingProducts,
  displayPrice,
}: HeroSectionProps): ReactElement {
  return (
    <View className="items-center mb-lg mt-lg">
      <Text className="text-title text-text-primary text-center mb-sm">
        Unlock Full Access
      </Text>
      <Text className="text-display text-primary text-center font-bold mb-md">
        {isLoadingProducts ? '---' : displayPrice ?? '£4.99'}
      </Text>
      <Text className="text-body text-text-secondary text-center">
        One-time purchase. No subscription. Ever.
      </Text>
    </View>
  );
}

const FEATURES = [
  {
    title: 'All 16 Care Certificate standards',
    description: 'Every topic with full question sets and explanations.',
  },
  {
    title: 'Mock exam mode',
    description:
      'Timed, mixed-topic exams that simulate the real assessment.',
  },
  {
    title: 'All future content updates',
    description:
      'NVQ units and new questions — included at no extra cost.',
  },
  {
    title: 'No tracking, no ads, no account',
    description: 'Your progress stays on your device. Forever.',
  },
];

function FeatureList(): ReactElement {
  return (
    <View className="bg-surface rounded-card p-md mb-lg border border-divider">
      <Text className="text-heading text-text-primary mb-md">
        What you get:
      </Text>
      {FEATURES.map((feature, i) => (
        <View key={i} className={i < FEATURES.length - 1 ? 'mb-sm' : ''}>
          <Text className="text-body text-text-primary mb-xs">
            ✓ {feature.title}
          </Text>
          <Text className="text-caption text-text-secondary ml-sm">
            {feature.description}
          </Text>
        </View>
      ))}
    </View>
  );
}

type CtaSectionProps = {
  product: Product | undefined;
  isBusy: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  connected: boolean;
  initialized: boolean;
  error: string | undefined;
  onPurchase: () => void;
  onRestore: () => void;
  onDismiss: () => void;
};

function CtaSection({
  product,
  isBusy,
  isPurchasing,
  isRestoring,
  connected,
  initialized,
  error,
  onPurchase,
  onRestore,
  onDismiss,
}: CtaSectionProps): ReactElement {
  return (
    <View className="items-center">
      {error && (
        <View className="bg-[#FEF2F2] rounded-card p-md mb-lg border border-incorrect w-full">
          <Text className="text-body text-incorrect">{error}</Text>
        </View>
      )}

      <Pressable
        onPress={onPurchase}
        disabled={isBusy || !product}
        className={`bg-primary py-3.5 px-xl rounded-button items-center min-h-[52px] justify-center w-full mb-3 ${
          !product ? 'opacity-50' : ''
        }`}
      >
        {isPurchasing ? (
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
        onPress={onRestore}
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
        onPress={onDismiss}
        className="py-3 px-xl items-center min-h-[48px] justify-center mt-md"
      >
        <Text className="text-body text-text-secondary">
          Not now — go back
        </Text>
      </Pressable>
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
        contentContainerClassName="p-6 pb-12"
      >
        <HeroSection
          isLoadingProducts={isLoadingProducts}
          displayPrice={product?.displayPrice}
        />
        <FeatureList />
        <CtaSection
          product={product}
          isBusy={isBusy}
          isPurchasing={isPurchasing}
          isRestoring={isRestoring}
          connected={connected}
          initialized={initialized}
          error={error}
          onPurchase={handlePurchase}
          onRestore={handleRestore}
          onDismiss={handleDismiss}
        />
      </ScrollView>
    </View>
  );
}
