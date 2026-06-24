import { type ReactElement } from 'react';
import './global.css';

import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export function App(): ReactElement {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-body text-text-primary">
        Open up App.tsx to start working on your app!
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
