import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            // Ignore these action types (they may contain non-serializable data)
            ignoredActions: ['auth/login/fulfilled', 'auth/checkAuth/fulfilled', 'auth/register/fulfilled'],
        },
    }), 
    devTools: import.meta.env.MODE !== 'production',
});