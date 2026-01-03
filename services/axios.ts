import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  timeout: 1000 * 60 * 10,
});

export default axiosClient;


