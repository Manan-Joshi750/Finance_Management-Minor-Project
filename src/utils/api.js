import axios from 'axios';

// Create a centralized Axios instance
const api = axios.create({
  // This automatically uses the live URL in production, and localhost in development
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Optional but highly recommended: 
// If you are using JWT tokens for login, you can automate sending the token here
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Adjust this if you store your token differently
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;