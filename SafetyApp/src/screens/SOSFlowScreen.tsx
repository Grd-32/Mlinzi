import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { sosService } from '../services/sosService';
import { locationPermissionsService } from '../services/locationPermissionsService';
import { emergencyContactService } from '../services/emergencyContactService';
import { notificationService } from '../services/notificationService';

interface SOSFlowScreenProps {
  navigation: any;
  route: any;
}

const SOSFlowScreen: React.FC<SOSFlowScreenProps> = ({ navigation, route }) => {
  const { state } = useAuth();
  const incidentType = route.params?.incidentType || 'normal';

  const [step, setStep] = useState<'type' | 'details' | 'confirm' | 'processing' | 'callback'>('type');
  const [selectedType, setSelectedType] = useState(incidentType);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sosAlert, setSOSAlert] = useState<any>(null);

  const incidentTypes = [
    { id: 'normal', label: 'Normal Emergency', description: 'General emergency assistance needed', color: '#EF4444' },
    { id: 'sensitive', label: 'Sensitive', description: 'Need discreet help', color: '#7C3AED' },
    { id: 'test', label: 'Test Alert', description: 'Testing the system', color: '#3B82F6' },
    { id: 'medical', label: 'Medical Emergency', description: 'Medical assistance needed', color: '#10B981' },
    { id: 'crime', label: 'Crime', description: 'Criminal activity reported', color: '#F59E0B' },
    { id: 'fire', label: 'Fire', description: 'Fire emergency', color: '#EF4444' },
  ];

  useEffect(() => {
    if (step === 'confirm' || step === 'processing') {
      getLocation();
    }
  }, [step]);

  const getLocation = async () => {
    try {
      const hasPermission = await locationPermissionsService.requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Location permission is required for SOS');
        return;
      }

      setLoading(true);
      const loc = await locationPermissionsService.getCurrentLocation();
      const address = await locationPermissionsService.getAddressFromCoords(loc.latitude, loc.longitude);
      setLocation({ ...loc, address });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your location');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSOS = async () => {
    if (!state.user) return;

    setLoading(true);
    try {
      if (!location) {
        Alert.alert('Error', 'Location could not be determined');
        return;
      }

      // Create SOS alert
      const alert = await sosService.createSOSAlert(
        state.user.id,
        selectedType as any,
        location.latitude,
        location.longitude,
        location.address,
        description
      );

      setSOSAlert(alert);

      // Send notifications to emergency contacts (except for sensitive)
      if (selectedType !== 'sensitive') {
        await sosService.notifyEmergencyContacts(alert.id, state.user.id);
      }

      // Send notification to user
      await notificationService.sendLocalNotification(
        'SOS Alert Sent',
        `Your ${selectedType} SOS alert has been reported to emergency services.`
      );

      setStep('callback');
    } catch (error) {
      console.error('Error submitting SOS:', error);
      Alert.alert('Error', 'Failed to submit SOS alert');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAlert = async () => {
    if (sosAlert) {
      try {
        await sosService.cancelAlert(sosAlert.id);
        Alert.alert('Success', 'SOS alert has been cancelled');
        navigation.goBack();
      } catch (error) {
        Alert.alert('Error', 'Failed to cancel alert');
      }
    }
  };

  // Type Selection Step
  if (step === 'type') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Emergency Type</Text>
          <Text style={styles.headerSubtitle}>Choose the type of emergency</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {incidentTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeCard,
                selectedType === type.id && styles.typeCardSelected,
              ]}
              onPress={() => {
                setSelectedType(type.id);
                setStep('details');
              }}
            >
              <View style={styles.typeCardContent}>
                <Text style={styles.typeLabel}>{type.label}</Text>
                <Text style={styles.typeDescription}>{type.description}</Text>
              </View>
              {selectedType === type.id && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Details Step
  if (step === 'details') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Details</Text>
          <Text style={styles.headerSubtitle}>Optional: Provide more information</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>What happened?</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Describe the situation (optional)"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </ScrollView>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep('type')}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => setStep('confirm')}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Confirmation Step
  if (step === 'confirm') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Confirm SOS</Text>
          <Text style={styles.headerSubtitle}>Review your emergency alert</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Type:</Text>
              <Text style={styles.summaryValue}>{incidentTypes.find(t => t.id === selectedType)?.label}</Text>
            </View>

            {location && (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Location:</Text>
                  <Text style={styles.summaryValue}>{location.address}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Coordinates:</Text>
                  <Text style={styles.summaryValue}>
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </Text>
                </View>
              </>
            )}

            {description && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Description:</Text>
                <Text style={styles.summaryValue}>{description}</Text>
              </View>
            )}
          </View>

          {selectedType === 'sensitive' && (
            <View style={styles.sensitiveInfo}>
              <Text style={styles.sensitiveTitle}>⚠️ Sensitive Mode</Text>
              <Text style={styles.sensitiveText}>
                • Your emergency contacts will NOT be notified
                • You will have private chat access with an operator
                • The alert will be discreet
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep('details')}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitSOS}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit SOS</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Callback/Confirmation Screen
  if (step === 'callback') {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>SOS Alert Submitted</Text>
          <Text style={styles.successSubtitle}>
            {selectedType === 'sensitive' 
              ? 'Your discreet alert has been received'
              : 'Emergency services have been notified'}
          </Text>

          {sosAlert && (
            <View style={styles.alertDetailsCard}>
              <Text style={styles.alertDetailsTitle}>Alert ID: {sosAlert.id.slice(0, 8)}...</Text>
              <Text style={styles.alertDetailsText}>Status: {sosAlert.status}</Text>
              <Text style={styles.alertDetailsText}>Type: {sosAlert.incidentType}</Text>
            </View>
          )}

          {selectedType === 'sensitive' && (
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => navigation.navigate('OperatorChat', { alertId: sosAlert?.id })}
            >
              <Text style={styles.chatButtonText}>Open Operator Chat</Text>
            </TouchableOpacity>
          )}

          {selectedType !== 'test' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelAlert}
            >
              <Text style={styles.cancelButtonText}>Cancel Alert</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.homeButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#EF4444',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  typeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeCardSelected: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  typeCardContent: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  checkmark: {
    fontSize: 20,
    color: '#EF4444',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  sensitiveInfo: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  sensitiveTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  sensitiveText: {
    fontSize: 13,
    color: '#B45309',
    lineHeight: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  alertDetailsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  alertDetailsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  alertDetailsText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  chatButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default SOSFlowScreen;
