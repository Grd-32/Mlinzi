import { supabase } from './supabaseClient';
import { SmartAlert } from '../types';

export const smartAlertService = {
  // Create a new alert (for community alerts feature)
  async createAlert(
    userId: string,
    title: string,
    description: string,
    alertType: 'security' | 'traffic' | 'weather' | 'community',
    severity: 'low' | 'medium' | 'high',
    latitude: number,
    longitude: number
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('smart_alerts')
        .insert([
          {
            user_id: userId,
            title,
            description,
            alert_type: alertType,
            severity,
            latitude,
            longitude,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description,
        alertType: data.alert_type,
        severity: data.severity,
        latitude: data.latitude,
        longitude: data.longitude,
        createdAt: data.created_at,
      };
    } catch (err: any) {
      console.error('Error creating alert:', err);
      throw err;
    }
  },

  // Create smart alert (location-based)
  async createSmartAlert(
    userId: string,
    locationName: string,
    latitude: number,
    longitude: number,
    radius: number,
    alertType: 'arrival' | 'departure',
    sharedWithUserIds: string[] = []
  ): Promise<SmartAlert> {
    const { data, error } = await supabase
      .from('smart_alerts')
      .insert([
        {
          user_id: userId,
          location_name: locationName,
          latitude,
          longitude,
          radius,
          alert_type: alertType,
          shared_with_user_ids: sharedWithUserIds,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      locationName: data.location_name,
      latitude: data.latitude,
      longitude: data.longitude,
      radius: data.radius,
      alertType: data.alert_type,
      sharedWithUserIds: data.shared_with_user_ids || [],
      isActive: data.is_active,
    };
  },

  // Get user's smart alerts
  async getUserSmartAlerts(userId: string): Promise<SmartAlert[]> {
    const { data, error } = await supabase
      .from('smart_alerts')
      .select()
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;

    return data.map((alert) => ({
      id: alert.id,
      userId: alert.user_id,
      locationName: alert.location_name,
      latitude: alert.latitude,
      longitude: alert.longitude,
      radius: alert.radius,
      alertType: alert.alert_type,
      sharedWithUserIds: alert.shared_with_user_ids || [],
      isActive: alert.is_active,
    }));
  },

  // Update smart alert
  async updateSmartAlert(
    alertId: string,
    locationName?: string,
    latitude?: number,
    longitude?: number,
    radius?: number,
    sharedWithUserIds?: string[]
  ): Promise<SmartAlert> {
    const updates: any = {};
    if (locationName) updates.location_name = locationName;
    if (latitude) updates.latitude = latitude;
    if (longitude) updates.longitude = longitude;
    if (radius) updates.radius = radius;
    if (sharedWithUserIds) updates.shared_with_user_ids = sharedWithUserIds;

    const { data, error } = await supabase
      .from('smart_alerts')
      .update(updates)
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      locationName: data.location_name,
      latitude: data.latitude,
      longitude: data.longitude,
      radius: data.radius,
      alertType: data.alert_type,
      sharedWithUserIds: data.shared_with_user_ids || [],
      isActive: data.is_active,
    };
  },

  // Deactivate smart alert
  async deactivateSmartAlert(alertId: string): Promise<void> {
    const { error } = await supabase.from('smart_alerts').update({ is_active: false }).eq('id', alertId);

    if (error) throw error;
  },

  // Check if user is within alert zone
  isUserInZone(userLat: number, userLon: number, alertLat: number, alertLon: number, radiusKm: number): boolean {
    const R = 6371; // Earth's radius in km
    const dLat = ((alertLat - userLat) * Math.PI) / 180;
    const dLon = ((alertLon - userLon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLat * Math.PI) / 180) * Math.cos((alertLat * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= radiusKm;
  },
};
