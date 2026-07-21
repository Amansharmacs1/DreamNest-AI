import axios from 'axios';


// Temporarily redefining types for frontend to avoid monorepo setup issues in Phase 1
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generateLayoutAPI = async (preferences: any) => {
  const response = await api.post('/layout/generate', preferences);
  return response.data;
};
