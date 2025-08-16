// PASTE THIS CODE INTO: src/Entities/YouTubeVideo.js

import { supabase } from '@/supabaseClient';

const YouTubeVideoAPI = {
  // Get all videos for the admin dashboard
  list: async () => {
    const { data, error } = await supabase
      .from('youtube_videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { console.error('Error listing YouTube videos:', error); return []; }
    return data;
  },

  // Get only the one featured video for the public Moments page
  getFeatured: async () => {
    const { data, error } = await supabase
      .from('youtube_videos')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(1)
      .single(); // .single() is important for getting one object

    if (error) { console.error('Error fetching featured video:', error); return null; }
    return data;
  },

  // Create a new video entry from a URL
  create: async (videoData) => {
    const { data, error } = await supabase
      .from('youtube_videos').insert([videoData]).select().single();
    if (error) { return { data: null, error }; }
    return { data, error: null };
  },
  
  // Delete a video by its ID
  deleteById: async (id) => {
    const { error } = await supabase.from('youtube_videos').delete().eq('id', id);
    if (error) { return { error }; }
    return { error: null };
  },

  // Set a video as the featured one
  setFeatured: async (videoId) => {
    // This is a transaction: it does two database operations at once.
    // 1. It sets is_featured = false for ALL videos.
    // 2. It then sets is_featured = true for ONLY the selected video.
    const { error } = await supabase.rpc('set_featured_video', {
      featured_id: videoId
    });
    
    if (error) { console.error('Error setting featured video:', error); return { error }; }
    return { error: null };
  }
};

export const YouTubeVideo = YouTubeVideoAPI;