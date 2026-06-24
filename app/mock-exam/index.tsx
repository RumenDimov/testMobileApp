import { useEffect, useRef, type ReactElement } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import type { QuestionWithOptions } from '../../src/db/queries/questions';
import { useMockExamStore } from '../../src/store/useMockExamStore';
import { usePurchaseStore } from '../../src/store/usePurchaseStore';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

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

export default function MockExamScreen(): ReactElement {
  const loadQuestions = useMockExamStore((s) => s.loadQuestions);
  const isComplete = useMockExamStore((s) => s.isComplete);
  const isLoading = useMockExamStore((s) => s.isLoading);
  const error = useMockExamStore((s) => s.error);
  const getCurrentQuestion = useMockExamStore((s) => s.getCurrentQuestion);
  const getSelectedOptionId = useMockExamStore((s) => s.getSelectedOptionId);
  const hasRevealed = useMockExamStore((s) => s.hasRevealed);
  const selectAnswer = useMockExamStore((s) => s.selectAnswer);
  const revealAnswer = useMockExamStore((s) => s.revealAnswer);
  const advanceQuestion = useMockExamStore((s) => s.advanceQuestion);
  const questions = useMockExamStore((s) => s.questions);
  const currentIndex = useMockExamStore((s) => s.currentIndex);
  const answers = useMockExamStore((s) => s.answers);
  const timeRemaining = useMockExamStore((s) => s.timeRemaining);
  const tick = useMockExamStore((s) => s.tick);
  const isPurchased = usePurchaseStore((s) => s.isPurchased);
  const initialized = usePurchaseStore((s) => s.initialized);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!initialized) return;
    if (!isPurchased) {
      router.replace('/paywall');
      return;
    }
    loadQuestions();
  }, [isPurchased, loadQuestions, initialized]);

  useEffect(() => {
    if (isComplete) {
      router.replace('/mock-exam/results');
    }
  }, [isComplete]);

  useEffect(() => {
    if (!isLoading && questions.length > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        tick();
      }, 1000);
    }

    return (): void => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLoading, questions.length, tick]);

  if (!initialized) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text className="text-body text-text-secondary mt-md">
          Checking purchase status...
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text className="text-body text-text-secondary mt-md">
          Loading mock exam...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-lg bg-background">
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
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-body text-text-secondary">No question to display.</Text>
      </View>
    );
  }

  const selectedOptionId = getSelectedOptionId();
  const timeColor = timeRemaining <= 60 ? 'text-incorrect' : 'text-text-primary';

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row justify-between items-center px-lg pt-lg pb-sm">
        <View className="flex-row items-center">
          <Text className="text-caption font-semibold text-primary mr-sm">
            Mock Exam
          </Text>
        </View>
        <Text className={`text-button ${timeColor}`}>
          {formatTime(timeRemaining)}
        </Text>
      </View>

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

      <View className="px-lg pt-0 pb-lg">
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
