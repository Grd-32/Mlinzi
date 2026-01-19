import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { communityService } from '../services/communityService';
import { locationPermissionsService } from '../services/locationPermissionsService';
import { Community, CommunityPost } from '../types';
import { COLORS } from '../utils/colors';

const CommunityScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { state } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'communities' | 'posts'>('communities');
  const [modalVisible, setModalVisible] = useState(false);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [postData, setPostData] = useState({
    content: '',
    isAnonymous: false,
  });

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    if (!state.user) return;
    try {
      setLoading(true);

      // Get user location
      const location = await locationPermissionsService.getCurrentLocation();

      // Get nearby communities
      const nearbyCommunities = await communityService.getNearbyCommunities(
        location.latitude,
        location.longitude,
        15
      );
      setCommunities(nearbyCommunities);

      // Get nearby posts
      const nearbyPosts = await communityService.getNearbyPosts(
        location.latitude,
        location.longitude,
        15
      );
      setPosts(nearbyPosts);
    } catch (error) {
      console.error('Error fetching community data:', error);
      Alert.alert('Error', 'Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async () => {
    if (!state.user) return;

    if (!formData.name) {
      Alert.alert('Validation Error', 'Please enter a community name');
      return;
    }

    try {
      const location = await locationPermissionsService.getCurrentLocation();

      const newCommunity = await communityService.createCommunity(
        formData.name,
        formData.description,
        location.latitude,
        location.longitude,
        5, // 5km radius
        state.user.id
      );

      // Auto-join the community
      await communityService.joinCommunity(state.user.id, newCommunity.id);

      setCommunities([...communities, newCommunity]);
      setModalVisible(false);
      setFormData({ name: '', description: '' });
      Alert.alert('Success', 'Community created and you have joined it');
    } catch (error) {
      console.error('Error creating community:', error);
      Alert.alert('Error', 'Failed to create community');
    }
  };

  const handleCreatePost = async () => {
    if (!state.user || !postData.content) {
      Alert.alert('Validation Error', 'Please enter post content');
      return;
    }

    try {
      const location = await locationPermissionsService.getCurrentLocation();

      const newPost = await communityService.createCommunityPost(
        communities[0]?.id || '', // Use first community or empty
        state.user.id,
        state.user.firstName || 'User',
        postData.content,
        location.latitude,
        location.longitude,
        undefined,
        postData.isAnonymous
      );

      setPosts([newPost, ...posts]);
      setPostModalVisible(false);
      setPostData({ content: '', isAnonymous: false });
      Alert.alert('Success', 'Post created');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!state.user) return;

    try {
      await communityService.joinCommunity(state.user.id, communityId);
      Alert.alert('Success', 'You have joined this community');
      fetchCommunityData();
    } catch (error) {
      console.error('Error joining community:', error);
      Alert.alert('Error', 'Failed to join community');
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await communityService.likePost(postId);
      setPosts(
        posts.map((post) =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleOpenComments = async (postId: string) => {
    try {

      setSelectedPostId(postId);
      const comments = await communityService.getPostComments(postId);
      setPostComments(comments);
      setCommentModalVisible(true);
    } catch (error) {
      console.error('Error loading comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    }
  };

  const handleAddComment = async () => {
    if (!state.user || !selectedPostId || !commentText.trim()) {
      Alert.alert('Validation Error', 'Please enter a comment');
      return;
    }

    try {
      const newComment = await communityService.addCommentToPost(
        selectedPostId,
        state.user.id,
        state.user.firstName || 'User',
        commentText
      );

      setPostComments([...postComments, newComment]);
      setPosts(
        posts.map((post) =>
          post.id === selectedPostId ? { ...post, comments: post.comments + 1 } : post
        )
      );

      setCommentText('');
      Alert.alert('Success', 'Comment posted');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.deepSpaceBlue, COLORS.blueGreen]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Community</Text>
        <Text style={styles.headerSubtitle}>Connect with neighbors for safety</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'communities' && styles.tabActive]}
          onPress={() => setActiveTab('communities')}
        >
          <Text style={[styles.tabText, activeTab === 'communities' && styles.tabTextActive]}>
            Communities
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
            Posts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Communities Tab */}
      {activeTab === 'communities' && (
        <View style={styles.content}>
          <FlatList
            data={communities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.communityCard}>
                <View style={styles.communityInfo}>
                  <Text style={styles.communityName}>{item.name}</Text>
                  <Text style={styles.communityDesc}>{item.description}</Text>
                  <Text style={styles.communityMembers}>👥 {item.memberCount} members</Text>
                </View>
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => handleJoinCommunity(item.id)}
                >
                  <Text style={styles.joinButtonText}>Join</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🏘️</Text>
                <Text style={styles.emptyStateTitle}>No Communities Nearby</Text>
                <Text style={styles.emptyStateText}>Create one to get started</Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <View style={styles.content}>
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.postCard}>
                <View style={styles.postHeader}>
                  <Text style={styles.postAuthor}>{item.userName}</Text>
                  <Text style={styles.postTime}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.postContent}>{item.content}</Text>
                <View style={styles.postFooter}>
                  <TouchableOpacity
                    onPress={() => handleLikePost(item.id)}
                    style={styles.postAction}
                  >
                    <Text style={styles.postActionText}>❤️ Like ({item.likes})</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleOpenComments(item.id)}
                    style={styles.postAction}
                  >
                    <Text style={styles.postActionText}>💬 Reply ({item.comments})</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postAction}>
                    <Text style={styles.postActionText}>👍 ({item.likes || 0})</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postAction}>
                    <Text style={styles.postActionText}>😂 ({Math.floor(Math.random() * 5)})</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📝</Text>
                <Text style={styles.emptyStateTitle}>No Posts Yet</Text>
                <Text style={styles.emptyStateText}>Be the first to share a safety message</Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}

      {/* Add Buttons */}
      <View style={styles.bottomButtons}>
        {activeTab === 'communities' && (
          <TouchableOpacity
            style={[styles.addButton, styles.addButtonPrimary]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Create Community</Text>
          </TouchableOpacity>
        )}
        {activeTab === 'posts' && (
          <TouchableOpacity
            style={[styles.addButton, styles.addButtonPrimary]}
            onPress={() => setPostModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Share Post</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Community Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Community</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Community Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Westlands Safety Group"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Describe your community"
                multiline
                numberOfLines={3}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleCreateCommunity}
            >
              <Text style={styles.modalSaveButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Post Modal */}
      <Modal
        visible={postModalVisible}
        animationType="slide"
        onRequestClose={() => setPostModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setPostModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Post</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message *</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Share a safety message..."
                multiline
                numberOfLines={4}
                value={postData.content}
                onChangeText={(text) => setPostData({ ...postData, content: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity
              style={[styles.checkboxContainer, postData.isAnonymous && styles.checkboxContainerChecked]}
              onPress={() => setPostData({ ...postData, isAnonymous: !postData.isAnonymous })}
            >
              <View style={[styles.checkbox, postData.isAnonymous && styles.checkboxChecked]} />
              <Text style={styles.checkboxLabel}>Post anonymously</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setPostModalVisible(false)}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleCreatePost}
            >
              <Text style={styles.modalSaveButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Comments Modal */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Comments</Text>
            <View style={{ width: 30 }} />
          </View>

          <View style={styles.commentsListContainer}>
            <FlatList
              data={postComments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Text style={styles.commentAuthor}>{item.userName}</Text>
                  <Text style={styles.commentContent}>{item.content}</Text>
                  <Text style={styles.commentTime}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyCommentsState}>
                  <Text style={styles.emptyCommentsText}>No comments yet</Text>
                </View>
              }
            />
          </View>

          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
              placeholderTextColor="#9CA3AF"
              multiline
            />
            <TouchableOpacity
              style={styles.commentSubmitButton}
              onPress={handleAddComment}
            >
              <Text style={styles.commentSubmitButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.skyBlueLight,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.skyBlueLight,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.princetonOrange,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.mediumGray,
  },
  tabTextActive: {
    color: COLORS.princetonOrange,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  communityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.skyBlueLight,
    shadowColor: COLORS.deepSpaceBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  communityInfo: {
    flex: 1,
    marginRight: 12,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.deepSpaceBlue,
    marginBottom: 4,
  },
  communityDesc: {
    fontSize: 13,
    color: COLORS.mediumGray,
    marginBottom: 6,
  },
  communityMembers: {
    fontSize: 12,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
  joinButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.princetonOrange,
    shadowColor: COLORS.princetonOrange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  joinButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 12,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  postTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  postContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  postAction: {
    paddingVertical: 4,
  },
  postActionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonPrimary: {
    backgroundColor: '#EF4444',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkboxContainerChecked: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  commentsListContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  commentItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.deepSpaceBlue,
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.deepSpaceBlue,
    lineHeight: 16,
    marginBottom: 6,
  },
  commentTime: {
    fontSize: 10,
    fontWeight: '400',
    color: COLORS.deepSpaceBlue,
    opacity: 0.5,
  },
  emptyCommentsState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyCommentsText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.deepSpaceBlue,
    opacity: 0.6,
  },
  commentInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    color: '#1F2937',
    maxHeight: 80,
  },
  commentSubmitButton: {
    backgroundColor: COLORS.princetonOrange,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentSubmitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default CommunityScreen;
