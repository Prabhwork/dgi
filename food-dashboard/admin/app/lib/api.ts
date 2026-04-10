import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_FOOD_API_URL;

// Create instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Add Interceptor for Multi-Tenant Header
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    const selectedPartner = localStorage.getItem('selectedPartner');
    if (selectedPartner) {
      const partner = JSON.parse(selectedPartner);
      if (partner && partner.id) {
        config.headers['x-partner-id'] = partner.id;
      }
    }
  }
  return config;
});

export const api = {
  get: async (endpoint: string, config?: any) => {
    const res = await axiosInstance.get(endpoint, config);
    return res.data;
  },
  post: async (endpoint: string, data: any, config?: any) => {
    const res = await axiosInstance.post(endpoint, data, config);
    return res.data;
  },
  put: async (endpoint: string, data: any, config?: any) => {
    const res = await axiosInstance.put(endpoint, data, config);
    return res.data;
  },
  patch: async (endpoint: string, data: any, config?: any) => {
    const res = await axiosInstance.patch(endpoint, data, config);
    return res.data;
  },
  delete: async (endpoint: string, config?: any) => {
    const res = await axiosInstance.delete(endpoint, config);
    return res.data;
  },
};
