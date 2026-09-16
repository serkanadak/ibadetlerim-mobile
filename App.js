import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TrackerProvider } from './src/state/TrackerContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <TrackerProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </TrackerProvider>
    </SafeAreaProvider>
  );
}
