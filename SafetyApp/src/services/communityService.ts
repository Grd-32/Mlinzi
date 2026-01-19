import { supabase } from './supabaseClient';
import { CommunityPost, Community, CommunityMembership } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const communityService = {
  // Create community
  async createCommunity(
    name: string,
    description: string,
    latitude: number,
    longitude: number,
    radius: number,
    createdBy: string
  ): Promise<Community> {
    try {
      if (!createdBy) {
        throw new Error('User ID is required to create a community');
      }

      const { data, error } = await supabase
        .from('communities')
        .insert([
          {
            name,
            description,
            latitude,
            longitude,
            radius,
            created_by: createdBy,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating community:', error);
        if (error.code === '23503') {
          throw new Error('User record not found. Please log out and log in again.');
        }
        throw new Error(error.message || 'Failed to create community');
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius,
        memberCount: 1,
        createdBy: data.created_by,
        createdAt: data.created_at,
      };
    } catch (err: any) {
      console.error('Error in createCommunity:', err);
      throw err;
    }
  },

  // Get communities near user
  async getNearbyCommunities(latitude: number, longitude: number, radiusKm: number = 10): Promise<Community[]> {
    const { data, error } = await supabase.from('communities').select('*');

    if (error) throw error;

    // Filter communities within radius on client side
    return data
      .filter((community) => {
        const distance = calculateDistance(latitude, longitude, community.latitude, community.longitude);
        return distance <= radiusKm;
      })
      .map((community) => ({
        id: community.id,
        name: community.name,
        description: community.description,
        latitude: community.latitude,
        longitude: community.longitude,
        radius: community.radius,
        memberCount: community.member_count || 0,
        createdBy: community.created_by,
        createdAt: community.created_at,
      }));
  },

  // Get community by ID
  async getCommunity(communityId: string): Promise<Community> {
    const { data, error } = await supabase.from('communities').select().eq('id', communityId).single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      radius: data.radius,
      memberCount: data.member_count || 0,
      createdBy: data.created_by,
      createdAt: data.created_at,
    };
  },

  // Join community
  async joinCommunity(userId: string, communityId: string): Promise<CommunityMembership> {
    const { data, error } = await supabase
      .from('community_memberships')
      .insert([
        {
          user_id: userId,
          community_id: communityId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      communityId: data.community_id,
      joinedAt: data.joined_at,
    };
  },

  // Leave community
  async leaveCommunity(userId: string, communityId: string): Promise<void> {
    const { error } = await supabase
      .from('community_memberships')
      .delete()
      .eq('user_id', userId)
      .eq('community_id', communityId);

    if (error) throw error;
  },

  // Get user's communities
  async getUserCommunities(userId: string): Promise<Community[]> {
    const { data: membershipData, error: membershipError } = await supabase
      .from('community_memberships')
      .select('community_id')
      .eq('user_id', userId);

    if (membershipError) throw membershipError;

    const communityIds = membershipData.map((m) => m.community_id);
    if (communityIds.length === 0) return [];

    const { data, error } = await supabase.from('communities').select().in('id', communityIds);

    if (error) throw error;

    return data.map((community) => ({
      id: community.id,
      name: community.name,
      description: community.description,
      latitude: community.latitude,
      longitude: community.longitude,
      radius: community.radius,
      memberCount: community.member_count || 0,
      createdBy: community.created_by,
      createdAt: community.created_at,
    }));
  },

  // Create community post
  async createCommunityPost(
    communityId: string,
    userId: string,
    userName: string,
    content: string,
    latitude: number,
    longitude: number,
    mediaUrls?: string[],
    isAnonymous?: boolean
  ): Promise<CommunityPost> {
    try {
      if (!userId) {
        throw new Error('User ID is required to create a post');
      }

      if (!communityId) {
        throw new Error('Community ID is required to create a post');
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert([
          {
            community_id: communityId,
            user_id: userId,
            user_name: userName,
            content,
            latitude,
            longitude,
            media_urls: mediaUrls,
            is_anonymous: isAnonymous,
            likes: 0,
            comments: 0,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating post:', error);
        if (error.code === '23503') {
          throw new Error('User record not found. Please log out and log in again.');
        }
        throw new Error(error.message || 'Failed to create post');
      }

      return {
        id: data.id,
        communityId: data.community_id,
        userId: data.user_id,
        userName: data.user_name,
        content: data.content,
        latitude: data.latitude,
        longitude: data.longitude,
        mediaUrls: data.media_urls,
        likes: data.likes,
        comments: data.comments,
        isAnonymous: data.is_anonymous,
        createdAt: data.created_at,
      };
    } catch (err: any) {
      console.error('Error in createCommunityPost:', err);
      throw err;
    }
  },

  // Get community posts
  async getCommunityPosts(communityId: string, limit = 50): Promise<CommunityPost[]> {
    const { data, error } = await supabase
      .from('community_posts')
      .select()
      .eq('community_id', communityId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map((post) => ({
      id: post.id,
      communityId: post.community_id,
      userId: post.user_id,
      userName: post.is_anonymous ? 'Anonymous' : post.user_name,
      content: post.content,
      latitude: post.latitude,
      longitude: post.longitude,
      mediaUrls: post.media_urls,
      likes: post.likes,
      comments: post.comments,
      isAnonymous: post.is_anonymous,
      createdAt: post.created_at,
    }));
  },

  // Like community post
  async likePost(postId: string): Promise<void> {
    const { data: post, error: fetchError } = await supabase
      .from('community_posts')
      .select('likes')
      .eq('id', postId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('community_posts')
      .update({ likes: (post?.likes || 0) + 1 })
      .eq('id', postId);

    if (error) throw error;
  },

  // Get nearby posts
  async getNearbyPosts(latitude: number, longitude: number, radiusKm: number = 5): Promise<CommunityPost[]> {
    const { data, error } = await supabase.from('community_posts').select();

    if (error) throw error;

    return data
      .filter((post) => {
        const distance = calculateDistance(latitude, longitude, post.latitude, post.longitude);
        return distance <= radiusKm;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((post) => ({
        id: post.id,
        communityId: post.community_id,
        userId: post.user_id,
        userName: post.is_anonymous ? 'Anonymous' : post.user_name,
        content: post.content,
        latitude: post.latitude,
        longitude: post.longitude,
        mediaUrls: post.media_urls,
        likes: post.likes,
        comments: post.comments,
        isAnonymous: post.is_anonymous,
        createdAt: post.created_at,
      }));
  },

  // Add comment to post
  async addCommentToPost(
    postId: string,
    userId: string,
    userName: string,
    content: string,
    isAnonymous?: boolean
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert([
          {
            post_id: postId,
            user_id: userId,
            user_name: userName,
            content,
            is_anonymous: isAnonymous,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update post comment count
      const { data: post, error: fetchError } = await supabase
        .from('community_posts')
        .select('comments')
        .eq('id', postId)
        .single();

      if (!fetchError && post) {
        await supabase
          .from('community_posts')
          .update({ comments: (post.comments || 0) + 1 })
          .eq('id', postId);
      }

      return {
        id: data.id,
        postId: data.post_id,
        userId: data.user_id,
        userName: data.is_anonymous ? 'Anonymous' : data.user_name,
        content: data.content,
        isAnonymous: data.is_anonymous,
        createdAt: data.created_at,
      };
    } catch (err: any) {
      console.error('Error adding comment:', err);
      throw err;
    }
  },

  // Get comments for post
  async getPostComments(postId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select()
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map((comment) => ({
        id: comment.id,
        postId: comment.post_id,
        userId: comment.user_id,
        userName: comment.is_anonymous ? 'Anonymous' : comment.user_name,
        content: comment.content,
        isAnonymous: comment.is_anonymous,
        createdAt: comment.created_at,
      }));
    } catch (err: any) {
      console.error('Error getting comments:', err);
      throw err;
    }
  },
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
