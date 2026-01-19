import { supabase } from './supabaseClient';
import { LocationShare } from '../types';

export const locationService = {
  // Create location share
  async createLocationShare(
    userId: string,
    sharedWithUserId: string,
    latitude: number,
    longitude: number,
    expiresAt?: Date
  ): Promise<LocationShare> {
    const { data, error } = await supabase
      .from('location_shares')
      .insert([
        {
          user_id: userId,
          shared_with_user_id: sharedWithUserId,
          latitude,
          longitude,
          expires_at: expiresAt?.toISOString(),
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      sharedWithUserId: data.shared_with_user_id,
      latitude: data.latitude,
      longitude: data.longitude,
      lastUpdated: data.last_updated,
      expiresAt: data.expires_at,
      isActive: data.is_active,
    };
  },

  // Update location share
  async updateLocationShare(
    shareId: string,
    latitude: number,
    longitude: number
  ): Promise<LocationShare> {
    const { data, error } = await supabase
      .from('location_shares')
      .update({
        latitude,
        longitude,
        last_updated: new Date().toISOString(),
      })
      .eq('id', shareId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      sharedWithUserId: data.shared_with_user_id,
      latitude: data.latitude,
      longitude: data.longitude,
      lastUpdated: data.last_updated,
      expiresAt: data.expires_at,
      isActive: data.is_active,
    };
  },

  // Get active location shares for user
  async getUserLocationShares(userId: string): Promise<LocationShare[]> {
    const { data, error } = await supabase
      .from('location_shares')
      .select()
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;

    return data.map((share) => ({
      id: share.id,
      userId: share.user_id,
      sharedWithUserId: share.shared_with_user_id,
      latitude: share.latitude,
      longitude: share.longitude,
      lastUpdated: share.last_updated,
      expiresAt: share.expires_at,
      isActive: share.is_active,
    }));
  },

  // Stop sharing location
  async stopLocationShare(shareId: string): Promise<void> {
    const { error } = await supabase
      .from('location_shares')
      .update({ is_active: false })
      .eq('id', shareId);

    if (error) throw error;
  },

  // Get shared locations with me
  async getSharedLocationsWithMe(userId: string): Promise<LocationShare[]> {
    const { data, error } = await supabase
      .from('location_shares')
      .select()
      .eq('shared_with_user_id', userId)
      .eq('is_active', true);

    if (error) throw error;

    return data.map((share) => ({
      id: share.id,
      userId: share.user_id,
      sharedWithUserId: share.shared_with_user_id,
      latitude: share.latitude,
      longitude: share.longitude,
      lastUpdated: share.last_updated,
      expiresAt: share.expires_at,
      isActive: share.is_active,
    }));
  },
};
