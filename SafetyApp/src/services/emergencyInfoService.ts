import { supabase } from './supabaseClient';
import { PersonalEmergencyInfo } from '../types';

export const emergencyInfoService = {
  // Save or update emergency info
  async saveEmergencyInfo(
    userId: string,
    medicalConditions?: string,
    allergies?: string,
    bloodType?: string,
    emergencyInsurance?: string,
    insuranceNumber?: string,
    doctorName?: string,
    doctorPhone?: string
  ): Promise<PersonalEmergencyInfo> {
    // Check if record exists
    const { data: existingData } = await supabase
      .from('personal_emergency_info')
      .select()
      .eq('user_id', userId)
      .single();

    let result;
    let error;

    if (existingData) {
      // Update existing
      const response = await supabase
        .from('personal_emergency_info')
        .update({
          medical_conditions: medicalConditions,
          allergies,
          blood_type: bloodType,
          emergency_insurance: emergencyInsurance,
          insurance_number: insuranceNumber,
          doctor_name: doctorName,
          doctor_phone: doctorPhone,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();
      result = response.data;
      error = response.error;
    } else {
      // Insert new
      const response = await supabase
        .from('personal_emergency_info')
        .insert([
          {
            user_id: userId,
            medical_conditions: medicalConditions,
            allergies,
            blood_type: bloodType,
            emergency_insurance: emergencyInsurance,
            insurance_number: insuranceNumber,
            doctor_name: doctorName,
            doctor_phone: doctorPhone,
          },
        ])
        .select()
        .single();
      result = response.data;
      error = response.error;
    }

    if (error) throw error;

    return {
      id: result.id,
      userId: result.user_id,
      medicalConditions: result.medical_conditions,
      allergies: result.allergies,
      bloodType: result.blood_type,
      emergencyInsurance: result.emergency_insurance,
      insuranceNumber: result.insurance_number,
      doctorName: result.doctor_name,
      doctorPhone: result.doctor_phone,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  },

  // Get emergency info
  async getEmergencyInfo(userId: string): Promise<PersonalEmergencyInfo | null> {
    const { data, error } = await supabase
      .from('personal_emergency_info')
      .select()
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found

    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      medicalConditions: data.medical_conditions,
      allergies: data.allergies,
      bloodType: data.blood_type,
      emergencyInsurance: data.emergency_insurance,
      insuranceNumber: data.insurance_number,
      doctorName: data.doctor_name,
      doctorPhone: data.doctor_phone,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  // Delete emergency info
  async deleteEmergencyInfo(userId: string): Promise<void> {
    const { error } = await supabase.from('personal_emergency_info').delete().eq('user_id', userId);

    if (error) throw error;
  },
};
