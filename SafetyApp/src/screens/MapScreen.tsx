import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useAuth } from '../context/AuthContext';
import { sosService } from '../services/sosService';
import { locationPermissionsService } from '../services/locationPermissionsService';
import { communityService } from '../services/communityService';
import { SOSAlert, CommunityPost } from '../types';
import { COLORS } from '../utils/colors';

const MapScreen: React.FC = () => {
  const { state } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [nearbyAlerts, setNearbyAlerts] = useState<SOSAlert[]>([]);
  const [nearbyPosts, setNearbyPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      setLoading(true);

      // Get current location with better error handling
      let location;
      try {
        location = await locationPermissionsService.getCurrentLocation();
      } catch (locError) {
        console.warn('Using default location (Nairobi, Kenya)');
        // Use default location if permission denied
        location = {
          latitude: -1.286389,
          longitude: 36.817221,
        };
      }
      
      setCurrentLocation(location);

      // Get nearby alerts
      try {
        const alerts = await sosService.getNearbyAlerts(location.latitude, location.longitude, 10);
        setNearbyAlerts(alerts);
      } catch (error) {
        console.warn('Could not fetch alerts:', error);
        setNearbyAlerts([]);
      }

      // Get nearby posts
      try {
        const posts = await communityService.getNearbyPosts(location.latitude, location.longitude, 10);
        setNearbyPosts(posts);
      } catch (error) {
        console.warn('Could not fetch posts:', error);
        setNearbyPosts([]);
      }
    } catch (error) {
      console.error('Error fetching map data:', error);
      // Still show map with default location
      setCurrentLocation({
        latitude: -1.286389,
        longitude: 36.817221,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.princetonOrange} />
      </View>
    );
  }

  if (!currentLocation) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unable to load map</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {/* Current Location Marker */}
        <Marker
          coordinate={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          }}
          title="You are here"
          pinColor={COLORS.skyBlueLight}
        />

        {/* Nearby Alerts Markers */}
        {nearbyAlerts.map((alert) => (
          <Marker
            key={alert.id}
            coordinate={{
              latitude: alert.latitude,
              longitude: alert.longitude,
            }}
            title={`${alert.incidentType} Alert`}
            description={alert.address}
            pinColor={COLORS.princetonOrange}
            onPress={() => {
              setSelectedMarker({ type: 'alert', data: alert });
              setShowDetailsModal(true);
            }}
          />
        ))}

        {/* Nearby Posts Markers */}
        {nearbyPosts.map((post) => (
          <Marker
            key={post.id}
            coordinate={{
              latitude: post.latitude,
              longitude: post.longitude,
            }}
            title={post.userName}
            description={post.content.substring(0, 50)}
            pinColor={COLORS.amberFlame}
            onPress={() => {
              setSelectedMarker({ type: 'post', data: post });
              setShowDetailsModal(true);
            }}
          />
        ))}
      </MapView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.skyBlueLight }]} />
          <Text style={styles.legendText}>You</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.princetonOrange }]} />
          <Text style={styles.legendText}>Alert</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.amberFlame }]} />
          <Text style={styles.legendText}>Post</Text>
        </View>
      </View>

      {/* Refresh Button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={fetchMapData}
      >
        <Text style={styles.refreshButtonText}>⟳</Text>
      </TouchableOpacity>

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Details</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedMarker?.type === 'alert' && (
              <View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type:</Text>
                  <Text style={styles.detailValue}>{selectedMarker.data.incidentType}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={styles.detailValue}>{selectedMarker.data.status}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailValue}>{selectedMarker.data.address}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Time:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedMarker.data.createdAt).toLocaleString()}
                  </Text>
                </View>
                {selectedMarker.data.description && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Description:</Text>
                    <Text style={styles.detailValue}>{selectedMarker.data.description}</Text>
                  </View>
                )}
              </View>
            )}

            {selectedMarker?.type === 'post' && (
              <View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Author:</Text>
                  <Text style={styles.detailValue}>{selectedMarker.data.userName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Content:</Text>
                  <Text style={styles.detailValue}>{selectedMarker.data.content}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailValue}>
                    {selectedMarker.data.latitude.toFixed(4)}, {selectedMarker.data.longitude.toFixed(4)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Time:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedMarker.data.createdAt).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Likes:</Text>
                  <Text style={styles.detailValue}>{selectedMarker.data.likes}</Text>
                </View>
              </View>
            )}
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
  map: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.deepSpaceBlue,
  },
  legend: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: COLORS.deepSpaceBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.deepSpaceBlue,
    fontWeight: '500',
  },
  refreshButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: COLORS.princetonOrange,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.princetonOrange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  refreshButtonText: {
    color: COLORS.white,
    fontSize: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
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
  detailRow: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.skyBlueLight,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.blueGreen,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.deepSpaceBlue,
  },
});

export default MapScreen;
