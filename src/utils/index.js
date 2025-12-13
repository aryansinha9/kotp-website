// src/utils/index.js
// Utility functions for the KOTP application

/**
 * Creates a URL path for a given page name
 * Used throughout the app for consistent routing
 * 
 * @param {string} pageName - The name of the page (e.g., "Home", "About", "Register")
 * @returns {string} The URL path for the page
 */
export function createPageUrl(pageName) {
  // Map page names to their routes
  const pageRoutes = {
    'Home': '/',
    'About': '/about',
    'Academy': '/academy',
    'Tournaments': '/tournaments',
    'LiveScores': '/live-scores',
    'Moments': '/moments',
    'Sponsors': '/sponsors',
    'Contact': '/contact',
    'Register': '/register',
    'AdminLogin': '/admin/login',
    'AdminDashboard': '/admin/dashboard',
    'Gallery': '/gallery',
    'PrivacyPolicy': '/privacy-policy',
    'TermsConditions': '/terms-conditions',
    'TermsAndConditions': '/terms-conditions',
    'RegistrationSuccess': '/registration-success',
    'UpdatePassword': '/update-password'
  };

  // Return the route for the page, or default to lowercase with dash
  return pageRoutes[pageName] || `/${pageName.toLowerCase().replace(/\s+/g, '-')}`;
}

/**
 * Format a date string for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format a phone number for display
 * @param {string} phone - Phone number string
 * @returns {string} Formatted phone number
 */
export function formatPhone(phone) {
  if (!phone) return '';
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  // Format as Australian phone number
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}
