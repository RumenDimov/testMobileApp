import { type ReactElement } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useQuizStore } from '../../../src/store/useQuizStore';

export default function TopicResultsScreen(): ReactElement {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const scoreCorrect = useQuizStore((s) => s.getScoreCorrect());
  const scoreTotal = useQuizStore((s) => s.getScoreTotal());
  const reset = useQuizStore((s) => s.reset);

  if (scoreTotal === 0) {
    return (
      <View className="flex-1 justify-center items-center p-lg bg-background">
        <Text className="text-body text-text-secondary mb-md">
          No quiz session in progress.
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
    router.replace(`/topic/${topicId}`);
  };

  const handleHome = (): void => {
    reset();
    router.replace('/');
  };

  const scoreColorClass = percentage >= 80 ? 'text-correct' : percentage >= 50 ? 'text-primary' : 'text-incorrect';

  return (
    <View className="flex-1 bg-background justify-center items-center p-lg">
      <Text className="text-title text-text-primary mb-md">
        Topic Complete
      </Text>

      <View className="bg-surface rounded-2xl p-xl items-center mb-xl border border-divider w-full max-w-[320px]">
        <Text className={`text-5xl font-bold ${scoreColorClass} mb-sm`}>
          {scoreCorrect}/{scoreTotal}
        </Text>

        <Text className="text-body text-text-secondary mb-md">
          {percentage}% correct
        </Text>

        {percentage >= 80 && (
          <Text className="text-body text-correct font-semibold text-center">
            Great job! You really know this material.
          </Text>
        )}
        {percentage >= 50 && percentage < 80 && (
          <Text className="text-body text-primary font-semibold text-center">
            Good effort. Review the explanations and try again.
          </Text>
        )}
        {percentage < 50 && (
          <Text className="text-body text-incorrect font-semibold text-center">
            Keep studying. Read the explanations carefully and retry.
          </Text>
        )}
      </View>

      <Pressable
        onPress={handleRetry}
        className="bg-primary py-3.5 px-xl rounded-button items-center min-h-[52px] justify-center w-full max-w-[320px] mb-3"
      >
        <Text className="text-button text-white">
          Retry Quiz
        </Text>
      </Pressable>

      <Pressable
        onPress={handleHome}
        className="py-3.5 px-xl rounded-button items-center min-h-[52px] justify-center w-full max-w-[320px] border-2 border-primary"
      >
        <Text className="text-button text-primary">
          Back to Home
        </Text>
      </Pressable>
    </View>
  );
}
