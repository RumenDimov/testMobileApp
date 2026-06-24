import { useEffect, useState, type ReactElement } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TopicSummary, TopicBestScore } from '../src/db/queries/questions';
import { getAllTopics, getTopicBestScores } from '../src/db/queries/questions';
import { usePurchaseStore } from '../src/store/usePurchaseStore';

type TopicCardProps = {
  topic: TopicSummary;
  bestScore: TopicBestScore | undefined;
  isPurchased: boolean;
  onPurchaseRequired: () => void;
};

function TopicCard({ topic, bestScore, isPurchased, onPurchaseRequired }: TopicCardProps): ReactElement {
  const isAccessible = topic.is_free === 1 || isPurchased;

  const handlePress = (): void => {
    if (isAccessible) {
      router.push(`/topic/${topic.id}`);
    } else {
      onPurchaseRequired();
    }
  };

  return (
    <View className="bg-surface rounded-card p-md mb-3 border border-divider">
      <View className="flex-row justify-between items-center">
        <Text className="text-heading text-text-primary flex-1">
          {topic.title}
        </Text>
        {topic.is_free === 1 ? (
          <Text className="text-caption font-semibold text-primary bg-primary-light px-sm py-xs rounded-lg">
            Free
          </Text>
        ) : isPurchased ? (
          <Text className="text-caption font-semibold text-correct bg-correct-light px-sm py-xs rounded-lg">
            Unlocked
          </Text>
        ) : (
          <Text className="text-caption font-semibold text-locked bg-divider px-sm py-xs rounded-lg">
            Locked
          </Text>
        )}
      </View>

      <Text className="text-caption text-text-secondary mt-1 mb-3">
        {topic.summary}
      </Text>

      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-caption text-text-secondary">
          {topic.question_count} questions
        </Text>
        {bestScore && (
          <Text className="text-caption text-text-secondary">
            Best: {bestScore.best_correct}/{bestScore.best_total}
          </Text>
        )}
      </View>

      <Pressable
        onPress={handlePress}
        className={`py-3 px-lg rounded-button items-center min-h-[48px] justify-center ${
          isAccessible ? 'bg-primary' : 'bg-locked'
        }`}
      >
        <Text className="text-button text-white">
          {isAccessible ? 'Start Quiz' : 'Unlock to Start'}
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
  const [bestScores, setBestScores] = useState<Map<string, TopicBestScore>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const isPurchased = usePurchaseStore((s) => s.isPurchased);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    async function checkOnboarding(): Promise<void> {
      try {
        const done = await AsyncStorage.getItem('onboarding_complete');
        if (!done) {
          router.replace('/onboarding');
          return;
        }
      } catch {
        // AsyncStorage failure — show home anyway
      }
      setOnboardingDone(true);
    }
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (!onboardingDone) return;
    async function load(): Promise<void> {
      try {
        const [result, scores] = await Promise.all([
          getAllTopics(db),
          getTopicBestScores(db),
        ]);
        setTopics(result);
        const scoreMap = new Map<string, TopicBestScore>();
        for (const score of scores) {
          scoreMap.set(score.topic_id, score);
        }
        setBestScores(scoreMap);
        setError(undefined);
      } catch {
        setError('Unable to load topics. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [db, onboardingDone]);

  const handlePurchaseRequired = (): void => {
    router.push('/paywall');
  };

  const handleMockExam = (): void => {
    if (isPurchased) {
      router.push('/mock-exam');
    } else {
      router.push('/paywall');
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-lg relative">
        <Text className="text-title text-text-primary mb-lg">
          Care Certificate Practice
        </Text>

        <View className="absolute top-lg right-lg flex-row gap-sm">
          <Pressable
            onPress={(): void => router.push('/progress')}
            className="py-2 px-3 min-h-[48px] justify-center"
          >
            <Text className="text-caption font-semibold text-primary">
              Progress
            </Text>
          </Pressable>
          <Pressable
            onPress={(): void => router.push('/settings')}
            className="py-2 px-3 min-h-[48px] justify-center"
          >
            <Text className="text-caption font-semibold text-primary">
              Settings
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleMockExam}
          className={`rounded-card p-md mb-lg border-2 ${
            isPurchased
              ? 'bg-primary border-primary'
              : 'bg-locked border-locked'
          }`}
        >
          <Text className="text-button text-white text-center mb-sm">
            Mock Exam
          </Text>
          <Text className="text-caption text-white/80 text-center">
            {isPurchased
              ? 'Timed, mixed-topic practice from all paid standards'
              : 'Unlock with full access'}
          </Text>
        </Pressable>

        <Text className="text-heading text-text-primary mb-md">
          Care Certificate
        </Text>

        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            bestScore={bestScores.get(topic.id)}
            isPurchased={isPurchased}
            onPurchaseRequired={handlePurchaseRequired}
          />
        ))}

        {topics.length === 0 && <EmptyState />}
      </View>
    </ScrollView>
  );
}
