import axios from 'axios';
import config from './config';
import { ApiResponse } from 'budget-system-shared';

const axiosInstance = axios.create({
    baseURL: config.apiBaseUrl,
});

// Interceptor de requisição para adicionar o token de autenticação
axiosInstance.interceptors.request.use(
    (reqConfig) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            if (!reqConfig.headers) {
                reqConfig.headers = {};
            }
            reqConfig.headers.Authorization = `Bearer ${token}`;
        }
        return reqConfig;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de resposta para lidar com erros de autenticação e atualizar o token
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Verificar se o erro é 401 (não autorizado) e se o token já foi atualizado
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('Refresh token not found');
                }

                // Solicitar um novo token de acesso usando o refresh token
                const response = await axios.post<ApiResponse<{ token: string }>>(
                    `${config.apiBaseUrl}/auth/refresh`,
                    { token: refreshToken }
                );

                if (response.status === 200 && response.data.success && response.data.data) {
                    const { token: newToken } = response.data.data;

                    // Atualizar o token no localStorage
                    localStorage.setItem('authToken', newToken);

                    // Atualizar o cabeçalho Authorization para futuras requisições
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

                    // Reenviar a requisição original com o novo token
                    return axiosInstance(originalRequest);
                } else {
                    throw new Error(response.data.message || 'Failed to refresh token');
                }
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);

                // Redirecionar para a página de login se o refresh token falhar
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;