import { useEffect, useState, type ReactElement } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuizStore } from '../../src/store/useQuizStore';
import { useMockExamStore } from '../../src/store/useMockExamStore';
import { getTopic } from '../../src/db/queries/questions';
import { trackEvent } from '../../src/lib/analytics';

function getCompletionKey(topicId: string): string {
  return `completion_shown_${topicId}`;
}

export default function CompletionScreen(): ReactElement {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const db = useSQLiteContext();

  const quizScoreCorrect = useQuizStore((s) => s.getScoreCorrect());
  const quizScoreTotal = useQuizStore((s) => s.getScoreTotal());
  const quizReset = useQuizStore((s) => s.reset);

  const mockScoreCorrect = useMockExamStore((s) => s.getScoreCorrect());
  const mockScoreTotal = useMockExamStore((s) => s.getScoreTotal());
  const mockReset = useMockExamStore((s) => s.reset);

  const isMockExam = topicId === 'mock-exam';
  const scoreCorrect = isMockExam ? mockScoreCorrect : quizScoreCorrect;
  const scoreTotal = isMockExam ? mockScoreTotal : quizScoreTotal;
  const [topicTitle, setTopicTitle] = useState<string>(isMockExam ? 'Mock Exam' : '');

  useEffect(() => {
    if (!topicId || isMockExam) return;

    async function fetchTopic(): Promise<void> {
      const topic = await getTopic(db, topicId);
      if (topic) {
        setTopicTitle(topic.title);
      }
    }
    fetchTopic();
  }, [topicId, db, isMockExam]);

  useEffect(() => {
    if (!topicId || scoreTotal === 0) return;
    trackEvent('completion_screen_viewed', {
      topic_id: topicId,
      is_mock_exam: isMockExam,
    });
    AsyncStorage.setItem(getCompletionKey(topicId), 'true').catch(() => {});
  }, [topicId, isMockExam, scoreTotal]);

  const handleShare = async (): Promise<void> => {
    const pct = scoreTotal > 0 ? Math.round((scoreCorrect / scoreTotal) * 100) : 0;
    const message = isMockExam
      ? `I scored ${scoreCorrect}/${scoreTotal} (${pct}%) on the Mock Exam in CarePractice! 🎓`
      : `I scored ${scoreCorrect}/${scoreTotal} (${pct}%) on "${topicTitle}" in CarePractice! 📚`;

    trackEvent('share_triggered', {
      topic_id: topicId,
      is_mock_exam: isMockExam,
      score_pct: pct,
    });

    try {
      await Share.share({
        message: `${message}\n\nUnderstand it. Don't just copy it.\n`,
      });
    } catch {
      // User cancelled share — not an error
    }
  };

  useEffect(() => {
    if (scoreTotal === 0) {
      if (isMockExam) {
        mockReset();
      } else {
        quizReset();
      }
      router.replace('/');
    }
  }, [scoreTotal, isMockExam, mockReset, quizReset]);

  if (scoreTotal === 0) {
    return <View className="flex-1 bg-background" />;
  }

  const handleHome = (): void => {
    if (isMockExam) {
      mockReset();
    } else {
      quizReset();
    }
    router.replace('/');
  };

  const percentage = Math.round((scoreCorrect / scoreTotal) * 100);
  const scoreColorClass = percentage >= 80 ? 'text-correct' : percentage >= 50 ? 'text-primary' : 'text-incorrect';
  const encouragements = percentage >= 80
    ? ['Excellent work!', 'You really know this material.', 'Keep it up — you\'re well prepared.']
    : percentage >= 50
      ? ['Good effort!', 'You\'re building solid knowledge.', 'Review the explanations and try again.']
      : ['Keep going!', 'Every attempt builds your understanding.', 'Read the explanations carefully and retry.'];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center p-lg pt-xl">
        <Text className="text-display text-primary text-center mb-sm">
          {isMockExam ? 'Mock Exam Complete!' : 'Topic Complete!'}
        </Text>

        <Text className="text-body text-text-secondary text-center mb-lg">
          {topicTitle}
        </Text>

        <View className="bg-surface rounded-card p-md items-center mb-lg border border-divider w-full max-w-[320px]">
          <Text className={`text-5xl font-bold ${scoreColorClass} mb-sm`}>
            {scoreCorrect}/{scoreTotal}
          </Text>

          <Text className="text-body text-text-secondary mb-lg">
            {percentage}% correct
          </Text>

          {encouragements.map((line, i) => (
            <Text
              key={i}
              className={`text-body text-center mb-sm ${i === 0 ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}
            >
              {line}
            </Text>
          ))}
        </View>

        <View className="bg-primary-light rounded-card p-md mb-lg border border-divider w-full max-w-[320px]">
          <Text className="text-heading text-primary text-center mb-sm">
            Enjoying the app?
          </Text>
          <Text className="text-body text-text-secondary text-center mb-md">
            Share your progress with a colleague — word of mouth helps us keep the free tier free for everyone.
          </Text>

          <Pressable
            onPress={handleShare}
            className="bg-primary py-3.5 px-xl rounded-button items-center min-h-[52px] justify-center w-full mb-sm"
          >
            <Text className="text-button text-white">Share</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleHome}
          className="py-3.5 px-xl rounded-button items-center min-h-[52px] justify-center w-full max-w-[320px] border border-primary mb-xl"
        >
          <Text className="text-button text-primary">Back to Home</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
