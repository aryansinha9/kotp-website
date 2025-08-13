import { supabase } from '@/supabaseClient';

const FeaturedReelAPI = {
  // Function to get a list of all submitted reel entries for the admin dashboard
  list: async () => {
    const { data, error } = await supabase
      .from('featured_reels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured reels:', error);
      return [];
    }
    return data;
  },

  // Function to create a new reel entry from the HTML embed code
  create: async (reelData) => {
    // Expects reelData to be an object like { embed_html: "<code>" }
    const { data, error } = await supabase
      .from('featured_reels')
      .insert([reelData])
      .select()
      .single();

    if (error) {
      console.error('Error creating featured reel:', error);
      return { data: null, error };
    }
    return { data, error: null };
  },

  getActive: async () => {
    const { data, error } = await supabase
      .from('featured_reels')
      .select('id, embed_html')
      .eq('is_active', true)
      .not('embed_html', 'is', null)
      .order('created_at', { ascending: false });

    if (error) { 
      console.error('Error fetching active reels:', error); 
      return []; 
    }
    return data;
  },

  deleteById: async (id) => {
  const { error } = await supabase
    .from('featured_reels')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting featured reel:', error);
    return { error };
  }
  return { error: null };
},
};

export const FeaturedReel = FeaturedReelAPI;