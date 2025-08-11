// PASTE THIS CODE INTO: src/Entities/Sponsor.js

import { mockSponsors } from '@/mock/db';

const SponsorAPI = {
  _delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  filter: async (filters, sortBy, limit) => {
    console.log('Mock Fetching Sponsors');
    await SponsorAPI._delay(400);
    return mockSponsors.slice(0, limit);
  }
};

export const Sponsor = SponsorAPI;