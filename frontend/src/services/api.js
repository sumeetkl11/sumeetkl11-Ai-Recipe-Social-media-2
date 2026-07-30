import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

export function buildApiUrl(path = '') {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${normalizedPath}`;
}

// Create axios instance with credentials support for httpOnly cookies
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send cookies with requests
});

// Response interceptor for error handling
let isRedirecting = false;

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !isRedirecting) {
            // Token expired or invalid - debounce redirect to handle concurrent 401s
            isRedirecting = true;
            
            // Use setTimeout to allow pending requests to complete
            setTimeout(() => {
                window.location.href = '/login';
            }, 100);
        }
        return Promise.reject(error);
    }
);

export default api;
