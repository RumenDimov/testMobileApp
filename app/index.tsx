import { useEffect, useState, type ReactElement } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import type { TopicSummary } from '../src/db/queries/questions';
import { getAllTopics } from '../src/db/queries/questions';

type TopicCardProps = {
  topic: TopicSummary;
};

function TopicCard({ topic }: TopicCardProps): ReactElement {
  return (
    <View className="bg-surface rounded-card p-md mb-3 border border-divider">
      <View className="flex-row justify-between items-center">
        <Text className="text-heading text-text-primary flex-1">
          {topic.title}
        </Text>
        {topic.is_free === 1 ? (
          <Text className="text-xs font-semibold text-primary bg-primary-light px-sm py-xs rounded-lg">
            Free
          </Text>
        ) : (
          <Text className="text-xs font-semibold text-locked bg-divider px-sm py-xs rounded-lg">
            Locked
          </Text>
        )}
      </View>

      <Text className="text-caption text-text-secondary mt-1 mb-3">
        {topic.summary}
      </Text>

      <Text className="text-caption text-text-secondary mb-3">
        {topic.question_count} questions
      </Text>

      <Pressable
        onPress={() => router.push(`/topic/${topic.id}`)}
        className="bg-primary py-3 px-lg rounded-button items-center min-h-[48px] justify-center"
      >
        <Text className="text-button text-white">
          Start Quiz
        </Text>
      </Pressable>
    </View>
  );
}

function LoadingState(): ReactElement {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#7C3AED" />
    </View>
  );
}

function ErrorState({ message }: { message: string }): ReactElement {
  return (
    <View className="flex-1 justify-center items-center p-lg">
      <Text className="text-body text-incorrect text-center">{message}</Text>
    </View>
  );
}

function EmptyState(): ReactElement {
  return (
    <Text className="text-body text-text-secondary text-center mt-12">
      No topics available yet.
    </Text>
  );
}

export default function HomeScreen(): ReactElement {
  const db = useSQLiteContext();
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const result = await getAllTopics(db);
        setTopics(result);
        setError(undefined);
      } catch {
        setError('Unable to load topics. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [db]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <View className="flex-1 p-lg bg-background">
      <Text className="text-title text-text-primary mb-lg">
        Care Certificate Practice
      </Text>

      {topics.map((topic) => (
        <TopicCard key={topic.id} topic={topic} />
      ))}

      {topics.length === 0 && <EmptyState />}
    </View>
  );
}
