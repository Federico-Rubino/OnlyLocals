import axios from 'axios';

const api = axios.create({
  baseURL: 'https://onlylocals.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ESEMPIO: Qui aggiungerai il token quando avrai l'autenticazione
// api.interceptors.request.use((config) => {
//   const token = 'IL_TUO_JWT_QUI'; 
//   config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

export default api;