import { useEffect, type ReactElement } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { trackEvent } from '../../src/lib/analytics';

export default function PurchaseConfirmationScreen(): ReactElement {
  const { source } = useLocalSearchParams<{ source?: string }>();

  useEffect(() => {
    if (source === 'purchase') {
      trackEvent('purchase_completed');
      trackEvent('purchase');
    } else if (source === 'restore') {
      trackEvent('restore_completed');
    }
  }, [source]);
  const handleHome = (): void => {
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-background justify-center items-center p-lg" testID="confirmation-screen">
      <View className="bg-primary rounded-full w-20 h-20 items-center justify-center mb-lg">
        <Text className="text-white text-4xl font-bold">✓</Text>
      </View>

      <Text className="text-title text-text-primary text-center mb-sm">
        Welcome to full access!
      </Text>

      <Text className="text-body text-text-secondary text-center mb-xl max-w-[320px]">
        You now have access to all 16 Care Certificate standards and mock exam
        mode. Thank you for your support.
      </Text>

      <View className="bg-surface rounded-card p-md mb-xl border border-divider w-full max-w-[320px]">
        <Text className="text-body text-text-primary mb-sm font-semibold">
          What happens next:
        </Text>
        <Text className="text-body text-text-primary mb-xs">
          1. All locked topics are now available to study
        </Text>
        <Text className="text-body text-text-primary mb-xs">
          2. Mock exam mode is unlocked with timed questions
        </Text>
        <Text className="text-body text-text-primary">
          3. Your purchase is saved to your Google account — restore anytime
        </Text>
      </View>

      <Pressable
        onPress={handleHome}
        testID="confirmation-home"
        className="bg-primary py-3.5 px-xl rounded-button items-center min-h-[52px] justify-center w-full max-w-[320px]"
      >
        <Text className="text-button text-white">Back to Home</Text>
      </Pressable>
    </View>
  );
}
