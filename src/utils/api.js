import axios from 'axios';

// 🚀 BULLETPROOF ROUTING:
// When deployed on Vercel (production), it forces your live Render URL.
// When working locally on your machine (development), it switches back to localhost.
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://fintrack-backend-9lxh.onrender.com/api'
  : 'http://localhost:5000/api';

// Create a centralized Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically send JWT tokens for authentication if they exist in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;