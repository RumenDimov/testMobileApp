import { useEffect, type ReactElement } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackEvent } from '../src/lib/analytics';

const ONBOARDING_KEY = 'onboarding_complete';

async function markOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {
    // Best-effort — don't block navigation
  }
}

export default function OnboardingScreen(): ReactElement {
  useEffect(() => {
    trackEvent('onboarding_viewed');
  }, []);

  const handleGetStarted = async (): Promise<void> => {
    trackEvent('onboarding_completed');
    await markOnboardingComplete();
    router.replace('/');
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center p-lg pt-xl">
        <View className="bg-primary rounded-3xl w-20 h-20 items-center justify-center mb-lg">
          <Text className="text-display text-white">📚</Text>
        </View>

        <Text className="text-display text-text-primary text-center mb-sm">
          Care Practice
        </Text>

        <Text className="text-body text-text-secondary text-center mb-xl px-md">
          Short, plain-English practice quizzes for the Care Certificate and NVQ
          qualifications — built for 10-minute gaps between shifts.
        </Text>

        <View className="bg-surface rounded-card p-md mb-lg border border-divider w-full max-w-[360px]">
          <Text className="text-heading text-primary mb-sm">
            Understand it. Don&apos;t just copy it.
          </Text>
          <Text className="text-body text-text-secondary mb-md">
            Every question comes with a plain-English explanation. This is a
            study aid, not a cheat tool — learn the material properly so you
            feel confident on the job.
          </Text>
        </View>

        <View className="bg-primary-light rounded-card p-md mb-lg border border-divider w-full max-w-[360px]">
          <Text className="text-heading text-primary mb-sm">
            Free and paid — no subscription, ever
          </Text>
          <Text className="text-body text-text-secondary mb-sm">
            Several full Care Certificate standards are free, permanently. The
            rest plus mock exams unlock with a one-time purchase.
          </Text>
          <Text className="text-caption text-primary font-semibold">
            Pay once. Keep forever. No surprises.
          </Text>
        </View>

        <View className="bg-surface rounded-card p-md mb-xl border border-divider w-full max-w-[360px]">
          <Text className="text-heading text-text-primary mb-sm">
            Works offline
          </Text>
          <Text className="text-body text-text-secondary">
            Study anywhere — in a break room, on the bus, or in airplane mode.
            No account needed, no internet required.
          </Text>
        </View>

        <Pressable
          onPress={handleGetStarted}
          className="bg-primary py-3.5 px-xl rounded-button items-center min-h-[52px] justify-center w-full max-w-[360px]"
        >
          <Text className="text-button text-white">Get started</Text>
        </Pressable>

        <View className="h-xl" />
      </View>
    </ScrollView>
  );
}
