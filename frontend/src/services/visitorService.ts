import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getVisitorCount = async (): Promise<number> => {
  const response = await api.get('/analytics/visitor');
  return response.data.count;
};

export const incrementVisitorCount = async (): Promise<number> => {
  const response = await api.post('/analytics/visitor/increment');
  return response.data.count;
};
