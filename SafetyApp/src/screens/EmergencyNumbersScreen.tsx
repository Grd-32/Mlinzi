import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import { emergencyContactService } from '../services/emergencyContactService';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const EmergencyNumbersScreen = ({ navigation }) => {
  const { state } = useAuth();
  const [savedNumbers, setSavedNumbers] = useState([
    { id: '1', name: 'Police', number: '999', icon: '🚔', color: COLORS.deepSpaceBlue },
    { id: '2', name: 'Ambulance', number: '911', icon: '🚑', color: '#ff4444' },
    { id: '3', name: 'Fire', number: '911', icon: '🚒', color: COLORS.princetonOrange },
    { id: '4', name: 'Electricity', number: '0709500500', icon: '⚡', color: COLORS.amberFlame },
  ]);

  const [personalNumbers, setPersonalNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load emergency contacts on screen focus
  useFocusEffect(
    useCallback(() => {
      if (state.user?.id) {
        loadPersonalContacts();
      }
    }, [state.user?.id])
  );

  const loadPersonalContacts = async () => {
    try {
      setLoading(true);
      if (!state.user?.id) return;
      
      const contacts = await emergencyContactService.getEmergencyContacts(state.user.id);
      
      // Transform emergency contacts to number format with icons and colors
      const personalContactsFormatted = contacts.map((contact, index) => ({
        id: contact.id,
        name: contact.name,
        number: contact.phone,
        icon: getAvatarEmoji(index),
        color: getColorForIndex(index),
      }));
      
      setPersonalNumbers(personalContactsFormatted);
    } catch (error) {
      console.error('Error loading personal contacts:', error);
      setPersonalNumbers([
        { id: '5', name: 'Mom', number: '+254712345678', icon: '👩', color: COLORS.skyBlueLight },
        { id: '6', name: 'Dad', number: '+254798765432', icon: '👨', color: COLORS.blueGreen },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarEmoji = (index: number): string => {
    const emojis = ['👩', '👨', '👩‍🦰', '👩‍🎓', '👨‍💼', '👩‍⚕️'];
    return emojis[index % emojis.length];
  };

  const getColorForIndex = (index: number): string => {
    const colors = [COLORS.skyBlueLight, COLORS.blueGreen, COLORS.amberFlame, COLORS.princetonOrange, '#FF6B9D', '#4ECDC4'];
    return colors[index % colors.length];
  };

  const handleCall = (number: string, name: string) => {
    Alert.alert(
      'Call ' + name + '?',
      'Would you like to call ' + number + '?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${number}`);
          },
        },
      ]
    );
  };

  const NumberCard = ({ item, isEmergency }: any) => (
    <TouchableOpacity
      style={styles.numberCard}
      onPress={() => handleCall(item.number, item.name)}
      activeOpacity={0.7}
    >
      <View style={[styles.numberIconBg, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.numberIcon}>{item.icon}</Text>
      </View>

      <View style={styles.numberInfo}>
        <Text style={styles.numberName}>{item.name}</Text>
        <Text style={styles.numberValue}>{item.number}</Text>
      </View>

      <View style={styles.numberAction}>
        <LinearGradient
          colors={[item.color, item.color + 'dd']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.callButton}
        >
          <Text style={styles.callIcon}>📞</Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.blueGreen} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Emergency Numbers</Text>
          <Text style={styles.headerSubtext}>Quick access to important contacts</Text>
        </View>

        {/* Emergency Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🚨 Emergency Services</Text>
            <Text style={styles.sectionNote}>Available 24/7</Text>
          </View>

          {savedNumbers.map((number) => (
            <NumberCard key={number.id} item={number} isEmergency={true} />
          ))}
        </View>

        {/* Personal Emergency Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👥 Personal Contacts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EmergencyContacts')}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>

          {personalNumbers.length > 0 ? (
            personalNumbers.map((number) => (
              <NumberCard key={number.id} item={number} isEmergency={false} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>No personal contacts added yet</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('EmergencyContacts')}
              >
                <Text style={styles.addButtonText}>Add Contact</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Info */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <LinearGradient
              colors={['#fff3e0', '#ffe0b2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.infoGradient}
            >
              <Text style={styles.infoIcon}>💡</Text>
              <View>
                <Text style={styles.infoTitle}>Pro Tip</Text>
                <Text style={styles.infoText}>
                  Save your important contacts as emergency contacts so they receive alerts when you trigger SOS.
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Useful Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Other Useful Numbers</Text>

          <TouchableOpacity
            style={styles.utilityCard}
            onPress={() => handleCall('+254703080999', 'Nairobi Red Cross')}
          >
            <View style={[styles.utilityIcon, { backgroundColor: '#f3e5f5' }]}>
              <Text style={styles.utilityIconText}>🏥</Text>
            </View>
            <View style={styles.utilityInfo}>
              <Text style={styles.utilityName}>Nairobi Red Cross</Text>
              <Text style={styles.utilityNumber}>+254 703 080 999</Text>
            </View>
            <Text style={styles.utilityArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.utilityCard}
            onPress={() => handleCall('+254708333333', 'Nairobi County Police')}
          >
            <View style={[styles.utilityIcon, { backgroundColor: '#e3f2fd' }]}>
              <Text style={styles.utilityIconText}>👮</Text>
            </View>
            <View style={styles.utilityInfo}>
              <Text style={styles.utilityName}>Nairobi County Police</Text>
              <Text style={styles.utilityNumber}>+254 708 333 333</Text>
            </View>
            <Text style={styles.utilityArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.utilityCard}
            onPress={() => handleCall('+254787800000', 'Emergency Referral Centre')}
          >
            <View style={[styles.utilityIcon, { backgroundColor: '#ffebee' }]}>
              <Text style={styles.utilityIconText}>🏨</Text>
            </View>
            <View style={styles.utilityInfo}>
              <Text style={styles.utilityName}>Emergency Referral Centre</Text>
              <Text style={styles.utilityNumber}>+254 787 800 000</Text>
            </View>
            <Text style={styles.utilityArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom SOS Button */}
      <TouchableOpacity
        style={styles.sosButton}
        onPress={() => {
          Alert.alert(
            'Trigger SOS?',
            'This will alert all your emergency contacts immediately.',
            [
              { text: 'Cancel', onPress: () => {}, style: 'cancel' },
              { text: 'Yes, Emergency!', onPress: () => {}, style: 'destructive' },
            ]
          );
        }}
      >
        <LinearGradient
          colors={[COLORS.princetonOrange, COLORS.amberFlame]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sosGradient}
        >
          <Text style={styles.sosText}>🆘 EMERGENCY</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
    marginBottom: 4,
  },
  headerSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.deepSpaceBlue,
    opacity: 0.6,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
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
  sectionNote: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.amberFlame,
  },
  editLink: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.blueGreen,
  },
  numberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#efefef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  numberIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberIcon: {
    fontSize: 22,
  },
  numberInfo: {
    flex: 1,
  },
  numberName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
    marginBottom: 2,
  },
  numberValue: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.deepSpaceBlue,
    opacity: 0.6,
  },
  numberAction: {
    marginLeft: 10,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  callIcon: {
    fontSize: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.deepSpaceBlue,
    opacity: 0.6,
    marginBottom: 14,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.blueGreen,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  infoCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoGradient: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 10,
    marginTop: 2,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.deepSpaceBlue,
    opacity: 0.7,
    lineHeight: 16,
  },
  utilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#efefef',
  },
  utilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  utilityIconText: {
    fontSize: 20,
  },
  utilityInfo: {
    flex: 1,
  },
  utilityName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
    marginBottom: 2,
  },
  utilityNumber: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.deepSpaceBlue,
    opacity: 0.6,
  },
  utilityArrow: {
    fontSize: 16,
    color: COLORS.blueGreen,
  },
  sosButton: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.princetonOrange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  sosGradient: {
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});

export default EmergencyNumbersScreen;
