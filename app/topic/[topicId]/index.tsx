import { useEffect, type ReactElement } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useQuizStore } from '../../../src/store/useQuizStore';

function ProgressDots({
  total,
  current,
  answers,
}: {
  total: number;
  current: number;
  answers: Record<string, string>;
}): ReactElement {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const question = useQuizStore.getState().questions[i];
        const answered = question ? answers[question.id] !== undefined : false;
        const isCurrent = i === current;

        return (
          <View
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: isCurrent
                ? '#7C3AED'
                : answered
                  ? '#C4B5FD'
                  : '#E8E5EC',
            }}
          />
        );
      })}
    </View>
  );
}

export default function QuizSessionScreen(): ReactElement {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const store = useQuizStore();

  useEffect(() => {
    if (topicId) {
      store.loadQuestions(topicId);
    }
  }, [topicId, store]);

  useEffect(() => {
    if (store.isComplete) {
      router.replace(`/topic/${topicId}/results`);
    }
  }, [store.isComplete, topicId]);

  if (store.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (store.error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 16, color: '#DC4C4C', textAlign: 'center' }}>
          {store.error}
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{
            marginTop: 16,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: '#7C3AED',
          }}
        >
          <Text style={{ color: '#7C3AED', fontSize: 16, fontWeight: '600' }}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const question = store.getCurrentQuestion();
  if (!question) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#6B6570' }}>No question to display.</Text>
      </View>
    );
  }

  const selectedOptionId = store.getSelectedOptionId();

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFBFE' }}>
      <ProgressDots
        total={store.questions.length}
        current={store.currentIndex}
        answers={store.answers}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
      >
        <Text style={{ fontSize: 14, color: '#6B6570', marginBottom: 8 }}>
          Question {store.currentIndex + 1} of {store.questions.length}
        </Text>

        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#1E1B1E',
            marginBottom: 24,
            lineHeight: 26,
          }}
        >
          {question.prompt}
        </Text>

        {question.options.map((option) => {
          let borderColor = '#E8E5EC';
          let backgroundColor = '#FFFFFF';
          let textColor = '#1E1B1E';

          if (store.hasRevealed) {
            if (option.is_correct === 1) {
              borderColor = '#16A34A';
              backgroundColor = '#F0FDF4';
              textColor = '#16A34A';
            } else if (option.id === selectedOptionId && option.is_correct === 0) {
              borderColor = '#DC4C4C';
              backgroundColor = '#FEF2F2';
              textColor = '#DC4C4C';
            }
          } else if (option.id === selectedOptionId) {
            borderColor = '#7C3AED';
            backgroundColor = '#EDE9FE';
          }

          return (
            <Pressable
              key={option.id}
              onPress={() => {
                if (!store.hasRevealed) {
                  store.selectAnswer(question.id, option.id);
                }
              }}
              disabled={store.hasRevealed}
              style={{
                borderWidth: 2,
                borderColor,
                backgroundColor,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                minHeight: 48,
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 16, color: textColor, lineHeight: 24 }}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}

        {store.hasRevealed && (
          <View
            style={{
              backgroundColor: '#F5F3FA',
              borderRadius: 12,
              padding: 16,
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#7C3AED',
                marginBottom: 8,
              }}
            >
              Explanation
            </Text>
            <Text style={{ fontSize: 16, color: '#1E1B1E', lineHeight: 24 }}>
              {question.explanation}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={{ padding: 24, paddingTop: 0 }}>
        {!store.hasRevealed && selectedOptionId && (
          <Pressable
            onPress={() => store.revealAnswer()}
            style={{
              backgroundColor: '#7C3AED',
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: 'center',
              minHeight: 52,
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
              Check Answer
            </Text>
          </Pressable>
        )}

        {store.hasRevealed && (
          <Pressable
            onPress={() => store.nextQuestion()}
            style={{
              backgroundColor: '#7C3AED',
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: 'center',
              minHeight: 52,
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
              {store.currentIndex >= store.questions.length - 1
                ? 'See Results'
                : 'Next Question'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
