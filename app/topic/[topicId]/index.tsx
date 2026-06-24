import { useEffect, useState, type ReactElement } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import type { QuestionWithOptions } from '../../../src/db/queries/questions';
import { getTopic } from '../../../src/db/queries/questions';
import { useQuizStore } from '../../../src/store/useQuizStore';
import { usePurchaseStore } from '../../../src/store/usePurchaseStore';

type ProgressDotsProps = {
  total: number;
  current: number;
  answers: Record<string, string>;
  questions: QuestionWithOptions[];
};

function ProgressDots({
  total,
  current,
  answers,
  questions,
}: ProgressDotsProps): ReactElement {
  return (
    <View className="flex-row justify-center gap-sm py-md">
      {Array.from({ length: total }).map((_, i) => {
        const question = questions[i];
        const answered = question ? answers[question.id] !== undefined : false;
        const isCurrent = i === current;

        return (
          <View
            key={i}
            className={`w-3 h-3 rounded-full ${
              isCurrent
                ? 'bg-primary'
                : answered
                  ? 'bg-primary-light'
                  : 'bg-divider'
            }`}
          />
        );
      })}
    </View>
  );
}

export default function QuizSessionScreen(): ReactElement {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const db = useSQLiteContext();
  const loadQuestions = useQuizStore((s) => s.loadQuestions);
  const isComplete = useQuizStore((s) => s.isComplete);
  const isLoading = useQuizStore((s) => s.isLoading);
  const error = useQuizStore((s) => s.error);
  const getCurrentQuestion = useQuizStore((s) => s.getCurrentQuestion);
  const getSelectedOptionId = useQuizStore((s) => s.getSelectedOptionId);
  const hasRevealed = useQuizStore((s) => s.hasRevealed);
  const selectAnswer = useQuizStore((s) => s.selectAnswer);
  const revealAnswer = useQuizStore((s) => s.revealAnswer);
  const advanceQuestion = useQuizStore((s) => s.advanceQuestion);
  const questions = useQuizStore((s) => s.questions);
  const currentIndex = useQuizStore((s) => s.currentIndex);
  const answers = useQuizStore((s) => s.answers);
  const isPurchased = usePurchaseStore((s) => s.isPurchased);
  const initialized = usePurchaseStore((s) => s.initialized);
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    if (!topicId || accessChecked) return;

    async function checkAccess(): Promise<void> {
      try {
        const topic = await getTopic(db, topicId);
        if (!topic) {
          router.replace('/');
          return;
        }
        if (topic.is_free !== 1 && !isPurchased) {
          if (!initialized) return; // Wait for purchase init before redirecting
          router.replace('/paywall');
          return;
        }
        setAccessChecked(true);
        loadQuestions(topicId);
      } catch {
        router.replace('/');
      }
    }

    checkAccess();
  }, [topicId, db, isPurchased, initialized, accessChecked, loadQuestions]);

  useEffect(() => {
    if (isComplete) {
      router.replace(`/topic/${topicId}/results`);
    }
  }, [isComplete, topicId]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-lg">
        <Text className="text-body text-incorrect text-center">
          {error}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-md py-3 px-lg rounded-button border-2 border-primary"
        >
          <Text className="text-button text-primary">
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const question = getCurrentQuestion();
  if (!question) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-body text-text-secondary">No question to display.</Text>
      </View>
    );
  }

  const selectedOptionId = getSelectedOptionId();

  return (
    <View className="flex-1 bg-background">
      <ProgressDots
        total={questions.length}
        current={currentIndex}
        answers={answers}
        questions={questions}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-lg pb-xl"
      >
        <Text className="text-caption text-text-secondary mb-sm">
          Question {currentIndex + 1} of {questions.length}
        </Text>

        <Text className="text-heading text-text-primary mb-lg">
          {question.prompt}
        </Text>

        {question.options.map((option) => {
          let borderClass = 'border-divider';
          let bgClass = 'bg-surface';
          let textColorClass = 'text-text-primary';

          if (hasRevealed) {
            if (option.is_correct === 1) {
              borderClass = 'border-correct';
              bgClass = 'bg-[#F0FDF4]';
              textColorClass = 'text-correct';
            } else if (option.id === selectedOptionId && option.is_correct === 0) {
              borderClass = 'border-incorrect';
              bgClass = 'bg-[#FEF2F2]';
              textColorClass = 'text-incorrect';
            }
          } else if (option.id === selectedOptionId) {
            borderClass = 'border-primary';
            bgClass = 'bg-primary-light';
          }

          return (
            <Pressable
              key={option.id}
              onPress={hasRevealed ? undefined : (): void => { selectAnswer(question.id, option.id); }}
              disabled={hasRevealed}
              className={`border-2 ${borderClass} ${bgClass} rounded-card p-md mb-3 min-h-[48px] justify-center`}
            >
              <Text className={`text-body ${textColorClass}`}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}

        {hasRevealed && (
          <View className="bg-[#F5F3FA] rounded-card p-md mt-sm">
            <Text className="text-caption font-semibold text-primary mb-sm">
              Explanation
            </Text>
            <Text className="text-body text-text-primary">
              {question.explanation}
            </Text>
          </View>
        )}
      </ScrollView>

      <View className="px-lg pt-0">
        {!hasRevealed && selectedOptionId && (
          <Pressable
            onPress={() => revealAnswer()}
            className="bg-primary py-3.5 rounded-button items-center min-h-[52px] justify-center"
          >
            <Text className="text-button text-white">
              Check Answer
            </Text>
          </Pressable>
        )}

        {hasRevealed && (
          <Pressable
            onPress={() => advanceQuestion()}
            className="bg-primary py-3.5 rounded-button items-center min-h-[52px] justify-center"
          >
            <Text className="text-button text-white">
              {currentIndex >= questions.length - 1
                ? 'See Results'
                : 'Next Question'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
