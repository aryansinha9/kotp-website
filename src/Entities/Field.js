import { supabase } from '@/supabaseClient';

const FieldAPI = {
  list: async () => {
    const { data, error } = await supabase.from('fields').select('*').order('name');
    if (error) { console.error('Error fetching fields:', error); return []; }
    return data;
  },

  filter: async (filters = {}) => {
    let query = supabase.from('fields').select('*').order('name');
    for (const key in filters) { query = query.eq(key, filters[key]); }
    const { data, error } = await query;
    if (error) { console.error('Error fetching fields:', error); return []; }
    return data;
  },

  create: async (fieldData) => {
    const { data, error } = await supabase.from('fields').insert([fieldData]).select().single();
    if (error) { console.error('Error creating field:', error); return { error }; }
    return { data };
  },

  delete: async (id) => {
    const { error } = await supabase.from('fields').delete().eq('id', id);
    if (error) { console.error('Error deleting field:', error); return { error }; }
    return { success: true };
  }
};

export const Field = FieldAPI;
