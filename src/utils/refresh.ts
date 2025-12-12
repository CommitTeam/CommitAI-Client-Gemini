import { getAccessToken, getRefreshToken, saveAccessToken, saveRefreshToken } from "@/store/secureStore";
import axios from "axios";
import { API_URL } from "./apiConfig";

const axiosInstance = axios.create({
    baseURL: API_URL,
})

axiosInstance.interceptors.request.use(
    async (config) => {
        const accessToken = await getAccessToken();
        console.log('[Request Interceptor] Access Token:', accessToken);
        if (accessToken && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        console.log('[Request Interceptor] Error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            console.log('[Response Interceptor] 401 Unauthorized - Attempting token refresh');
            originalRequest._retry = true;

            try {
                const refreshToken = await getRefreshToken();

                if (!refreshToken) {
                    return Promise.reject(error);
                }

                const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
                    refreshToken,
                });

                const newAccessToken = response.data.accessToken;
                const newRefreshToken = response.data.refreshToken;
                await saveAccessToken(newAccessToken);
                await saveRefreshToken(newRefreshToken)
                console.log("New Refresh Token", newRefreshToken, "New Access Token", newAccessToken)
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
