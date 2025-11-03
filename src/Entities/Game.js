// src/Entities/Game.js

import { supabase } from '@/supabaseClient';

const GameAPI = {
  /**
   * Fetches a list of games, optionally filtered by criteria.
   * @param {object} filters - e.g., { tournament_id: 123 }
   * @returns {Promise<Array>} A list of game objects.
   */
  filter: async (filters = {}) => {
    let query = supabase.from('games').select('*');

    Object.keys(filters).forEach(key => {
      query = query.eq(key, filters[key]);
    });

    const { data, error } = await query.order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching games:', error);
      return [];
    }
    return data;
  },

  /**
   * Creates a new game record.
   * @param {object} gameData - e.g., { tournament_id, team_a_id, team_b_id }
   * @returns {Promise<object>} The newly created game object.
   */
  create: async (gameData) => {
    const { data, error } = await supabase
      .from('games')
      .insert([gameData])
      .select()
      .single();

    if (error) {
      console.error('Error creating game:', error);
      return { data: null, error };
    }
    return { data, error: null };
  },

  /**
   * Updates an existing game record by its ID.
   * @param {number} id - The ID of the game to update.
   * @param {object} updates - The fields to update, e.g., { team_a_score: 3, status: 'LIVE' }
   * @returns {Promise<object>} The updated game object.
   */
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('games')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating game:', error);
      return { data: null, error };
    }
    return { data, error: null };
  },
};

export const Game = GameAPI;