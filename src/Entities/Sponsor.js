// REPLACE THE ENTIRE CONTENTS OF: src/Entities/Sponsor.js

import { supabase } from '@/supabaseClient';

// Helper function to parse the sortBy string
const parseSortBy = (sortBy) => {
  const isDescending = sortBy.startsWith('-');
  const columnName = isDescending ? sortBy.substring(1) : sortBy;
  return { columnName, ascending: !isDescending };
};

const SponsorAPI = {
  filter: async (filters = {}, sortBy = 'tier', limit) => {
    const { columnName, ascending } = parseSortBy(sortBy);
    let query = supabase.from('sponsors').select('*');
    
    for (const key in filters) {
      query = query.eq(key, filters[key]);
    }

    query = query.order(columnName, { ascending });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching sponsors:', error);
      return [];
    }
    return data;
  },

  list: async (sortBy = 'tier') => {
    const { columnName, ascending } = parseSortBy(sortBy);
    let query = supabase
      .from('sponsors')
      .select('*')
      .order(columnName, { ascending });
    
    const { data, error } = await query;
    if (error) {
        console.error('Error fetching all sponsors:', error);
        return [];
    }
    return data;
  }
};

export const Sponsor = SponsorAPI;