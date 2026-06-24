import { type ReactElement } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useQuizStore } from '../../../src/store/useQuizStore';

export default function TopicResultsScreen(): ReactElement {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const store = useQuizStore();
  const scoreCorrect = store.getScoreCorrect();
  const scoreTotal = store.getScoreTotal();

  if (scoreTotal === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#FDFBFE' }}>
        <Text style={{ fontSize: 16, color: '#6B6570', marginBottom: 16 }}>
          No quiz session in progress.
        </Text>
        <Pressable
          onPress={() => router.replace('/')}
          style={{
            paddingVertical: 14,
            paddingHorizontal: 32,
            borderRadius: 8,
            backgroundColor: '#7C3AED',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
            Back to Home
          </Text>
        </Pressable>
      </View>
    );
  }

  const percentage = scoreTotal > 0 ? Math.round((scoreCorrect / scoreTotal) * 100) : 0;

  const handleRetry = (): void => {
    store.reset();
    router.replace(`/topic/${topicId}`);
  };

  const handleHome = (): void => {
    store.reset();
    router.replace('/');
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FDFBFE',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: '600', color: '#1E1B1E', marginBottom: 16 }}>
        Topic Complete
      </Text>

      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 32,
          alignItems: 'center',
          marginBottom: 32,
          borderWidth: 1,
          borderColor: '#E8E5EC',
          width: '100%',
          maxWidth: 320,
        }}
      >
        <Text
          style={{
            fontSize: 48,
            fontWeight: '700',
            color: percentage >= 70 ? '#16A34A' : '#DC4C4C',
            marginBottom: 8,
          }}
        >
          {scoreCorrect}/{scoreTotal}
        </Text>

        <Text style={{ fontSize: 16, color: '#6B6570', marginBottom: 16 }}>
          {percentage}% correct
        </Text>

        {percentage >= 80 && (
          <Text style={{ fontSize: 16, color: '#16A34A', fontWeight: '600', textAlign: 'center' }}>
            Great job! You really know this material.
          </Text>
        )}
        {percentage >= 50 && percentage < 80 && (
          <Text style={{ fontSize: 16, color: '#7C3AED', fontWeight: '600', textAlign: 'center' }}>
            Good effort. Review the explanations and try again.
          </Text>
        )}
        {percentage < 50 && (
          <Text style={{ fontSize: 16, color: '#DC4C4C', fontWeight: '600', textAlign: 'center' }}>
            Keep studying. Read the explanations carefully and retry.
          </Text>
        )}
      </View>

      <Pressable
        onPress={handleRetry}
        style={{
          backgroundColor: '#7C3AED',
          paddingVertical: 14,
          paddingHorizontal: 32,
          borderRadius: 8,
          alignItems: 'center',
          minHeight: 52,
          justifyContent: 'center',
          width: '100%',
          maxWidth: 320,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
          Retry Quiz
        </Text>
      </Pressable>

      <Pressable
        onPress={handleHome}
        style={{
          paddingVertical: 14,
          paddingHorizontal: 32,
          borderRadius: 8,
          alignItems: 'center',
          minHeight: 52,
          justifyContent: 'center',
          width: '100%',
          maxWidth: 320,
          borderWidth: 2,
          borderColor: '#7C3AED',
        }}
      >
        <Text style={{ color: '#7C3AED', fontSize: 16, fontWeight: '600' }}>
          Back to Home
        </Text>
      </Pressable>
    </View>
  );
}
