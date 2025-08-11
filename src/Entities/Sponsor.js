// REPLACE THE CONTENTS OF: src/Entities/Sponsor.js

import { supabase } from '@/supabaseClient';

const SponsorAPI = {
  filter: async (filters, sortBy = 'tier', limit) => {
    let query = supabase.from('sponsors').select('*');
    
    for (const key in filters) {
      query = query.eq(key, filters[key]);
    }

    query = query.order(sortBy, { ascending: true });
    
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

  // NEW FUNCTION: Fetch all sponsors, ordered by tier
  list: async (sortBy = 'tier') => {
    let query = supabase
      .from('sponsors')
      .select('*')
      .order(sortBy, { ascending: true });
    
    const { data, error } = await query;
    
    if (error) {
        console.error('Error fetching all sponsors:', error);
        return [];
    }

    return data;
  }
};

export const Sponsor = SponsorAPI;