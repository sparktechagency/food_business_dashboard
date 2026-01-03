import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setAccessToken, setAdmin } from './auth/authSlice'

export const IMAGE_BASE_URL = 'https://backend.grupoanfguakamol.com';
// export const IMAGE_BASE_URL = 'https://backend.grupoanfguakamol.com';

const rawBaseQuery = fetchBaseQuery({
    baseUrl: 'https://backend.grupoanfguakamol.com',
    // baseUrl: 'https://backend.grupoanfguakamol.com',

    prepareHeaders: (headers, { getState }) => {
        const token = getState()?.auth.accessToken;

        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }

        return headers
    }
})

// Wrap baseQuery to handle 401 globally
const baseQuery = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);
    const status = result?.error?.status ?? result?.error?.originalStatus;
    if (status === 401 || status === 403) {
        // Clear auth state
        api.dispatch(setAccessToken(null));
        api.dispatch(setAdmin(null));
        localStorage.removeItem("accessToken");
        // Redirect to login
        if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
        }
    }

    return result;
}

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery,

    tagTypes: ['USER', "PROFILE", 'LEGAL', 'DASHBOARD', 'COMPANY', 'MENU'],
    endpoints: () => ({})
})
