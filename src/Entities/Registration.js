// REPLACE THE CONTENTS OF: src/Entities/Registration.js

import { supabase } from '@/supabaseClient';

const RegistrationAPI = {
  // This is our existing create function for the form
  create: async (registrationData) => {
    const { data, error } = await supabase
      .from('registrations')
      .insert([registrationData])
      .select()
      .single();

    if (error) {
      console.error('Error creating registration:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  },

  // THIS IS THE NEW FUNCTION FOR THE ADMIN DASHBOARD
  // It fetches all registrations and the name of the tournament they belong to
  list: async () => {
    const { data, error } = await supabase
        .from('registrations')
        .select(`
            *,
            tournaments ( name )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching registrations:', error);
        return [];
    }

    return data;
  }
};

export const Registration = RegistrationAPI;