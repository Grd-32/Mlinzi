import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { emergencyInfoService } from '../services/emergencyInfoService';
import { PersonalEmergencyInfo } from '../types';
import { supabase } from '../services/supabaseClient';
import { COLORS } from '../utils/colors';

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { state, signOut, updateUser } = useAuth();
  const [emergencyInfo, setEmergencyInfo] = useState<PersonalEmergencyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [profileEditVisible, setProfileEditVisible] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [formData, setFormData] = useState({
    medicalConditions: '',
    allergies: '',
    bloodType: '',
    emergencyInsurance: '',
    insuranceNumber: '',
    doctorName: '',
    doctorPhone: '',
  });

  useEffect(() => {
    fetchEmergencyInfo();
    setProfileFormData({
      firstName: state.user?.firstName || '',
      lastName: state.user?.lastName || '',
      phone: state.user?.phone || '',
    });
  }, [state.user?.id]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchEmergencyInfo();
      setProfileFormData({
        firstName: state.user?.firstName || '',
        lastName: state.user?.lastName || '',
        phone: state.user?.phone || '',
      });
    }, [state.user?.id, state.user?.firstName, state.user?.lastName, state.user?.phone])
  );

  const fetchEmergencyInfo = async () => {
    if (!state.user) return;
    try {
      setLoading(true);
      const info = await emergencyInfoService.getEmergencyInfo(state.user.id);
      if (info) {
        setEmergencyInfo(info);
        setFormData({
          medicalConditions: info.medicalConditions || '',
          allergies: info.allergies || '',
          bloodType: info.bloodType || '',
          emergencyInsurance: info.emergencyInsurance || '',
          insuranceNumber: info.insuranceNumber || '',
          doctorName: info.doctorName || '',
          doctorPhone: info.doctorPhone || '',
        });
      }
    } catch (error) {
      console.error('Error fetching emergency info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmergencyInfo = async () => {
    if (!state.user) return;

    try {
      const info = await emergencyInfoService.saveEmergencyInfo(
        state.user.id,
        formData.medicalConditions,
        formData.allergies,
        formData.bloodType,
        formData.emergencyInsurance,
        formData.insuranceNumber,
        formData.doctorName,
        formData.doctorPhone
      );
      setEmergencyInfo(info);
      setEditModalVisible(false);
      Alert.alert('Success', 'Emergency information updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to save emergency information');
    }
  };

  const handleSaveProfile = async () => {
    if (!state.user) return;

    try {
      const updateData: any = {
        first_name: profileFormData.firstName,
        last_name: profileFormData.lastName,
        phone: profileFormData.phone,
      };

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', state.user.id);

      if (error) throw error;

      const updatedUser = {
        ...state.user,
        firstName: profileFormData.firstName,
        lastName: profileFormData.lastName,
        phone: profileFormData.phone,
      };
      updateUser(updatedUser);
      setProfileEditVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Sign Out',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileAvatarContainer}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{state.user?.firstName?.charAt(0) || 'U'}</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {state.user?.firstName} {state.user?.lastName}
            </Text>
            <Text style={styles.profileEmail}>{state.user?.email}</Text>
            {state.user?.phone && <Text style={styles.profilePhone}>{state.user.phone}</Text>}
          </View>
          <TouchableOpacity
            style={styles.profileEditButton}
            onPress={() => setProfileEditVisible(true)}
          >
            <Text style={styles.profileEditButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Medical Info</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditModalVisible(true)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {emergencyInfo && (
            <View style={styles.infoCard}>
              {emergencyInfo.bloodType && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Blood Type:</Text>
                  <Text style={styles.infoValue}>{emergencyInfo.bloodType}</Text>
                </View>
              )}
              {emergencyInfo.allergies && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Allergies:</Text>
                  <Text style={styles.infoValue}>{emergencyInfo.allergies}</Text>
                </View>
              )}
              {emergencyInfo.medicalConditions && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Medical Conditions:</Text>
                  <Text style={styles.infoValue}>{emergencyInfo.medicalConditions}</Text>
                </View>
              )}
              {emergencyInfo.doctorName && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Doctor:</Text>
                  <Text style={styles.infoValue}>{emergencyInfo.doctorName}</Text>
                </View>
              )}
              {emergencyInfo.doctorPhone && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Doctor Phone:</Text>
                  <Text style={styles.infoValue}>{emergencyInfo.doctorPhone}</Text>
                </View>
              )}
              {emergencyInfo.emergencyInsurance && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Insurance:</Text>
                  <Text style={styles.infoValue}>{emergencyInfo.emergencyInsurance}</Text>
                </View>
              )}
              {emergencyInfo.insuranceNumber && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Policy Number:</Text>
                  <Text style={styles.infoValue}>{emergencyInfo.insuranceNumber}</Text>
                </View>
              )}
            </View>
          )}

          {!emergencyInfo && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No emergency information added yet</Text>
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert('Info', 'Privacy policy goes here')}
          >
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert('Info', 'Terms of service goes here')}
          >
            <Text style={styles.settingLabel}>Terms of Service</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert('Version', 'Mlinzi v1.0.0')}
          >
            <Text style={styles.settingLabel}>About</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Emergency Info Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Emergency Info</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Blood Type</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., O+, A-, AB+"
                value={formData.bloodType}
                onChangeText={(text) => setFormData({ ...formData, bloodType: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Allergies</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="List any allergies (e.g., Penicillin, Peanuts)"
                multiline
                numberOfLines={2}
                value={formData.allergies}
                onChangeText={(text) => setFormData({ ...formData, allergies: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medical Conditions</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="List any medical conditions"
                multiline
                numberOfLines={2}
                value={formData.medicalConditions}
                onChangeText={(text) => setFormData({ ...formData, medicalConditions: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Doctor Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your doctor's name"
                value={formData.doctorName}
                onChangeText={(text) => setFormData({ ...formData, doctorName: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Doctor Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Doctor's contact number"
                keyboardType="phone-pad"
                value={formData.doctorPhone}
                onChangeText={(text) => setFormData({ ...formData, doctorPhone: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Emergency Insurance</Text>
              <TextInput
                style={styles.input}
                placeholder="Insurance provider name"
                value={formData.emergencyInsurance}
                onChangeText={(text) => setFormData({ ...formData, emergencyInsurance: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Policy Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Insurance policy number"
                value={formData.insuranceNumber}
                onChangeText={(text) => setFormData({ ...formData, insuranceNumber: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSaveEmergencyInfo}
            >
              <Text style={styles.modalSaveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Profile Edit Modal */}
      <Modal
        visible={profileEditVisible}
        animationType="slide"
        onRequestClose={() => setProfileEditVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setProfileEditVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="First name"
                value={profileFormData.firstName}
                onChangeText={(text) => setProfileFormData({ ...profileFormData, firstName: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Last name"
                value={profileFormData.lastName}
                onChangeText={(text) => setProfileFormData({ ...profileFormData, lastName: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Phone number"
                keyboardType="phone-pad"
                value={profileFormData.phone}
                onChangeText={(text) => setProfileFormData({ ...profileFormData, phone: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setProfileEditVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSaveProfile}
            >
              <Text style={styles.modalSaveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileAvatarContainer: {
    marginRight: 16,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  profileEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  profilePhone: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  profileEditButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.princetonOrange,
    borderRadius: 6,
  },
  profileEditButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
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
    fontWeight: '600',
    color: '#1F2937',
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
  },
  editButtonText: {
    color: '#0369A1',
    fontWeight: '600',
    fontSize: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoRow: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
  },
  emptyCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingLabel: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  settingArrow: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  signOutButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  signOutButtonText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ProfileScreen;
