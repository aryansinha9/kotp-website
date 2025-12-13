// src/api/base44Client.js
// Base44 API Client - Wrapper around Supabase for simplified entity operations

import { supabase } from '../supabaseClient';

/**
 * Base44 API Client
 * Provides a simplified interface for interacting with Supabase entities
 * Matches the Base44 API pattern used throughout the application
 */

// Entity CRUD operations wrapper
class EntityClient {
  constructor(tableName) {
    this.tableName = tableName;
  }

  /**
   * List all records from the entity table
   * @param {string} orderBy - Optional ordering (e.g., "-created_date" for descending)
   * @returns {Promise<Array>} Array of records
   */
  async list(orderBy = null) {
    try {
      let query = supabase.from(this.tableName).select('*');
      
      if (orderBy) {
        const isDescending = orderBy.startsWith('-');
        const column = isDescending ? orderBy.substring(1) : orderBy;
        query = query.order(column, { ascending: !isDescending });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error listing ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Filter records based on criteria
   * @param {Object} filters - Filter criteria (e.g., { status: "active" })
   * @param {string} orderBy - Optional ordering
   * @returns {Promise<Array>} Filtered array of records
   */
  async filter(filters = {}, orderBy = null) {
    try {
      let query = supabase.from(this.tableName).select('*');
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      // Apply ordering
      if (orderBy) {
        const isDescending = orderBy.startsWith('-');
        const column = isDescending ? orderBy.substring(1) : orderBy;
        query = query.order(column, { ascending: !isDescending });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error filtering ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Get a single record by ID
   * @param {string} id - Record ID
   * @returns {Promise<Object>} Single record
   */
  async get(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error getting ${this.tableName} record:`, error);
      throw error;
    }
  }

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record
   */
  async create(data) {
    try {
      const { data: newRecord, error } = await supabase
        .from(this.tableName)
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return newRecord;
    } catch (error) {
      console.error(`Error creating ${this.tableName} record:`, error);
      throw error;
    }
  }

  /**
   * Update an existing record
   * @param {string} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated record
   */
  async update(id, data) {
    try {
      const { data: updatedRecord, error } = await supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedRecord;
    } catch (error) {
      console.error(`Error updating ${this.tableName} record:`, error);
      throw error;
    }
  }

  /**
   * Delete a record
   * @param {string} id - Record ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting ${this.tableName} record:`, error);
      throw error;
    }
  }
}

// Authentication wrapper
const auth = {
  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>}
   */
  async isAuthenticated() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  /**
   * Get current user
   * @returns {Promise<Object|null>}
   */
  async me() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Login with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>}
   */
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Logout current user
   * @param {string} redirectTo - Optional redirect path
   */
  async logout(redirectTo = '/') {
    try {
      await supabase.auth.signOut();
      window.location.href = redirectTo;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  /**
   * Redirect to login page
   * @param {string} returnUrl - URL to return to after login
   */
  redirectToLogin(returnUrl = '/') {
    const loginUrl = `/admin/login?returnUrl=${encodeURIComponent(returnUrl)}`;
    window.location.href = loginUrl;
  }
};

// File upload integration
const integrations = {
  Core: {
    /**
     * Upload a file to Supabase Storage
     * @param {Object} params - Upload parameters
     * @param {File} params.file - File to upload
     * @param {string} params.bucket - Storage bucket name (default: 'tournament-gallery')
     * @returns {Promise<Object>} Upload result with file_url
     */
    async UploadFile({ file, bucket = 'tournament-gallery' }) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        return {
          file_url: publicUrl,
          path: filePath
        };
      } catch (error) {
        console.error('File upload error:', error);
        throw error;
      }
    }
  }
};

// Export the Base44 client
export const base44 = {
  // Entity clients
  entities: {
    Registration: new EntityClient('registrations'),
    Tournament: new EntityClient('tournaments'),
    FeaturedReel: new EntityClient('featured_reels'),
    Team: new EntityClient('teams'),
    Game: new EntityClient('games'),
    Sponsor: new EntityClient('sponsors'),
    MediaItem: new EntityClient('media_items'),
    YouTubeVideo: new EntityClient('youtube_videos')
  },
  
  // Authentication
  auth,
  
  // Integrations
  integrations,
  
  // Direct Supabase access for advanced use cases
  supabase
};

// Default export
export default base44;
