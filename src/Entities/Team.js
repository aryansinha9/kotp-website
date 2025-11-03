// src/Entities/Team.js

import { supabase } from '@/supabaseClient';

const TeamAPI = {
  /**
   * Fetches a list of teams, optionally filtered by specific criteria.
   * @param {object} filters - e.g., { tournament_id: 123 }
   * @returns {Promise<Array>} A list of team objects.
   */
  filter: async (filters = {}) => {
    let query = supabase.from('teams').select('*');

    Object.keys(filters).forEach(key => {
      query = query.eq(key, filters[key]);
    });

    const { data, error } = await query.order('name', { ascending: true });

    if (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
    return data;
  },

  /**
   * Creates a new team in the database.
   * @param {object} teamData - e.g., { name: 'Warriors', tournament_id: 123 }
   * @returns {Promise<object>} The newly created team object.
   */
  create: async (teamData) => {
    const { data, error } = await supabase
      .from('teams')
      .insert([teamData])
      .select()
      .single();

    if (error) {
      console.error('Error creating team:', error);
      return { data: null, error };
    }
    return { data, error: null };
  },
};

export const Team = TeamAPI;