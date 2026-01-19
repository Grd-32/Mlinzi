import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { chatService } from '../services/chatService';
import { ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';

interface OperatorChatScreenProps {
  navigation: any;
  route: any;
}

const OperatorChatScreen: React.FC<OperatorChatScreenProps> = ({ route }) => {
  const { state } = useAuth();
  const alertId = route.params?.alertId;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!alertId) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const msgs = await chatService.getAlertMessages(alertId);
        setMessages(msgs);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to real-time messages
    const subscription = chatService.subscribeToMessages(alertId, (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [alertId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !state.user) return;

    setSending(true);
    try {
      const message = await chatService.sendMessage(
        alertId,
        state.user.id,
        state.user.firstName || 'User',
        newMessage
      );
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Operator Chat</Text>
        <Text style={styles.headerSubtitle}>Private conversation with responder</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isUserMessage = item.senderId === state.user?.id;
          return (
            <View style={[styles.messageContainer, isUserMessage && styles.userMessageContainer]}>
              <View style={[styles.messageBubble, isUserMessage && styles.userMessageBubble]}>
                {!isUserMessage && <Text style={styles.messageSender}>{item.senderName}</Text>}
                <Text style={[styles.messageText, isUserMessage && styles.userMessageText]}>
                  {item.message}
                </Text>
                <Text style={[styles.messageTime, isUserMessage && styles.userMessageTime]}>
                  {new Date(item.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.messagesContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No messages yet. Send the first message!</Text>
          </View>
        }
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
          editable={!sending}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || sending}
        >
          <Text style={styles.sendButtonText}>{sending ? '...' : '→'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  messagesContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userMessageBubble: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  messageSender: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
  userMessageTime: {
    color: '#fff',
    opacity: 0.7,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OperatorChatScreen;
