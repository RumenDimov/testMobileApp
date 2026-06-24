import { useEffect, useState, type ReactElement } from 'react';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMockExamStore } from '../../src/store/useMockExamStore';

function getCompletionKey(topicId: string): string {
  return `completion_shown_${topicId}`;
}

export default function MockExamResultsScreen(): ReactElement {
  const scoreCorrect = useMockExamStore((s) => s.getScoreCorrect());
  const scoreTotal = useMockExamStore((s) => s.getScoreTotal());
  const reset = useMockExamStore((s) => s.reset);
  const [checkedCompletion, setCheckedCompletion] = useState(false);

  useEffect(() => {
    if (checkedCompletion) return;

    async function checkFirstCompletion(): Promise<void> {
      try {
        const alreadyShown = await AsyncStorage.getItem(getCompletionKey('mock-exam'));
        if (!alreadyShown && scoreCorrect > 0 && scoreCorrect / scoreTotal >= 0.5) {
          router.replace('/complete/mock-exam');
          return;
        }
      } catch {
        // AsyncStorage failure should not block the results screen
      }
      setCheckedCompletion(true);
    }

    checkFirstCompletion();
  }, [checkedCompletion, scoreCorrect, scoreTotal]);

  if (scoreTotal === 0) {
    return (
      <View className="flex-1 justify-center items-center p-lg bg-background">
        <Text className="text-body text-text-secondary mb-md">
          No mock exam session in progress.
        </Text>
        <Pressable
          onPress={() => router.replace('/')}
          className="py-3.5 px-xl rounded-button bg-primary"
        >
          <Text className="text-button text-white">
            Back to Home
          </Text>
        </Pressable>
      </View>
    );
  }

  const percentage = scoreTotal > 0 ? Math.round((scoreCorrect / scoreTotal) * 100) : 0;

  const handleRetry = (): void => {
    reset();
    router.replace('/mock-exam');
  };

  const handleHome = (): void => {
    reset();
    router.replace('/');
  };

  const scoreColorClass = percentage >= 80 ? 'text-correct' : percentage >= 50 ? 'text-primary' : 'text-incorrect';

  return (
    <View className="flex-1 bg-background justify-center items-center p-lg" testID="mock-exam-results-screen">
      <Text className="text-caption font-semibold text-primary mb-sm">
        Mock Exam Complete
      </Text>

      <Text className="text-title text-text-primary mb-md">
        Your Results
      </Text>

      <View className="bg-surface rounded-card p-md items-center mb-xl border border-divider w-full max-w-[320px]">
        <Text className={`text-5xl font-bold ${scoreColorClass} mb-sm`}>
          {scoreCorrect}/{scoreTotal}
        </Text>

        <Text className="text-body text-text-secondary mb-md">
          {percentage}% correct
        </Text>

        {percentage >= 80 && (
          <Text className="text-body text-correct font-semibold text-center">
            Excellent! You are well prepared.
          </Text>
        )}
        {percentage >= 50 && percentage < 80 && (
          <Text className="text-body text-primary font-semibold text-center">
            Good effort. Review topics with lower scores and try again.
          </Text>
        )}
        {percentage < 50 && (
          <Text className="text-body text-incorrect font-semibold text-center">
            Keep studying each topic carefully before attempting the mock exam again.
          </Text>
        )}
      </View>

      <Pressable
        onPress={handleRetry}
        testID="mock-exam-retry-button"
        className="bg-primary py-3.5 px-xl rounded-button items-center min-h-[52px] justify-center w-full max-w-[320px] mb-3"
      >
        <Text className="text-button text-white">
          Retry Mock Exam
        </Text>
      </Pressable>

      <Pressable
        onPress={handleHome}
        className="py-3.5 px-xl rounded-button items-center min-h-[52px] justify-center w-full max-w-[320px] border border-primary"
      >
        <Text className="text-button text-primary">
          Back to Home
        </Text>
      </Pressable>
    </View>
  );
}
