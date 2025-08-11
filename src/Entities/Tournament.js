// PASTE THIS CODE INTO: src/Entities/Tournament.js

import { mockTournaments } from '@/mock/db';

const TournamentAPI = {
  // Simulate network delay
  _delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mimics Base44's `filter` method
  filter: async (filters, sortBy, limit) => {
    console.log('Mock Fetching Tournaments with filters:', filters);
    await TournamentAPI._delay(500); // Simulate loading time
    
    let results = mockTournaments.filter(t => {
        return Object.entries(filters).every(([key, value]) => t[key] === value);
    });

    if (limit) {
        return results.slice(0, limit);
    }
    return results;
  },
  
  // Mimics Base44's `list` method
  list: async () => {
    console.log('Mock Fetching all Tournaments');
    await TournamentAPI._delay(500);
    return mockTournaments;
  }
};

export const Tournament = TournamentAPI;