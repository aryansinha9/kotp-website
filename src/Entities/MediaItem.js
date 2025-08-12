// REPLACE THE ENTIRE CONTENTS OF: src/Entities/MediaItem.js

import { supabase } from '@/supabaseClient';

// Helper function to parse the sortBy string
const parseSortBy = (sortBy) => {
  const isDescending = sortBy.startsWith('-');
  const columnName = isDescending ? sortBy.substring(1) : sortBy;
  return { columnName, ascending: !isDescending };
};

const MediaItemAPI = {
  filter: async (filters = {}, sortBy = 'created_at', limit) => {
    const { columnName, ascending } = parseSortBy(sortBy);
    let query = supabase.from('media_items').select('*');

    for (const key in filters) {
      query = query.eq(key, filters[key]);
    }

    query = query.order(columnName, { ascending });

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

  list: async (sortBy = 'created_at') => {
    const { columnName, ascending } = parseSortBy(sortBy);
    let query = supabase
      .from('media_items')
      .select('*')
      .order(columnName, { ascending });
    
    const { data, error } = await query;
    if (error) {
        console.error('Error fetching all media items:', error);
        return [];
    }
    return data;
  }
};

export const MediaItem = MediaItemAPI;