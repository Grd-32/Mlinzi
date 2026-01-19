import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/colors';

const SafetyScoreScreen = ({ navigation }) => {
  const [safetyScore] = useState(78);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [safetyTips] = useState([
    {
      id: '1',
      title: 'Update Emergency Contacts',
      description: 'Your emergency contacts were last updated 2 weeks ago',
      completed: false,
      action: 'Update',
      icon: '👥',
    },
    {
      id: '2',
      title: 'Enable Location Sharing',
      description: 'Share your location with trusted contacts for added safety',
      completed: true,
      action: 'Manage',
      icon: '📍',
    },
    {
      id: '3',
      title: 'Complete Medical Info',
      description: 'Add blood type and allergies to your profile',
      completed: false,
      action: 'Add',
      icon: '⚕️',
    },
    {
      id: '4',
      title: 'Join Your Community',
      description: 'Connect with neighbors and get safety updates',
      completed: false,
      action: 'Join',
      icon: '🏘️',
    },
  ]);

  const safetyStats = [
    { label: 'Emergency Contacts', value: '3', icon: '👥', color: COLORS.blueGreen },
    { label: 'Location Shares', value: '3', icon: '📍', color: COLORS.skyBlueLight },
    { label: 'Communities', value: '2', icon: '🏘️', color: COLORS.amberFlame },
    { label: 'Incidents Reported', value: '1', icon: '📋', color: COLORS.princetonOrange },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return COLORS.blueGreen;
    if (score >= 60) return COLORS.amberFlame;
    return '#ff4444';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent Safety Profile';
    if (score >= 60) return 'Good Safety Setup';
    return 'Needs Improvement';
  };

  const TipCard = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.tipCard,
        {
          borderLeftColor: item.completed ? COLORS.blueGreen : COLORS.amberFlame,
        },
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.tipLeft}>
        <Text style={styles.tipIcon}>{item.icon}</Text>
      </View>

      <View style={styles.tipContent}>
        <View style={styles.tipHeader}>
          <Text style={styles.tipTitle}>{item.title}</Text>
          {item.completed && <Text style={styles.completedBadge}>✓</Text>}
        </View>
        <Text style={styles.tipDescription}>{item.description}</Text>
      </View>

      <TouchableOpacity style={styles.tipAction}>
        <Text style={styles.tipActionText}>{item.action}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Safety Score</Text>
          <Text style={styles.headerSubtext}>Track your safety profile</Text>
        </View>

        {/* Score Card */}
        <View style={styles.scoreCard}>
          <LinearGradient
            colors={[getScoreColor(safetyScore), getScoreColor(safetyScore) + 'cc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreGradient}
          >
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>{safetyScore}</Text>
              <Text style={styles.scoreLabel}>/ 100</Text>
            </View>

            <View style={styles.scoreInfo}>
              <Text style={styles.scoreMessage}>{getScoreMessage(safetyScore)}</Text>
              <Text style={styles.scoreDetails}>
                You're doing great! Complete the safety tips to improve your score.
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Safety Progress</Text>
            <Text style={styles.progressPercent}>{safetyScore}%</Text>
          </View>

          <View style={styles.customProgressBar}>
            <View
              style={[
                styles.customProgressFill,
                {
                  width: `${safetyScore}%`,
                  backgroundColor: getScoreColor(safetyScore),
                },
              ]}
            />
          </View>

          <Text style={styles.progressNote}>
            Complete {4 - Math.floor(safetyScore / 25)} more tasks to reach 100
          </Text>
        </View>

        {/* Safety Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Safety Snapshot</Text>
          <View style={styles.statsGrid}>
            {safetyStats.map((stat, index) => (
              <View key={index} style={styles.statBox}>
                <View style={[styles.statIconBg, { backgroundColor: stat.color + '20' }]}>
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Safety Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Safety Checklist</Text>
          <Text style={styles.tipsSubtext}>
            {safetyTips.filter((t) => t.completed).length} of {safetyTips.length} completed
          </Text>

          {safetyTips.map((tip) => (
            <TipCard key={tip.id} item={tip} />
          ))}
        </View>

        {/* Weekly Report */}
        <View style={styles.reportSection}>
          <LinearGradient
            colors={['#f0f9ff', '#e0f2fe']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reportCard}
          >
            <Text style={styles.reportIcon}>📊</Text>
            <Text style={styles.reportTitle}>Weekly Safety Report</Text>
            <Text style={styles.reportText}>
              You've been active in safety features. Keep it up!
            </Text>
            <TouchableOpacity 
              style={styles.reportButton}
              onPress={() => setReportModalVisible(true)}
            >
              <Text style={styles.reportButtonText}>View Full Report →</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Full Report Modal */}
      <Modal
        visible={reportModalVisible}
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.reportModalContainer}>
          <View style={styles.reportModalHeader}>
            <TouchableOpacity onPress={() => setReportModalVisible(false)}>
              <Text style={styles.reportModalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.reportModalTitle}>Weekly Safety Report</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView contentContainerStyle={styles.reportModalContent} showsVerticalScrollIndicator={false}>
            {/* Report Summary */}
            <View style={styles.reportSummary}>
              <Text style={styles.reportPeriod}>Report Period: Jan 13 - Jan 19, 2026</Text>
              <View style={styles.reportSummaryCard}>
                <Text style={styles.reportSummaryLabel}>Your Safety Score</Text>
                <Text style={styles.reportSummaryScore}>{safetyScore}</Text>
                <Text style={styles.reportSummaryMessage}>{getScoreMessage(safetyScore)}</Text>
              </View>
            </View>

            {/* Safety Activities */}
            <View style={styles.reportSection2}>
              <Text style={styles.reportSectionTitle}>Safety Activities This Week</Text>
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>✓</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Emergency Contacts Verified</Text>
                  <Text style={styles.activityDate}>Jan 15, 2026</Text>
                </View>
              </View>
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>✓</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Location Sharing Enabled</Text>
                  <Text style={styles.activityDate}>Jan 12, 2026</Text>
                </View>
              </View>
              <View style={styles.activityItem}>
                <Text style={styles.activityIcon}>✓</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Joined Community Safety Group</Text>
                  <Text style={styles.activityDate}>Jan 10, 2026</Text>
                </View>
              </View>
            </View>

            {/* Score Breakdown */}
            <View style={styles.reportSection2}>
              <Text style={styles.reportSectionTitle}>Score Breakdown</Text>
              <View style={styles.breakdownItem}>
                <View style={styles.breakdownLeft}>
                  <Text style={styles.breakdownLabel}>Emergency Contacts</Text>
                  <Text style={styles.breakdownValue}>20 pts</Text>
                </View>
                <View style={styles.breakdownBar}>
                  <View style={[styles.breakdownFill, { width: '100%', backgroundColor: COLORS.blueGreen }]} />
                </View>
              </View>
              <View style={styles.breakdownItem}>
                <View style={styles.breakdownLeft}>
                  <Text style={styles.breakdownLabel}>Location Sharing</Text>
                  <Text style={styles.breakdownValue}>15 pts</Text>
                </View>
                <View style={styles.breakdownBar}>
                  <View style={[styles.breakdownFill, { width: '75%', backgroundColor: COLORS.skyBlueLight }]} />
                </View>
              </View>
              <View style={styles.breakdownItem}>
                <View style={styles.breakdownLeft}>
                  <Text style={styles.breakdownLabel}>Medical Information</Text>
                  <Text style={styles.breakdownValue}>18 pts</Text>
                </View>
                <View style={styles.breakdownBar}>
                  <View style={[styles.breakdownFill, { width: '90%', backgroundColor: COLORS.amberFlame }]} />
                </View>
              </View>
              <View style={styles.breakdownItem}>
                <View style={styles.breakdownLeft}>
                  <Text style={styles.breakdownLabel}>Community Involvement</Text>
                  <Text style={styles.breakdownValue}>25 pts</Text>
                </View>
                <View style={styles.breakdownBar}>
                  <View style={[styles.breakdownFill, { width: '100%', backgroundColor: COLORS.princetonOrange }]} />
                </View>
              </View>
            </View>

            {/* Recommendations */}
            <View style={styles.reportSection2}>
              <Text style={styles.reportSectionTitle}>Recommendations</Text>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationIcon}>💡</Text>
                <Text style={styles.recommendationText}>Update your medical information for better emergency response</Text>
              </View>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationIcon}>💡</Text>
                <Text style={styles.recommendationText}>Check in with your emergency contacts monthly</Text>
              </View>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationIcon}>💡</Text>
                <Text style={styles.recommendationText}>Share more safety alerts with your community</Text>
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={styles.reportModalButtons}>
            <TouchableOpacity
              style={styles.reportCloseButton}
              onPress={() => setReportModalVisible(false)}
            >
              <Text style={styles.reportCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

function getScoreMessage(score: number) {
  if (score >= 80) return 'Excellent Safety Profile';
  if (score >= 60) return 'Good Safety Setup';
  return 'Needs Improvement';
}

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
  scoreCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  scoreGradient: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scoreNumber: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.white,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
    opacity: 0.9,
    marginTop: -2,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreMessage: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 6,
  },
  scoreDetails: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.white,
    opacity: 0.85,
    lineHeight: 16,
  },
  progressSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#efefef',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.blueGreen,
  },
  customProgressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  customProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressNote: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.deepSpaceBlue,
    opacity: 0.6,
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#efefef',
  },
  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.deepSpaceBlue,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 12,
  },
  tipsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  tipsSubtext: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.deepSpaceBlue,
    opacity: 0.6,
    marginBottom: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  tipLeft: {
    marginRight: 10,
  },
  tipIcon: {
    fontSize: 24,
  },
  tipContent: {
    flex: 1,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
    flex: 1,
  },
  completedBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.blueGreen,
    marginLeft: 6,
  },
  tipDescription: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.deepSpaceBlue,
    opacity: 0.65,
    marginBottom: 4,
    lineHeight: 15,
  },
  tipAction: {
    paddingVertical: 4,
    marginLeft: 8,
  },
  tipActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.blueGreen,
  },
  reportSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  reportCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.skyBlueLight,
  },
  reportIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
    marginBottom: 4,
  },
  reportText: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.deepSpaceBlue,
    opacity: 0.65,
    marginBottom: 10,
    lineHeight: 16,
  },
  reportButton: {
    paddingVertical: 8,
  },
  reportButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.blueGreen,
  },
  reportModalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  reportModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  reportModalCloseText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
  },
  reportModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
  },
  reportModalContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  reportSummary: {
    marginBottom: 24,
  },
  reportPeriod: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.deepSpaceBlue,
    opacity: 0.6,
    marginBottom: 12,
  },
  reportSummaryCard: {
    backgroundColor: COLORS.blueGreen,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  reportSummaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  reportSummaryScore: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  reportSummaryMessage: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  reportSection2: {
    marginBottom: 24,
  },
  reportSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
    color: COLORS.blueGreen,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.deepSpaceBlue,
    opacity: 0.6,
  },
  breakdownItem: {
    marginBottom: 14,
  },
  breakdownLeft: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.blueGreen,
  },
  breakdownBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 4,
  },
  recommendationItem: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff8f0',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  recommendationIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  recommendationText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.deepSpaceBlue,
    lineHeight: 16,
  },
  reportModalButtons: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#e0e0e0',
  },
  reportCloseButton: {
    paddingVertical: 12,
    backgroundColor: COLORS.blueGreen,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportCloseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default SafetyScoreScreen;
