// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('API URL:', API_URL);
// Helper function to get full API endpoint
export const getApiUrl = (endpoint) => `${API_URL}${endpoint}`; 