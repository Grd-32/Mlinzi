import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SectionList,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { locationPermissionsService } from '../services/locationPermissionsService';
import { smartAlertService } from '../services/smartAlertService';
import { COLORS } from '../utils/colors';

// Alert Card Component - defined at module level
const AlertCard = ({ item, getSeverityColor, styles }: any) => (
  <TouchableOpacity
    style={styles.alertCard}
    activeOpacity={0.7}
    onPress={() => {
      // Alert cards don't navigate elsewhere - they're already in the alerts feed
    }}
  >
    <View style={styles.alertLeft}>
      <View style={[styles.alertIconBg, { backgroundColor: getSeverityColor(item.severity) + '20' }]}>
        <Text style={styles.alertIcon}>{item.icon}</Text>
      </View>
    </View>

    <View style={styles.alertContent}>
      <Text style={styles.alertTitle}>{item.title}</Text>
      <Text style={styles.alertDesc} numberOfLines={1}>{item.description}</Text>
      <View style={styles.alertMeta}>
        <Text style={styles.alertLocation}>📍 {item.location}</Text>
        <Text style={styles.alertDot}>•</Text>
        <Text style={styles.alertTime}>{item.time}</Text>
      </View>
    </View>

    <View style={styles.alertRight}>
      <View
        style={[
          styles.severityBadge,
          { backgroundColor: getSeverityColor(item.severity) + '20' },
        ]}
      >
        <Text style={[styles.severityText, { color: getSeverityColor(item.severity) }]}>
          {item.severity === 'high' ? '!!!' : item.severity === 'medium' ? '!!' : '!'}
        </Text>
      </View>
      <Text style={styles.distance}>{item.distance}</Text>
    </View>
  </TouchableOpacity>
);

const AlertsFeedScreen = ({ navigation }: { navigation: any }) => {
  const { state } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertFormData, setAlertFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    type: 'security',
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleCreateAlert = async () => {
    if (!state.user || !alertFormData.title || !alertFormData.description) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const location = await locationPermissionsService.getCurrentLocation();

      await smartAlertService.createAlert(
        state.user.id,
        alertFormData.title,
        alertFormData.description,
        alertFormData.type,
        alertFormData.severity,
        location.latitude,
        location.longitude
      );

      Alert.alert('Success', 'Alert created and shared with your community');
      setCreateModalVisible(false);
      setAlertFormData({
        title: '',
        description: '',
        severity: 'medium',
        type: 'security',
      });
    } catch (error) {
      console.error('Error creating alert:', error);
      Alert.alert('Error', 'Failed to create alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const alertSections = [
    {
      title: 'Recent Alerts',
      data: [
        {
          id: '1',
          type: 'traffic',
          icon: '🚗',
          title: 'Traffic Incident',
          location: 'Nairobi Central',
          distance: '1.2 km',
          time: '5 min ago',
          severity: 'medium',
          description: 'Heavy traffic reported on Kenyatta Avenue',
        },
        {
          id: '2',
          type: 'weather',
          icon: '🌧️',
          title: 'Heavy Rain Alert',
          location: 'Your Area',
          distance: 'Now',
          time: '15 min ago',
          severity: 'high',
          description: 'Heavy rainfall expected. Reduce visibility on roads.',
        },
        {
          id: '3',
          type: 'security',
          icon: '🚨',
          title: 'Security Alert',
          location: 'Westlands',
          distance: '3.5 km',
          time: '32 min ago',
          severity: 'medium',
          description: 'Suspicious activity reported in the area',
        },
      ],
    },
    {
      title: 'Community Updates',
      data: [
        {
          id: '4',
          type: 'community',
          icon: '🏘️',
          title: 'Safety Patrol',
          location: 'Kilimani Estate',
          distance: '2.1 km',
          time: '1 hour ago',
          severity: 'low',
          description: 'Community patrol scheduled for tonight at 8 PM',
        },
        {
          id: '5',
          type: 'community',
          icon: '👥',
          title: 'Neighborhood Watch',
          location: 'Nairobi South',
          distance: '4.2 km',
          time: '3 hours ago',
          severity: 'low',
          description: 'Join our new neighborhood watch group',
        },
      ],
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#ff4444';
      case 'medium':
        return COLORS.amberFlame;
      case 'low':
        return COLORS.blueGreen;
      default:
        return COLORS.deepSpaceBlue;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Safety Alerts</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Alert Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Active Alerts</Text>
        </View>
        <View style={[styles.statItem, { borderLeftWidth: 1, borderLeftColor: '#e0e0e0' }]}>
          <Text style={styles.statValue}>2</Text>
          <Text style={styles.statLabel}>Near You</Text>
        </View>
        <View style={[styles.statItem, { borderLeftWidth: 1, borderLeftColor: '#e0e0e0' }]}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Unread</Text>
        </View>
      </View>

      {/* Alerts List */}
      <SectionList
        sections={alertSections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AlertCard item={item} getSeverityColor={getSeverityColor} styles={styles} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        scrollEnabled={true}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: COLORS.princetonOrange }]}
          onPress={() => setCreateModalVisible(true)}
        >
          <Text style={styles.actionBtnIcon}>➕</Text>
          <Text style={styles.actionBtnText}>Create Alert</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: COLORS.blueGreen }]}
          onPress={() => navigation.navigate('EmergencyNumbers')}
        >
          <Text style={styles.actionBtnIcon}>☎️</Text>
          <Text style={styles.actionBtnText}>Emergency</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: COLORS.skyBlueLight }]}
          onPress={() => navigation.navigate('Community')}
        >
          <Text style={styles.actionBtnIcon}>🔔</Text>
          <Text style={styles.actionBtnText}>Community</Text>
        </TouchableOpacity>
      </View>

      {/* Create Alert Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Safety Alert</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Alert Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Traffic Accident, Road Hazard"
                value={alertFormData.title}
                onChangeText={(text) => setAlertFormData({ ...alertFormData, title: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Describe the situation in detail"
                multiline
                numberOfLines={4}
                value={alertFormData.description}
                onChangeText={(text) => setAlertFormData({ ...alertFormData, description: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Alert Type</Text>
              <View style={styles.typeButtonsRow}>
                {['security', 'traffic', 'weather', 'community'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      alertFormData.type === type && styles.typeButtonSelected,
                    ]}
                    onPress={() => setAlertFormData({ ...alertFormData, type: type as any })}
                  >
                    <Text style={styles.typeButtonText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Severity</Text>
              <View style={styles.severityButtonsRow}>
                {['low', 'medium', 'high'].map((severity) => (
                  <TouchableOpacity
                    key={severity}
                    style={[
                      styles.severityButton,
                      alertFormData.severity === severity && styles.severityButtonSelected,
                    ]}
                    onPress={() => setAlertFormData({ ...alertFormData, severity: severity as any })}
                  >
                    <Text style={styles.severityButtonText}>{severity}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setCreateModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleCreateAlert}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.modalSaveButtonText}>Create Alert</Text>
              )}
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
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.deepSpaceBlue,
    opacity: 0.6,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 80,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
    marginHorizontal: 8,
    marginVertical: 12,
    marginTop: 16,
  },
  alertCard: {
    flexDirection: 'row',
    marginHorizontal: 8,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.amberFlame,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  alertLeft: {
    marginRight: 10,
  },
  alertIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
  alertDesc: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.deepSpaceBlue,
    opacity: 0.65,
    marginBottom: 4,
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertLocation: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.blueGreen,
  },
  alertDot: {
    marginHorizontal: 6,
    color: COLORS.deepSpaceBlue,
    opacity: 0.3,
  },
  alertTime: {
    fontSize: 10,
    fontWeight: '400',
    color: COLORS.deepSpaceBlue,
    opacity: 0.5,
  },
  alertRight: {
    alignItems: 'center',
    marginLeft: 8,
  },
  severityBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  severityText: {
    fontSize: 14,
    fontWeight: '800',
  },
  distance: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
    opacity: 0.6,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 0.5,
    borderTopColor: '#e0e0e0',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 10,
  },
  actionBtnIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  modalCloseText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
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
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  typeButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  typeButtonSelected: {
    backgroundColor: COLORS.princetonOrange,
    borderColor: COLORS.princetonOrange,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
  },
  severityButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  severityButtonSelected: {
    backgroundColor: COLORS.amberFlame,
    borderColor: COLORS.amberFlame,
  },
  severityButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
  },
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: COLORS.princetonOrange,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default AlertsFeedScreen;
