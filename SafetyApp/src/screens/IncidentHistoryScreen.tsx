import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/colors';

// Incident Card Component - defined at module level
const IncidentCard = ({ item, getStatusColor, getStatusLabel, styles }: any) => (
  <TouchableOpacity style={styles.incidentCard} activeOpacity={0.7}>
    <View style={[styles.incidentIconBg, { backgroundColor: getStatusColor(item.status) + '20' }]}>
      <Text style={styles.incidentIcon}>{item.icon}</Text>
    </View>

    <View style={styles.incidentContent}>
      <View style={styles.incidentHeader}>
        <Text style={styles.incidentTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>
      <Text style={styles.incidentDesc}>{item.description}</Text>
      <View style={styles.incidentMeta}>
        <Text style={styles.incidentTime}>{item.time}</Text>
        {item.contacts > 0 && (
          <>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.contactsText}>
              {item.contacts} contact{item.contacts !== 1 ? 's' : ''} notified
            </Text>
          </>
        )}
      </View>
    </View>

    <Text style={styles.incidentArrow}>→</Text>
  </TouchableOpacity>
);

const IncidentHistoryScreen = ({ navigation }) => {
  const [incidents] = useState([
    {
      id: '1',
      date: 'Today',
      data: [
        {
          id: '1a',
          type: 'sos_alert',
          icon: '🆘',
          title: 'SOS Alert Triggered',
          description: 'Medical Emergency - Nairobi Central',
          time: '2:30 PM',
          status: 'resolved',
          contacts: 3,
        },
        {
          id: '1b',
          type: 'incident_report',
          icon: '🚨',
          title: 'Incident Reported',
          description: 'Traffic Accident at Kenyatta Avenue',
          time: '11:15 AM',
          status: 'active',
          contacts: 1,
        },
      ],
    },
    {
      id: '2',
      date: 'Yesterday',
      data: [
        {
          id: '2a',
          type: 'checkin',
          icon: '✓',
          title: 'Check-in Confirmed',
          description: 'Arrived safely at destination',
          time: '6:45 PM',
          status: 'completed',
          contacts: 5,
        },
        {
          id: '2b',
          type: 'location_share',
          icon: '📍',
          title: 'Location Shared',
          description: 'Shared location with Mom and Dad',
          time: '8:20 AM',
          status: 'active',
          contacts: 2,
        },
      ],
    },
    {
      id: '3',
      date: 'This Week',
      data: [
        {
          id: '3a',
          type: 'community_alert',
          icon: '🏘️',
          title: 'Community Safety Alert',
          description: 'New safety announcement from Kilimani Estate',
          time: '3 days ago',
          status: 'info',
          contacts: 0,
        },
        {
          id: '3b',
          type: 'emergency_contact_update',
          icon: '👥',
          title: 'Emergency Contacts Updated',
          description: 'Added sister as emergency contact',
          time: '5 days ago',
          status: 'info',
          contacts: 0,
        },
      ],
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return COLORS.princetonOrange;
      case 'resolved':
        return COLORS.blueGreen;
      case 'completed':
        return COLORS.blueGreen;
      case 'info':
        return COLORS.skyBlueLight;
      default:
        return COLORS.deepSpaceBlue;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'resolved':
        return 'Resolved';
      case 'completed':
        return 'Completed';
      case 'info':
        return 'Info';
      default:
        return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity Log</Text>
        <Text style={styles.headerSubtext}>Your safety history and reports</Text>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={[styles.statItem, { borderLeftWidth: 1, borderLeftColor: '#e0e0e0' }]}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={[styles.statItem, { borderLeftWidth: 1, borderLeftColor: '#e0e0e0' }]}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>SOS Alerts</Text>
        </View>
      </View>

      {/* Incidents List */}
      <SectionList
        sections={incidents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <IncidentCard item={item} getStatusColor={getStatusColor} getStatusLabel={getStatusLabel} styles={styles} />}
        renderSectionHeader={({ section: { date } }) => (
          <Text style={styles.dateHeader}>{date}</Text>
        )}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
      />
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
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#efefef',
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
    paddingBottom: 80,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
    marginHorizontal: 8,
    marginTop: 16,
    marginBottom: 12,
  },
  incidentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 8,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#efefef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  incidentIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  incidentIcon: {
    fontSize: 20,
  },
  incidentContent: {
    flex: 1,
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  incidentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  incidentDesc: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.deepSpaceBlue,
    opacity: 0.65,
    marginBottom: 6,
  },
  incidentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incidentTime: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.deepSpaceBlue,
    opacity: 0.5,
  },
  metaDot: {
    marginHorizontal: 6,
    color: COLORS.deepSpaceBlue,
    opacity: 0.3,
  },
  contactsText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.blueGreen,
  },
  incidentArrow: {
    fontSize: 16,
    color: COLORS.blueGreen,
    marginLeft: 8,
    marginTop: 4,
  },
});

export default IncidentHistoryScreen;
