// PASTE THIS CODE INTO: src/Entities/MediaItem.js

import { mockMediaItems } from '@/mock/db';

const MediaItemAPI = {
  _delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  filter: async (filters, sortBy, limit) => {
    console.log('Mock Fetching Media Items');
    await MediaItemAPI._delay(600);
    
    let results = mockMediaItems.filter(t => {
        return Object.entries(filters).every(([key, value]) => t[key] === value);
    });

    if (limit) {
        return results.slice(0, limit);
    }
    return results;
  }
};

export const MediaItem = MediaItemAPI; // <-- This is the line that makes it available!