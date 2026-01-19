import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import { useAuth } from '../context/AuthContext';
import { emergencyContactService } from '../services/emergencyContactService';
import { EmergencyContact } from '../types';
import { COLORS } from '../utils/colors';
import { LinearGradient } from 'expo-linear-gradient';

const EmergencyContactsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { state } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [phoneContacts, setPhoneContacts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
    isPrimary: false,
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    if (!state.user) return;
    try {
      setLoading(true);
      const data = await emergencyContactService.getUserEmergencyContacts(state.user.id);
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      Alert.alert('Error', 'Failed to load emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async () => {
    if (!state.user) {
      Alert.alert('Error', 'You must be logged in to save contacts');
      return;
    }

    if (!formData.name || !formData.phone) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        // Update
        const updated = await emergencyContactService.updateEmergencyContact(
          editingId,
          formData.name,
          formData.phone,
          formData.relationship,
          formData.isPrimary
        );
        setContacts(contacts.map((c) => (c.id === editingId ? updated : c)));
      } else {
        // Add new
        const newContact = await emergencyContactService.addEmergencyContact(
          state.user.id,
          formData.name,
          formData.phone,
          formData.relationship,
          formData.isPrimary
        );
        setContacts([...contacts, newContact]);
      }

      setModalVisible(false);
      setEditingId(null);
      setFormData({ name: '', phone: '', relationship: '', isPrimary: false });
      Alert.alert('Success', editingId ? 'Contact updated' : 'Contact added successfully');
    } catch (error: any) {
      console.error('Error saving contact:', error);
      Alert.alert('Error', error.message || 'Failed to save contact. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Contact', 'Are you sure you want to delete this contact?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await emergencyContactService.deleteEmergencyContact(id);
            setContacts(contacts.filter((c) => c.id !== id));
            Alert.alert('Success', 'Contact deleted');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete contact');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship || '',
      isPrimary: contact.isPrimary,
    });
    setModalVisible(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', phone: '', relationship: '', isPrimary: false });
    setModalVisible(true);
  };

  const importFromPhoneContacts = async () => {
    try {
      const permission = await Contacts.requestPermissionsAsync();
      if (permission.status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        });

        // Filter contacts that have phone numbers
        const contactsWithPhones = data.filter(c => c.phoneNumbers && c.phoneNumbers.length > 0);

        if (contactsWithPhones.length > 0) {
          setPhoneContacts(contactsWithPhones);
          setImportModalVisible(true);
        } else {
          Alert.alert('No Contacts', 'No contacts with phone numbers found on this device');
        }
      } else {
        Alert.alert('Permission Denied', 'Please enable contact permissions in settings to import contacts');
      }
    } catch (error) {
      console.error('Error importing contacts:', error);
      Alert.alert('Error', 'Failed to import contacts. Please try again.');
    }
  };

  const handleSelectPhoneContact = (contact: any) => {
    const phone = contact.phoneNumbers?.[0]?.number || '';
    setFormData({
      name: contact.name || '',
      phone: phone.replace(/\s+/g, ''),
      relationship: '',
      isPrimary: false,
    });
    setImportModalVisible(false);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.princetonOrange} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.deepSpaceBlue, COLORS.blueGreen]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <Text style={styles.headerSubtitle}>Manage people to notify in emergencies</Text>
      </LinearGradient>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.headerButton, styles.addContactBtn]}
          onPress={openAddModal}
        >
          <Text style={styles.headerButtonText}>+ Add Manually</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerButton, styles.importContactBtn]}
          onPress={importFromPhoneContacts}
        >
          <Text style={styles.headerButtonText}>📱 Import from Phone</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LinearGradient
            colors={item.isPrimary ? [COLORS.amberFlame + '20', COLORS.princetonOrange + '20'] : [COLORS.white, COLORS.white]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.contactCard, item.isPrimary && styles.contactCardPrimary]}
          >
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactPhone}>{item.phone}</Text>
              {item.relationship && <Text style={styles.contactRelationship}>{item.relationship}</Text>}
              {item.isPrimary && <Text style={styles.primaryBadge}>⭐ Primary Contact</Text>}
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEdit(item)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👥</Text>
            <Text style={styles.emptyStateTitle}>No Emergency Contacts</Text>
            <Text style={styles.emptyStateText}>Add at least one emergency contact</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Contact' : 'Add Contact'}</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Relationship</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Mother, Brother, Friend"
                value={formData.relationship}
                onChangeText={(text) => setFormData({ ...formData, relationship: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity
              style={[styles.checkboxContainer, formData.isPrimary && styles.checkboxContainerChecked]}
              onPress={() => setFormData({ ...formData, isPrimary: !formData.isPrimary })}
            >
              <View style={[styles.checkbox, formData.isPrimary && styles.checkboxChecked]} />
              <Text style={styles.checkboxLabel}>Set as Primary Contact</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleAddOrUpdate}
            >
              <Text style={styles.modalSaveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Import Phone Contacts Modal */}
      <Modal
        visible={importModalVisible}
        animationType="slide"
        onRequestClose={() => setImportModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setImportModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Import Contact</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.importSubtitle}>
              Found {phoneContacts.length} contacts with phone numbers
            </Text>
            <FlatList
              data={phoneContacts}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.importContactItem}
                  onPress={() => handleSelectPhoneContact(item)}
                >
                  <View>
                    <Text style={styles.importContactName}>{item.name}</Text>
                    <Text style={styles.importContactPhone}>
                      {item.phoneNumbers?.[0]?.number || 'No number'}
                    </Text>
                  </View>
                  <Text style={styles.importContactArrow}>›</Text>
                </TouchableOpacity>
              )}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.skyBlueLight,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  headerButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addContactBtn: {
    backgroundColor: COLORS.princetonOrange,
  },
  importContactBtn: {
    backgroundColor: COLORS.blueGreen,
  },
  headerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.skyBlueLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  contactCardPrimary: {
    borderColor: COLORS.princetonOrange,
  },
  contactInfo: {
    marginBottom: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
  },
  contactPhone: {
    fontSize: 14,
    color: COLORS.blueGreen,
    marginTop: 4,
  },
  contactRelationship: {
    fontSize: 13,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  primaryBadge: {
    fontSize: 12,
    color: COLORS.princetonOrange,
    fontWeight: '600',
    marginTop: 6,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: COLORS.skyBlueLight + '40',
    alignItems: 'center',
  },
  editButtonText: {
    color: COLORS.blueGreen,
    fontWeight: '600',
    fontSize: 12,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: COLORS.amberFlame + '40',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: COLORS.princetonOrange,
    fontWeight: '600',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.blueGreen,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  modalHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.skyBlueLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    color: COLORS.deepSpaceBlue,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
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
    color: COLORS.deepSpaceBlue,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.skyBlueLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.deepSpaceBlue,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkboxContainerChecked: {
    backgroundColor: COLORS.amberFlame + '20',
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.skyBlueLight,
    borderRadius: 4,
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: COLORS.princetonOrange,
    borderColor: COLORS.princetonOrange,
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.deepSpaceBlue,
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.skyBlueLight,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.skyBlueLight,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: COLORS.blueGreen,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.princetonOrange,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  importSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  importContactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  importContactName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
    marginBottom: 4,
  },
  importContactPhone: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.deepSpaceBlue,
    opacity: 0.6,
  },
  importContactArrow: {
    fontSize: 20,
    color: COLORS.blueGreen,
  },
});

export default EmergencyContactsScreen;
