import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Alert } from 'react-native';

const LOCATION_TASK_NAME = 'background-location-task';

export const locationPermissionsService = {
  // Request location permission
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  },

  // Request background location permission
  async requestBackgroundLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting background location permission:', error);
      return false;
    }
  },

  // Check if location services are enabled
  async checkLocationEnabled(): Promise<boolean> {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      return enabled;
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  },

  // Get current location
  async getCurrentLocation() {
    try {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        timestamp: coords.timestamp,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      throw error;
    }
  },

  // Reverse geocode address from coordinates
  async getAddressFromCoords(latitude: number, longitude: number): Promise<string> {
    try {
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addresses.length > 0) {
        const addr = addresses[0];
        return `${addr.street}, ${addr.city}, ${addr.region}`;
      }
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  },

  // Start background location tracking
  async startBackgroundLocationTracking(): Promise<void> {
    try {
      // Register background task
      TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
        if (error) {
          console.error('Background location error:', error);
          return;
        }
        if (data) {
          // Handle location data when app is in background
          const { locations } = data as any;
          const lastLocation = locations[locations.length - 1];
          // Emit event or update global state
          console.log('Background location update:', lastLocation);
        }
      });

      // Start location tracking
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 100, // Update every 100 meters
        timeInterval: 60000, // Update every 60 seconds
        foregroundService: {
          notificationTitle: 'Mlinzi is running',
          notificationBody: 'Your location is being tracked for your safety',
        },
      });
    } catch (error) {
      console.error('Error starting background location tracking:', error);
      throw error;
    }
  },

  // Stop background location tracking
  async stopBackgroundLocationTracking(): Promise<void> {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    } catch (error) {
      console.error('Error stopping background location tracking:', error);
      throw error;
    }
  },
};
