import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { locationPermissionsService } from '../services/locationPermissionsService';
import { notificationService } from '../services/notificationService';
import { COLORS } from '../utils/colors';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { state } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Request location permission
        await locationPermissionsService.requestLocationPermission();
        await locationPermissionsService.requestBackgroundLocationPermission();

        // Register for push notifications
        await notificationService.registerForPushNotifications();

        // Set up notification listeners
        notificationService.setupNotificationListeners();

        setLoading(false);
      } catch (error) {
        console.error('Initialization error:', error);
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleSOSPress = () => {
    navigation.navigate('SOSFlow');
  };

  const sosIncidentTypes = [
    { id: 'normal', label: 'Normal', icon: '🚨', bgColor: COLORS.princetonOrange },
    { id: 'sensitive', label: 'Sensitive', icon: '🔒', bgColor: COLORS.amberFlame },
    { id: 'test', label: 'Test', icon: '✓', bgColor: COLORS.blueGreen },
    { id: 'medical', label: 'Medical', icon: '🏥', bgColor: COLORS.skyBlueLight },
    { id: 'crime', label: 'Crime', icon: '👮', bgColor: COLORS.deepSpaceBlue },
    { id: 'fire', label: 'Fire', icon: '🔥', bgColor: COLORS.princetonOrange },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.princetonOrange} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* Compact Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <Text style={styles.headerGreeting}>Hi, {state.user?.firstName || 'there'}</Text>
            <Text style={styles.headerSubtext}>You're in a safe zone</Text>
          </View>
          <TouchableOpacity 
            style={styles.headerAvatar}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Text style={styles.avatarText}>
              {state.user?.firstName?.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Prominent SOS Button - Only Critical Action */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSOSPress}
          style={styles.sosContainer}
        >
          <LinearGradient
            colors={['#DC2626', '#B91C1C', '#991B1B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sosButtonModern}
          >
            <Text style={styles.sosEmoji}>🆘</Text>
            <Text style={styles.sosMainText}>EMERGENCY</Text>
            <Text style={styles.sosTapText}>Press and hold to send</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Location Sharing Status - Informative Widget */}
        <View style={styles.statusWidget}>
          <View style={styles.statusLeft}>
            <View style={styles.statusIndicator}>
              <Text style={styles.statusDot}>🔵</Text>
            </View>
            <View>
              <Text style={styles.statusTitle}>Location Sharing</Text>
              <Text style={styles.statusDetail}>Sharing with 3 contacts • Last updated 2 min ago</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.statusButton}
            onPress={() => navigation.navigate('LocationSharing')}
          >
            <Text style={styles.statusButtonText}>Manage</Text>
          </TouchableOpacity>
        </View>

        {/* Live Alerts Feed - Real Information */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Safety Alerts Near You</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AlertsFeed')}>
              <Text style={styles.sectionLink}>View All →</Text>
            </TouchableOpacity>
          </View>
          
          {/* Alert Card 1 */}
          <TouchableOpacity 
            style={styles.alertCard}
            onPress={() => navigation.navigate('AlertsFeed')}
            activeOpacity={0.7}
          >
            <View style={styles.alertIconContainer}>
              <Text style={styles.alertIcon}>⚠️</Text>
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Traffic Incident</Text>
              <Text style={styles.alertLocation}>Nairobi Central • 1.2 km away</Text>
              <Text style={styles.alertTime}>5 minutes ago</Text>
            </View>
            <Text style={styles.alertIndicator}>→</Text>
          </TouchableOpacity>

          {/* Alert Card 2 */}
          <TouchableOpacity 
            style={styles.alertCard}
            onPress={() => navigation.navigate('AlertsFeed')}
            activeOpacity={0.7}
          >
            <View style={styles.alertIconContainer}>
              <Text style={styles.alertIcon}>🌧️</Text>
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Heavy Rain Alert</Text>
              <Text style={styles.alertLocation}>Your Area • High visibility risk</Text>
              <Text style={styles.alertTime}>15 minutes ago</Text>
            </View>
            <Text style={styles.alertIndicator}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Action Strip - Minimal */}
        <View style={styles.sectionContainer}>
          <View style={styles.quickActionStrip}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('SafetyScore')}
            >
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionLabel}>Score</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('LocationSharing')}
            >
              <Text style={styles.quickActionIcon}>📍</Text>
              <Text style={styles.quickActionLabel}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('EmergencyNumbers')}
            >
              <Text style={styles.quickActionIcon}>☎️</Text>
              <Text style={styles.quickActionLabel}>Numbers</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('AlertsFeed')}
            >
              <Text style={styles.quickActionIcon}>🔔</Text>
              <Text style={styles.quickActionLabel}>Alerts</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Safety Recommendations - Contextual */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Safety Tip</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Keep Your Contacts Updated</Text>
              <Text style={styles.tipDescription}>
                It's been 2 weeks since you updated your emergency contacts. Update them to ensure quick response in emergencies.
              </Text>
              <TouchableOpacity style={styles.tipAction}>
                <Text style={styles.tipActionText}>Update Now →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Incident Types - Hidden in Collapsed Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Report an Issue</Text>
          <View style={styles.incidentGridModern}>
            {sosIncidentTypes.slice(0, 4).map((type) => (
              <TouchableOpacity
                key={type.id}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('SOSFlow', { incidentType: type.id })
                }
                style={styles.incidentCardSmall}
              >
                <LinearGradient
                  colors={[type.bgColor, type.bgColor + 'cc']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.incidentGradientSmall}
                >
                  <Text style={styles.incidentCardIconSmall}>{type.icon}</Text>
                  <Text style={styles.incidentCardLabelSmall}>{type.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // === HEADER STYLES ===
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e8e8e8',
  },
  headerContent: {
    flex: 1,
  },
  headerGreeting: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
    marginBottom: 2,
  },
  headerSubtext: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.blueGreen,
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.skyBlueLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.blueGreen,
  },
  
  // === SOS BUTTON ===
  sosContainer: {
    marginHorizontal: 12,
    marginTop: 16,
    marginBottom: 18,
    borderRadius: 14,
    overflow: 'hidden',
  },
  sosButtonModern: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.princetonOrange,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 18,
  },
  sosEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  sosMainText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
    marginBottom: 4,
  },
  sosTapText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.white,
    opacity: 0.95,
  },
  
  // === STATUS WIDGET ===
  statusWidget: {
    marginHorizontal: 12,
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.skyBlueLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statusLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    marginRight: 10,
  },
  statusDot: {
    fontSize: 18,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
    marginBottom: 2,
  },
  statusDetail: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.blueGreen,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.skyBlueLight,
    borderRadius: 8,
  },
  statusButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.blueGreen,
  },
  
  // === SECTION CONTAINER ===
  sectionContainer: {
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.blueGreen,
  },
  
  // === ALERT CARDS ===
  alertCard: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.amberFlame,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  alertIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.amberFlame + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertIcon: {
    fontSize: 22,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
    marginBottom: 2,
  },
  alertLocation: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.deepSpaceBlue,
    opacity: 0.7,
    marginBottom: 1,
  },
  alertTime: {
    fontSize: 10,
    fontWeight: '400',
    color: COLORS.deepSpaceBlue,
    opacity: 0.5,
  },
  alertIndicator: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.blueGreen,
  },
  
  // === QUICK ACTION STRIP ===
  quickActionStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#efefef',
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
  },
  
  // === TIP CARD ===
  tipCard: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.amberFlame + '30',
  },
  tipIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.deepSpaceBlue,
    opacity: 0.7,
    lineHeight: 16,
    marginBottom: 8,
  },
  tipAction: {
    alignSelf: 'flex-start',
  },
  tipActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.princetonOrange,
  },
  
  // === INCIDENT GRID - SMALLER ===
  incidentGridModern: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  incidentCardSmall: {
    width: '23.5%',
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    aspectRatio: 1,
  },
  incidentGradientSmall: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  incidentCardIconSmall: {
    fontSize: 28,
    marginBottom: 4,
  },
  incidentCardLabelSmall: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 11,
  },
});

export default HomeScreen;
