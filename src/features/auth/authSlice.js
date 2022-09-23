import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
    isInitialized: false,
    user: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action) {
            const {isAuthenticated, isInitialized, user} = action.payload
            state.isAuthenticated = isAuthenticated
            state.isInitialized = isInitialized
            state.user = user
        },

        logout(state, action) {
            state.isAuthenticated = false
            state.isInitialized = false
            state.user = null
        },

        initialize(state, action) {
            const { isInitialized } = action.payload
            state.isInitialized = isInitialized
        }
    }
})

export const { login, logout, initialize } = authSlice.actions

export default authSlice.reducer