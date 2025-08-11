// REPLACE THE CONTENTS OF: src/Entities/MediaItem.js

import { supabase } from '@/supabaseClient';

const MediaItemAPI = {
  // This is the existing filter function
  filter: async (filters, sortBy = 'created_at', limit) => {
    let query = supabase.from('media_items').select('*');

    for (const key in filters) {
      query = query.eq(key, filters[key]);
    }

    // Sort newest first
    query = query.order(sortBy, { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching media items:', error);
      return [];
    }

    return data;
  },

  // NEW FUNCTION: Fetch all media items
  list: async (sortBy = 'created_at') => {
    let query = supabase
      .from('media_items')
      .select('*')
      .order(sortBy, { ascending: false }); // Sort newest first
    
    const { data, error } = await query;
    
    if (error) {
        console.error('Error fetching all media items:', error);
        return [];
    }

    return data;
  }
};

export const MediaItem = MediaItemAPI;