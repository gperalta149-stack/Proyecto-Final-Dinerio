import axios from 'axios';

// Instancia única de Axios con la URL base del backend.
// VITE_API_URL se configura en el .env y se lee con import.meta.env de Vite.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Interceptor de REQUEST: se ejecuta antes de cada petición.
//     Si hay un token guardado, lo agrega al header Authorization como Bearer,
//     para que el backend identifique al usuario (middleware de auth).
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de RESPONSE: manejo centralizado de errores.
//     Si el backend responde 401 (sesión vencida), limpia el token y
//     redirige al login en forma automática.
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Error en response:', error.response?.status, error.config?.url);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;