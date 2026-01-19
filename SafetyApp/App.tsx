import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import 'react-native-gesture-handler';
import 'react-native-reanimated';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    const clearCacheAndHideSplash = async () => {
      try {
        // Clear onboarding flag so app always starts on onboarding
        await AsyncStorage.removeItem('hasSeenOnboarding');
        
        await SplashScreen.hideAsync();
      } catch (e) {
        console.error('Error in app startup:', e);
      }
    };

    // Give a small delay to ensure everything is ready
    const timeout = setTimeout(clearCacheAndHideSplash, 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
