import { supabase } from './supabaseClient';
import { ChatMessage } from '../types';

export const chatService = {
  // Send message
  async sendMessage(alertId: string, senderId: string, senderName: string, message: string): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          alert_id: alertId,
          sender_id: senderId,
          sender_name: senderName,
          message,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      alertId: data.alert_id,
      senderId: data.sender_id,
      senderName: data.sender_name,
      message: data.message,
      timestamp: data.timestamp,
      isRead: data.is_read,
    };
  },

  // Get messages for alert
  async getAlertMessages(alertId: string, limit = 100): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select()
      .eq('alert_id', alertId)
      .order('timestamp', { ascending: true })
      .limit(limit);

    if (error) throw error;

    return data.map((msg) => ({
      id: msg.id,
      alertId: msg.alert_id,
      senderId: msg.sender_id,
      senderName: msg.sender_name,
      message: msg.message,
      timestamp: msg.timestamp,
      isRead: msg.is_read,
    }));
  },

  // Mark message as read
  async markMessageAsRead(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) throw error;
  },

  // Subscribe to messages for alert (real-time)
  subscribeToMessages(alertId: string, onMessage: (message: ChatMessage) => void) {
    return supabase
      .from(`chat_messages:alert_id=eq.${alertId}`)
      .on('*', (payload) => {
        if (payload.eventType === 'INSERT') {
          const data = payload.new as any;
          onMessage({
            id: data.id,
            alertId: data.alert_id,
            senderId: data.sender_id,
            senderName: data.sender_name,
            message: data.message,
            timestamp: data.timestamp,
            isRead: data.is_read,
          });
        }
      })
      .subscribe();
  },
};
