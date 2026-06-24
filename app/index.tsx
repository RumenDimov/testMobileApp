import { useEffect, useState, type ReactElement } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import type { TopicSummary } from '../src/db/queries/questions';
import { getAllTopics } from '../src/db/queries/questions';

export default function HomeScreen(): ReactElement {
  const db = useSQLiteContext();
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const result = await getAllTopics(db);
        setTopics(result);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [db]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#FDFBFE' }}>
      <Text style={{ fontSize: 22, fontWeight: '600', color: '#1E1B1E', marginBottom: 24 }}>
        Care Certificate Practice
      </Text>

      {topics.map((topic) => (
        <View
          key={topic.id}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#E8E5EC',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1E1B1E', flex: 1 }}>
              {topic.title}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: '#7C3AED',
                backgroundColor: '#EDE9FE',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              Free
            </Text>
          </View>

          <Text style={{ fontSize: 14, color: '#6B6570', marginTop: 4, marginBottom: 12 }}>
            {topic.summary}
          </Text>

          <Text style={{ fontSize: 14, color: '#6B6570', marginBottom: 12 }}>
            {topic.question_count} questions
          </Text>

          <Pressable
            onPress={() => router.push(`/topic/${topic.id}`)}
            style={{
              backgroundColor: '#7C3AED',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8,
              alignItems: 'center',
              minHeight: 48,
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
              Start Quiz
            </Text>
          </Pressable>
        </View>
      ))}

      {topics.length === 0 && (
        <Text style={{ fontSize: 16, color: '#6B6570', textAlign: 'center', marginTop: 48 }}>
          No topics available yet.
        </Text>
      )}
    </View>
  );
}
