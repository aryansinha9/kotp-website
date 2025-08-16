// FINAL, CORRECTED VERSION of src/Entities/MediaItem.js

import { supabase } from '@/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const MediaItemAPI = {
  // For the public Moments page. The .limit() has been REMOVED.
  getGalleries: async () => {
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        id,
        name,
        media_items (
          id,
          storage_path,
          type
        )
      `)
      .eq('status', 'completed')
      .not('media_items', 'is', null);

    if (error) {
      console.error('Error fetching galleries:', error);
      return [];
    }
    return data;
  },

  // For the dedicated Gallery Page
  getGalleryByTournamentId: async (tournamentId) => {
    const { data, error } = await supabase
      .from('tournaments')
      .select(`id, name, media_items(id, storage_path, type)`)
      .eq('id', tournamentId)
      .single();
    if (error) { console.error('Error fetching single gallery:', error); return null; }
    return data;
  },

  // For the Admin Dashboard
  upload: async (file, tournamentId) => {
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `public/${tournamentId}/${uniqueFileName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tournament-gallery').upload(filePath, file);
    if (uploadError) { return { data: null, error: uploadError }; }
    const { data: dbData, error: dbError } = await supabase
      .from('media_items').insert([{ 
        tournament_id: tournamentId,
        storage_path: uploadData.path,
        title: file.name,
        type: file.type.startsWith('image') ? 'image' : 'video',
      }]).select().single();
    if (dbError) {
      await supabase.storage.from('tournament-gallery').remove([filePath]);
      return { data: null, error: dbError };
    }
    return { data: dbData, error: null };
  },
};

export const MediaItem = MediaItemAPI;