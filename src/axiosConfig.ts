import axios from 'axios';
import config from './config';

const axiosInstance = axios.create({
    baseURL: config.apiBaseUrl,
});

axiosInstance.interceptors.request.use(
    (reqConfig) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            if (!reqConfig.headers) {
                reqConfig.headers = {};
            }
            reqConfig.headers.Authorization = `Bearer ${token}`;
            console.log('reqConfig.headers', JSON.stringify(reqConfig.headers));
        }
        return reqConfig;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        // TODO: Implement refresh token logic

        // const originalRequest = error.config;
        // if (error.response.status === 401 && !originalRequest._retry) {
        //     originalRequest._retry = true;
        //     const refreshToken = localStorage.getItem('refreshToken');
        //     const response = await axios.post<{ token: string }>(`${config.apiBaseUrl}/api/auth/refresh`, { token: refreshToken });
        //     if (response.status === 200) {
        //         localStorage.setItem('authToken', response.data.token);
        //         axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        //         return axiosInstance(originalRequest);
        //     }
        // }
        return Promise.reject(error);
    }
);

export default axiosInstance;