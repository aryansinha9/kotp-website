// REPLACE THE CONTENTS OF: src/Entities/Tournament.js

import { supabase } from '@/supabaseClient';

// Helper function to parse the sortBy string
const parseSortBy = (sortBy) => {
  const isDescending = sortBy.startsWith('-');
  const columnName = isDescending ? sortBy.substring(1) : sortBy;
  return { columnName, ascending: !isDescending };
};

const TournamentAPI = {
  filter: async (sortBy = 'start_date', limit) => {
    const { columnName, ascending } = parseSortBy(sortBy);
    let query = supabase.from('tournaments').select('*');

    // No filters for now, but leaving the structure
    
    query = query.order(columnName, { ascending });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching tournaments:', error);
      return [];
    }
    return data;
  },

  list: async (sortBy = 'start_date') => {
    const { columnName, ascending } = parseSortBy(sortBy);
    let query = supabase
      .from('tournaments')
      .select('*')
      .order(columnName, { ascending });

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching all tournaments:', error);
      return [];
    }
    return data;
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching tournament with id ${id}:`, error);
      return null;
    }
    return data;
  }
};

export const Tournament = TournamentAPI;