import { Suspense, useEffect, type ReactElement } from 'react';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { ActivityIndicator, Text, View } from 'react-native';
import { DatabaseInitializer } from '../src/lib/DatabaseInitializer';
import { usePurchaseStore } from '../src/store/usePurchaseStore';
import '../global.css';

function LoadingFallback(): ReactElement {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#7C3AED" />
      <Text className="mt-3 text-body text-text-secondary">
        Loading...
      </Text>
    </View>
  );
}

function ErrorFallback({ message }: { message: string }): ReactElement {
  return (
    <View className="flex-1 justify-center items-center p-lg">
      <Text className="text-body text-incorrect text-center">{message}</Text>
    </View>
  );
}

function AppNavigator(): ReactElement {
  const initialize = usePurchaseStore((s) => s.initialize);
  const cleanup = usePurchaseStore((s) => s.cleanup);

  useEffect(() => {
    initialize();
    return (): void => {
      cleanup();
    };
  }, [initialize, cleanup]);

  return (
    <DatabaseInitializer
      fallback={<LoadingFallback />}
      errorFallback={(msg) => <ErrorFallback message={msg} />}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="topic/[topicId]/index" />
        <Stack.Screen name="topic/[topicId]/results" />
        <Stack.Screen name="mock-exam/index" />
        <Stack.Screen name="mock-exam/results" />
        <Stack.Screen name="paywall/index" />
        <Stack.Screen name="paywall/confirmation" />
        <Stack.Screen name="settings" />
      </Stack>
    </DatabaseInitializer>
  );
}

export default function RootLayout(): ReactElement {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SQLiteProvider databaseName="carepractice.db">
        <AppNavigator />
      </SQLiteProvider>
    </Suspense>
  );
}
