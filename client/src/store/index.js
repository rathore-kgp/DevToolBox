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
            // Ignore this action type (they may contain non-srializable data)
            ignoredActions: ['auth/login/fulfilled'],
        },
    }), 
    devTools: import.meta.env.MODE !== 'production',
});