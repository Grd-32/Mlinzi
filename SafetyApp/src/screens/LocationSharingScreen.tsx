import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import { emergencyContactService } from '../services/emergencyContactService';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const LocationSharingScreen = ({ navigation }) => {
  const { state } = useAuth();
  const [sharingActive, setSharingActive] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [checkInVisible, setCheckInVisible] = useState(false);
  const [location, setLocation] = useState('Home');
  const [loading, setLoading] = useState(true);

  // Load emergency contacts on screen focus
  useFocusEffect(
    useCallback(() => {
      if (state.user?.id) {
        loadContacts();
      }
    }, [state.user?.id])
  );

  const loadContacts = async () => {
    try {
      setLoading(true);
      if (!state.user?.id) return;
      
      const contacts = await emergencyContactService.getEmergencyContacts(state.user.id);
      
      // Transform emergency contacts to sharing format with share status
      const contactsWithShare = contacts.map((contact, index) => ({
        id: contact.id,
        name: contact.name,
        avatar: getAvatarEmoji(index),
        shared: index === 0 || index === 1, // First two are shared by default
      }));
      
      setSelectedContacts(contactsWithShare.length > 0 ? contactsWithShare : getDefaultContacts());
    } catch (error) {
      console.error('Error loading contacts:', error);
      setSelectedContacts(getDefaultContacts());
    } finally {
      setLoading(false);
    }
  };

  const getAvatarEmoji = (index: number): string => {
    const emojis = ['👩', '👨', '👩‍🦰', '👩‍🎓', '👨‍💼', '👩‍⚕️'];
    return emojis[index % emojis.length];
  };

  const getDefaultContacts = () => [
    { id: '1', name: 'Mom', avatar: '👩', shared: true },
    { id: '2', name: 'Dad', avatar: '👨', shared: true },
    { id: '3', name: 'Sister', avatar: '👩‍🦰', shared: false },
    { id: '4', name: 'Best Friend', avatar: '👩‍🎓', shared: false },
  ];

  const toggleContactShare = (id: string) => {
    setSelectedContacts(
      selectedContacts.map((contact) =>
        contact.id === id ? { ...contact, shared: !contact.shared } : contact
      )
    );
  };

  const handleCheckIn = () => {
    setCheckInVisible(false);
    // Update location
  };

  const sharedCount = selectedContacts.filter((c) => c.shared).length;

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
          <Text style={styles.headerTitle}>Location Sharing</Text>
          <Text style={styles.headerSubtext}>Control who can see your location</Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <LinearGradient
            colors={sharingActive ? [COLORS.blueGreen, COLORS.skyBlueLight] : ['#999', '#666']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusGradient}
          >
            <View style={styles.statusHeader}>
              <View>
                <Text style={styles.statusLabel}>Location Sharing</Text>
                <Text style={styles.statusValue}>{sharingActive ? 'Active' : 'Inactive'}</Text>
              </View>
              <Switch
                value={sharingActive}
                onValueChange={setSharingActive}
                trackColor={{ false: '#ccc', true: COLORS.skyBlueLight }}
                thumbColor={sharingActive ? COLORS.blueGreen : '#999'}
              />
            </View>

            {sharingActive && (
              <View style={styles.statusDetails}>
                <Text style={styles.statusDetailText}>
                  📍 Sharing with {sharedCount} contact{sharedCount !== 1 ? 's' : ''}
                </Text>
                <Text style={styles.statusDetailText}>🕐 Last updated: 2 minutes ago</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Quick Check-In */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Check-In</Text>
          <TouchableOpacity
            style={styles.checkInCard}
            onPress={() => setCheckInVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.checkInIcon}>📍</Text>
            <View style={styles.checkInContent}>
              <Text style={styles.checkInLabel}>Current Location</Text>
              <Text style={styles.checkInValue}>{location}</Text>
            </View>
            <Text style={styles.checkInArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.quickLocationButtons}>
            <TouchableOpacity
              style={[styles.locationBtn, { backgroundColor: '#e8f5e9' }]}
              onPress={() => setLocation('Home')}
            >
              <Text style={styles.locationBtnIcon}>🏠</Text>
              <Text style={styles.locationBtnText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.locationBtn, { backgroundColor: '#e3f2fd' }]}
              onPress={() => setLocation('Work')}
            >
              <Text style={styles.locationBtnIcon}>🏢</Text>
              <Text style={styles.locationBtnText}>Work</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.locationBtn, { backgroundColor: '#fff3e0' }]}
              onPress={() => setLocation('School')}
            >
              <Text style={styles.locationBtnIcon}>🎓</Text>
              <Text style={styles.locationBtnText}>School</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.locationBtn, { backgroundColor: '#f3e5f5' }]}
              onPress={() => setLocation('Gym')}
            >
              <Text style={styles.locationBtnIcon}>💪</Text>
              <Text style={styles.locationBtnText}>Gym</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sharing Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Share With</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EmergencyContacts')}>
              <Text style={styles.editLink}>+ Add Contact</Text>
            </TouchableOpacity>
          </View>

          {selectedContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactCard}
              onPress={() => toggleContactShare(contact.id)}
              activeOpacity={0.7}
            >
              <View style={styles.contactLeft}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactAvatarText}>{contact.avatar}</Text>
                </View>
                <Text style={styles.contactName}>{contact.name}</Text>
              </View>

              <View style={styles.toggleContainer}>
                <Switch
                  value={contact.shared}
                  onValueChange={() => toggleContactShare(contact.id)}
                  trackColor={{ false: '#e0e0e0', true: COLORS.skyBlueLight }}
                  thumbColor={contact.shared ? COLORS.blueGreen : '#999'}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Privacy Info */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>🔒</Text>
            <View>
              <Text style={styles.infoTitle}>Your Privacy Matters</Text>
              <Text style={styles.infoText}>
                Your location is encrypted and shared only with people you trust. You can change sharing settings anytime.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Check-In Modal */}
      <Modal
        visible={checkInVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCheckInVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Update Location</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter location or description"
              placeholderTextColor="#999"
              value={location}
              onChangeText={setLocation}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#f5f5f5' }]}
                onPress={() => setCheckInVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: COLORS.deepSpaceBlue }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.blueGreen }]}
                onPress={handleCheckIn}
              >
                <Text style={[styles.modalBtnText, { color: COLORS.white }]}>Check In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 80,
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
  statusCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusGradient: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  statusDetails: {
    marginTop: 8,
  },
  statusDetailText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.white,
    opacity: 0.85,
    marginBottom: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editLink: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.blueGreen,
  },
  checkInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.skyBlueLight,
    marginBottom: 12,
  },
  checkInIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  checkInContent: {
    flex: 1,
  },
  checkInLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.deepSpaceBlue,
    opacity: 0.6,
    marginBottom: 2,
  },
  checkInValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.blueGreen,
  },
  checkInArrow: {
    fontSize: 18,
    color: COLORS.blueGreen,
  },
  quickLocationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  locationBtn: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  locationBtnIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  locationBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#efefef',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.skyBlueLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  contactAvatarText: {
    fontSize: 18,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
  },
  toggleContainer: {
    paddingLeft: 10,
  },
  infoCard: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.skyBlueLight,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 20,
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
    opacity: 0.65,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    minHeight: 240,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.deepSpaceBlue,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LocationSharingScreen;
