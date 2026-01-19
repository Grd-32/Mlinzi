import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/colors';

// Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import SOSFlowScreen from '../screens/SOSFlowScreen';
import EmergencyContactsScreen from '../screens/EmergencyContactsScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OperatorChatScreen from '../screens/OperatorChatScreen';
import AlertsFeedScreen from '../screens/AlertsFeedScreen';
import LocationSharingScreen from '../screens/LocationSharingScreen';
import EmergencyNumbersScreen from '../screens/EmergencyNumbersScreen';
import SafetyScoreScreen from '../screens/SafetyScoreScreen';
import IncidentHistoryScreen from '../screens/IncidentHistoryScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.white },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

const AuthStackWrapper = React.memo(() => <AuthStack />);

const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: COLORS.princetonOrange,
        tabBarInactiveTintColor: COLORS.mediumGray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.skyBlueLight,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: COLORS.white,
          borderBottomColor: COLORS.skyBlueLight,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: COLORS.deepSpaceBlue,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: '🛡️ Mlinzi',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <View style={{ fontSize: size * 1.5 }}>
              <Text style={{ fontSize: size * 1.5, color }}>🏠</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="EmergencyContacts"
        component={EmergencyContactsScreen}
        options={{
          title: 'Emergency Contacts',
          tabBarLabel: 'Contacts',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size * 1.5, color }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          title: 'Community',
          tabBarLabel: 'Community',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size * 1.5, color }}>🏘️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size * 1.5, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainApp" component={AppTabs} />
      <Stack.Screen
        name="SOSFlow"
        component={SOSFlowScreen}
        options={{ animationEnabled: true }}
      />
      <Stack.Screen
        name="OperatorChat"
        component={OperatorChatScreen}
        options={{
          headerShown: true,
          title: 'Operator Chat',
          headerStyle: {
            backgroundColor: COLORS.blueGreen,
          },
          headerTitleStyle: {
            color: COLORS.white,
            fontSize: 16,
          },
          headerTintColor: COLORS.white,
        }}
      />
      <Stack.Screen
        name="AlertsFeed"
        component={AlertsFeedScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="LocationSharing"
        component={LocationSharingScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="EmergencyNumbers"
        component={EmergencyNumbersScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="SafetyScore"
        component={SafetyScoreScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="IncidentHistory"
        component={IncidentHistoryScreen}
        options={{
          headerShown: false,
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};

export const RootNavigator = () => {
  const { state } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = React.useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = React.useState(true);

  React.useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      console.log('Onboarding seen:', seen);
      setHasSeenOnboarding(!!seen);
    } catch (error) {
      console.log('Error checking onboarding:', error);
      setHasSeenOnboarding(false);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setHasSeenOnboarding(true);
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
  };

  if (state.isLoading || checkingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.princetonOrange} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {state.userToken == null ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {hasSeenOnboarding === false ? (
            <Stack.Screen 
              name="Onboarding" 
              component={OnboardingScreen}
              options={{ animationEnabled: false }}
            />
          ) : null}
          <Stack.Screen name="Auth" component={AuthStackWrapper} />
        </Stack.Navigator>
      ) : (
        <AppStack />
      )}
    </NavigationContainer>
  );
};
