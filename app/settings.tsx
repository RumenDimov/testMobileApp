import { useEffect, useState, type ReactElement } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import { usePurchaseStore } from '../src/store/usePurchaseStore';
import { trackEvent } from '../src/lib/analytics';

const FEEDBACK_EMAIL = 'carepractice.feedback@gmail.com';

function openFeedback(): void {
  const subject = encodeURIComponent('CarePractice Feedback');
  const body = encodeURIComponent(
    'Hi, I have some feedback about the Care Practice app:\n\n',
  );
  Linking.openURL(`mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`).catch(
    () => {},
  );
}

const DISCLAIMER = [
  'This app is a study aid designed to help care workers prepare for the Care Certificate and NVQ qualifications.',
  'All questions and explanations are practice material only — they are not official assessment answers and should not be copied into portfolios or exams.',
  'Always refer to your employer\'s policies and procedures alongside your learning. If you are unsure about anything in your workplace, speak to your manager or supervisor.',
  'This app is not affiliated with, endorsed by, or connected to any awarding body, Skills for Care, or the Care Quality Commission.',
];

export default function SettingsScreen(): ReactElement {
  const isRestoring = usePurchaseStore((s) => s.isRestoring);
  const error = usePurchaseStore((s) => s.error);
  const isPurchased = usePurchaseStore((s) => s.isPurchased);
  const restorePurchases = usePurchaseStore((s) => s.restorePurchases);
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  useEffect(() => {
    trackEvent('settings_viewed');
  }, []);

  const handleRestore = async (): Promise<void> => {
    setLocalError(undefined);
    trackEvent('restore_purchase_initiated');
    await restorePurchases();
  };

  return (
    <ScrollView className="flex-1 bg-background" testID="settings-screen">
      <View className="p-lg">
        <View className="flex-row items-center mb-lg">
          <Pressable
            onPress={(): void => router.back()}
            className="py-2 pr-md min-h-[48px] justify-center"
          >
            <Text className="text-button text-primary">← Back</Text>
          </Pressable>
          <Text className="text-title text-text-primary">Settings</Text>
        </View>

        <View className="bg-surface rounded-card p-md mb-lg border border-divider">
          <Text className="text-heading text-text-primary mb-md">
            Restore Purchase
          </Text>
          <Text className="text-body text-text-secondary mb-md">
            {isPurchased
              ? 'You already have full access.'
              : 'If you\'ve purchased before, restore your access here.'}
          </Text>

          {(error ?? localError) && (
            <View className="bg-incorrect-light rounded-card p-md mb-md border border-incorrect">
              <Text className="text-body text-incorrect">
                {error ?? localError}
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleRestore}
            disabled={isRestoring || isPurchased}
            testID="settings-restore-button"
            className={`py-3 px-xl rounded-button items-center min-h-[48px] justify-center border border-primary ${
              isPurchased ? 'opacity-50' : ''
            }`}
          >
            {isRestoring ? (
              <ActivityIndicator color="#7C3AED" size="small" />
            ) : (
              <Text className="text-button text-primary">
                {isPurchased ? 'Already purchased' : 'Restore previous purchase'}
              </Text>
            )}
          </Pressable>
        </View>

        <View className="bg-surface rounded-card p-md mb-lg border border-divider">
          <Text className="text-heading text-text-primary mb-md">
            Send feedback
          </Text>
          <Text className="text-body text-text-secondary mb-md">
            Found a wrong answer? Have an idea to make the app better? We read
            every message.
          </Text>
          <Pressable
            onPress={openFeedback}
            testID="settings-feedback-button"
            className="py-3 px-xl rounded-button items-center min-h-[48px] justify-center border border-primary"
          >
            <Text className="text-button text-primary">Email feedback</Text>
          </Pressable>
        </View>

        <View className="bg-surface rounded-card p-md mb-lg border border-divider">
          <Text className="text-heading text-text-primary mb-md">
            Disclaimer
          </Text>
          {DISCLAIMER.map((paragraph, i) => (
            <Text
              key={i}
              className={`text-body text-text-secondary ${
                i < DISCLAIMER.length - 1 ? 'mb-sm' : ''
              }`}
            >
              {paragraph}
            </Text>
          ))}
        </View>

        <Text className="text-caption text-text-secondary text-center">
          CarePractice v{Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </View>
    </ScrollView>
  );
}
