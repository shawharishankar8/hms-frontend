import axios from 'axios';

let accessToken = null;

export const setAccessToken = (token) => {
    console.log('setAccessToken called with:', token);
    if (token && token !== "undefined" && token !== "null") {
        accessToken = token;
        localStorage.setItem('accessToken', token);
        console.log('Token stored in localStorage');
    } else {
        console.warn('Invalid token received:', token);
        accessToken = null;
        localStorage.removeItem('accessToken');
    }
};

export const getAccessToken = () => {
    console.log('getAccessToken returning:', accessToken);
    return accessToken;
};

export const clearAccessToken = () => {
    accessToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    console.log('All tokens cleared');
};

const axiosClient = axios.create({
    baseURL: "http://localhost:8080",
});

axiosClient.interceptors.request.use((config) => {
    console.log('Request to:', config.url);
    console.log('Current accessToken:', accessToken);

    // Skip Authorization for auth endpoints
    if (config.url.includes('/api/auth/login') ||
        config.url.includes('/api/auth/register') ||
        config.url.includes('/api/auth/refresh')) {
        return config;
    }

    // For all other endpoints (including logout), add token
    if (accessToken && accessToken !== "undefined" && accessToken !== "null") {
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log('Added Authorization header');
    } else {
        console.log('No valid token, skipping Authorization header');
    }

    return config;
});

// Add response interceptor to handle 401 (token expired)
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.log('Token expired or invalid, clearing...');
            clearAccessToken();
            // Redirect to login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;