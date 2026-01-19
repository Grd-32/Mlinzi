import { supabase } from './supabaseClient';
import { SOSAlert, SOSIncidentType } from '../types';

export const sosService = {
  // Create a new SOS alert
  async createSOSAlert(
    userId: string,
    incidentType: SOSIncidentType,
    latitude: number,
    longitude: number,
    address?: string,
    description?: string
  ): Promise<SOSAlert> {
    const { data, error } = await supabase
      .from('sos_alerts')
      .insert([
        {
          user_id: userId,
          incident_type: incidentType,
          latitude,
          longitude,
          address,
          description,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      incidentType: data.incident_type,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      description: data.description,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  // Get SOS alert by ID
  async getSOSAlert(alertId: string): Promise<SOSAlert> {
    const { data, error } = await supabase
      .from('sos_alerts')
      .select()
      .eq('id', alertId)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      incidentType: data.incident_type,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      description: data.description,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  // Get user's recent alerts
  async getUserAlerts(userId: string, limit = 20): Promise<SOSAlert[]> {
    const { data, error } = await supabase
      .from('sos_alerts')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map((alert) => ({
      id: alert.id,
      userId: alert.user_id,
      incidentType: alert.incident_type,
      latitude: alert.latitude,
      longitude: alert.longitude,
      address: alert.address,
      description: alert.description,
      status: alert.status,
      createdAt: alert.created_at,
      updatedAt: alert.updated_at,
    }));
  },

  // Update alert status
  async updateAlertStatus(alertId: string, status: string): Promise<SOSAlert> {
    const { data, error } = await supabase
      .from('sos_alerts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      incidentType: data.incident_type,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      description: data.description,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  // Notify emergency contacts
  async notifyEmergencyContacts(alertId: string, userId: string): Promise<void> {
    // Fetch emergency contacts
    const { data: contacts, error: contactError } = await supabase
      .from('emergency_contacts')
      .select()
      .eq('user_id', userId);

    if (contactError) throw contactError;

    // Send notification to each contact
    if (contacts && contacts.length > 0) {
      const { error: notifyError } = await supabase
        .from('notifications')
        .insert(
          contacts.map((contact) => ({
            contact_phone: contact.phone,
            alert_id: alertId,
            message: `Emergency SOS Alert! A loved one needs help. Check the app for details.`,
            type: 'sos_alert',
          }))
        );

      if (notifyError) console.error('Failed to send notifications:', notifyError);
    }
  },

  // Cancel SOS alert
  async cancelAlert(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('sos_alerts')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', alertId);

    if (error) throw error;
  },

  // Get nearby alerts (community safety)
  async getNearbyAlerts(latitude: number, longitude: number, radiusKm: number = 5): Promise<SOSAlert[]> {
    // Using PostgreSQL PostGIS would be ideal, but we'll use client-side filtering
    const { data, error } = await supabase
      .from('sos_alerts')
      .select()
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter alerts within radius
    return data
      .filter((alert) => {
        const distance = calculateDistance(latitude, longitude, alert.latitude, alert.longitude);
        return distance <= radiusKm;
      })
      .map((alert) => ({
        id: alert.id,
        userId: alert.user_id,
        incidentType: alert.incident_type,
        latitude: alert.latitude,
        longitude: alert.longitude,
        address: alert.address,
        description: alert.description,
        status: alert.status,
        createdAt: alert.created_at,
        updatedAt: alert.updated_at,
      }));
  },
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
