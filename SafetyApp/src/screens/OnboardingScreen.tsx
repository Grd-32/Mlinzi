import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/colors';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
  colors: [string, string, string];
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Stay Safe, Stay Connected',
    description:
      'Get instant access to emergency services and trusted contacts at the touch of a button',
    icon: '🚨',
    imageUrl: 'https://images.pexels.com/photos/6519865/pexels-photo-6519865.jpeg?w=500&h=500&fit=crop',
    colors: ['#FF6B6B', '#EE5A6F', '#C92A2A'],
  },
  {
    id: '2',
    title: 'Share Your Location',
    description:
      'Let trusted contacts know your whereabouts during emergencies with real-time location sharing',
    icon: '📍',
    imageUrl: 'https://images.pexels.com/photos/6169870/pexels-photo-6169870.jpeg?w=500&h=500&fit=crop',
    colors: ['#4C9AFF', '#1971C2', '#0C63E4'],
  },
  {
    id: '3',
    title: 'Community Safety Network',
    description:
      'Connect with your community to share safety alerts and protect each other',
    icon: '👥',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=500&fit=crop',
    colors: ['#22B14C', '#0B7F1F', '#06BA45'],
  },
  {
    id: '4',
    title: 'Emergency Information',
    description:
      'Store your medical information and emergency contacts for quick access',
    icon: '⚕️',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=500&h=500&fit=crop',
    colors: ['#FFB81C', '#FF9500', '#FFA500'],
  },
];

interface OnboardingScreenProps {
  navigation: any;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.replace('Auth');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
      navigation.replace('Auth');
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.replace('Auth');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
      navigation.replace('Auth');
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const renderSlide = useCallback(({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      {item.imageUrl ? (
        <>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.fullScreenImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.overlay}
          />
        </>
      ) : (
        <LinearGradient
          colors={item.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        >
          <Text style={styles.slideIcon}>{item.icon}</Text>
        </LinearGradient>
      )}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  ), []);

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => (
        <View
          key={`dot-${index}`}
          style={[
            styles.dot,
            {
              backgroundColor:
                index === currentIndex ? COLORS.princetonOrange : COLORS.white,
              width: index === currentIndex ? 30 : 8,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.deepSpaceBlue} />

      <TouchableOpacity 
        style={styles.skipButton} 
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {renderDots()}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.nextButton]}
          onPress={
            currentIndex === slides.length - 1
              ? handleGetStarted
              : () => {
                  flatListRef.current?.scrollToIndex({
                    index: currentIndex + 1,
                    animated: true,
                  });
                }
          }
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepSpaceBlue,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  slide: {
    width: width,
    height: height,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  fullScreenImage: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideIcon: {
    fontSize: 120,
    marginBottom: 60,
  },
  slideImage: {
    width: '100%',
    height: '60%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  contentContainer: {
    paddingHorizontal: 30,
    paddingBottom: 220,
    zIndex: 2,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 130,
    width: width,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 5,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    backgroundColor: COLORS.princetonOrange,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default OnboardingScreen;
