import { supabase } from './supabaseClient';
import { EmergencyContact } from '../types';

export const emergencyContactService = {
  // Add emergency contact
  async addEmergencyContact(
    userId: string,
    name: string,
    phone: string,
    relationship?: string,
    isPrimary: boolean = false
  ): Promise<EmergencyContact> {
    try {
      if (!userId) {
        throw new Error('User ID is required to save a contact');
      }

      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert([
          {
            user_id: userId,
            name,
            phone,
            relationship,
            is_primary: isPrimary,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding contact:', error);
        
        // Handle specific error codes
        if (error.code === '23503') {
          throw new Error('User record not found. Please log out and log in again.');
        }
        if (error.code === '42501') {
          throw new Error('Permission denied. Please log out and log in again to refresh your session.');
        }
        
        throw new Error(error.message || 'Failed to save contact to database');
      }

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        phone: data.phone,
        relationship: data.relationship,
        isPrimary: data.is_primary,
        createdAt: data.created_at,
      };
    } catch (err: any) {
      console.error('Error in addEmergencyContact:', err);
      throw err;
    }
  },

  // Get user's emergency contacts
  async getUserEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select()
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });

    if (error) throw error;

    return data.map((contact) => ({
      id: contact.id,
      userId: contact.user_id,
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      isPrimary: contact.is_primary,
      createdAt: contact.created_at,
    }));
  },

  // Update emergency contact
  async updateEmergencyContact(
    contactId: string,
    name: string,
    phone: string,
    relationship?: string,
    isPrimary?: boolean
  ): Promise<EmergencyContact> {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .update({
        name,
        phone,
        relationship,
        ...(isPrimary !== undefined && { is_primary: isPrimary }),
      })
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      phone: data.phone,
      relationship: data.relationship,
      isPrimary: data.is_primary,
      createdAt: data.created_at,
    };
  },

  // Delete emergency contact
  async deleteEmergencyContact(contactId: string): Promise<void> {
    const { error } = await supabase.from('emergency_contacts').delete().eq('id', contactId);

    if (error) throw error;
  },

  // Set primary contact
  async setPrimaryContact(userId: string, contactId: string): Promise<void> {
    // First, unset all primary contacts for user
    await supabase.from('emergency_contacts').update({ is_primary: false }).eq('user_id', userId);

    // Then set the selected one as primary
    const { error } = await supabase.from('emergency_contacts').update({ is_primary: true }).eq('id', contactId);

    if (error) throw error;
  },

  // Alias for getUserEmergencyContacts (for backward compatibility)
  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    return this.getUserEmergencyContacts(userId);
  },
};
