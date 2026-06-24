import { useEffect, type ReactElement } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useProgressStore } from '../src/store/useProgressStore';

function LoadingState(): ReactElement {
  return (
    <View className="flex-1 justify-center items-center bg-background">
      <ActivityIndicator size="large" color="#7C3AED" />
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }): ReactElement {
  return (
    <View className="flex-1 justify-center items-center p-lg bg-background">
      <Text className="text-body text-incorrect text-center mb-md">{message}</Text>
      <Pressable
        onPress={onRetry}
        className="py-3 px-xl rounded-button border border-primary"
      >
        <Text className="text-button text-primary">Try again</Text>
      </Pressable>
    </View>
  );
}

function EmptyState(): ReactElement {
  return (
    <View className="flex-1 justify-center items-center p-lg bg-background">
      <Text className="text-heading text-text-primary text-center mb-sm">
        No progress yet
      </Text>
      <Text className="text-body text-text-secondary text-center mb-lg">
        Complete a quiz to see your stats here.
      </Text>
      <Pressable
        onPress={(): void => router.replace('/')}
        className="py-3 px-xl rounded-button bg-primary"
      >
        <Text className="text-button text-white">Back to Home</Text>
      </Pressable>
    </View>
  );
}

export default function ProgressScreen(): ReactElement {
  const overallStats = useProgressStore((s) => s.overallStats);
  const topicProgress = useProgressStore((s) => s.topicProgress);
  const mockExamStats = useProgressStore((s) => s.mockExamStats);
  const isLoading = useProgressStore((s) => s.isLoading);
  const error = useProgressStore((s) => s.error);
  const loadAll = useProgressStore((s) => s.loadAll);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadAll} />;
  }

  const hasAnyProgress = overallStats && overallStats.total_attempts > 0;

  if (!hasAnyProgress) {
    return <EmptyState />;
  }

  const attemptedTopics = topicProgress.filter((t) => t.attempts > 0);
  const totalTopics = topicProgress.length;

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-lg">
        <View className="flex-row items-center mb-lg">
          <Pressable
            onPress={(): void => router.back()}
            className="py-2 pr-md min-h-[48px] justify-center"
          >
            <Text className="text-button text-primary">← Back</Text>
          </Pressable>
          <Text className="text-title text-text-primary">Your Progress</Text>
        </View>

        <View className="bg-surface rounded-card p-md mb-lg border border-divider">
          <Text className="text-heading text-text-primary mb-md">Overall</Text>

          <View className="flex-row flex-wrap">
            <View className="w-1/2 mb-md">
              <Text className="text-caption text-text-secondary">Topics attempted</Text>
              <Text className="text-heading text-primary">
                {attemptedTopics.length} / {totalTopics}
              </Text>
            </View>

            <View className="w-1/2 mb-md">
              <Text className="text-caption text-text-secondary">Quiz attempts</Text>
              <Text className="text-heading text-primary">
                {overallStats.total_attempts}
              </Text>
            </View>

            <View className="w-1/2 mb-md">
              <Text className="text-caption text-text-secondary">Questions answered</Text>
              <Text className="text-heading text-primary">
                {overallStats.questions_answered}
              </Text>
            </View>

            <View className="w-1/2 mb-md">
              <Text className="text-caption text-text-secondary">Average score</Text>
              <Text className="text-heading text-primary">
                {overallStats.average_score_pct}%
              </Text>
            </View>
          </View>
        </View>

        {mockExamStats && mockExamStats.attempts > 0 && (
          <View className="bg-surface rounded-card p-md mb-lg border border-divider">
            <Text className="text-heading text-text-primary mb-md">Mock Exam</Text>

            <View className="flex-row flex-wrap">
              <View className="w-1/2 mb-md">
                <Text className="text-caption text-text-secondary">Attempts</Text>
                <Text className="text-heading text-primary">
                  {mockExamStats.attempts}
                </Text>
              </View>

              <View className="w-1/2 mb-md">
                <Text className="text-caption text-text-secondary">Best score</Text>
                {mockExamStats.best_total > 0 ? (
                  <Text className="text-heading text-primary">
                    {mockExamStats.best_correct}/{mockExamStats.best_total}
                  </Text>
                ) : (
                  <Text className="text-heading text-text-secondary">—</Text>
                )}
              </View>
            </View>
          </View>
        )}

        <Text className="text-heading text-text-primary mb-md">Topics</Text>

        {attemptedTopics.map((topic) => {
          const bestPct = topic.best_total > 0
            ? Math.round((topic.best_correct / topic.best_total) * 100)
            : 0;
          const scoreColor = bestPct >= 80 ? 'text-correct' : bestPct >= 50 ? 'text-primary' : 'text-incorrect';

          return (
            <View
              key={topic.topic_id}
              className="bg-surface rounded-card p-md mb-3 border border-divider"
            >
              <View className="flex-row justify-between items-center mb-sm">
                <Text className="text-body font-semibold text-text-primary flex-1">
                  {topic.topic_title}
                </Text>
                {topic.is_free === 1 && (
                  <Text className="text-caption font-semibold text-primary bg-primary-light px-sm py-xs rounded-lg ml-sm">
                    Free
                  </Text>
                )}
              </View>

              <View className="flex-row justify-between">
                <Text className="text-caption text-text-secondary">
                  {topic.attempts} attempt{topic.attempts !== 1 ? 's' : ''}
                </Text>
                {topic.best_total > 0 && (
                  <Text className={`text-caption font-semibold ${scoreColor}`}>
                    Best: {topic.best_correct}/{topic.best_total} ({bestPct}%)
                  </Text>
                )}
              </View>
            </View>
          );
        })}

        <View className="h-xl" />
      </View>
    </ScrollView>
  );
}
