import axios from 'axios';

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken=token;
}
// Create an Axios instance with default configurations
const axiosClient = axios.create({
    baseURL: "http://localhost:8080", 
});

axiosClient.interceptors.request.use((config) => {

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});
export default axiosClient;