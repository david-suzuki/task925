import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import authReducer from '../features/auth/authSlice';
import workspaceSlice from '../features/workspace/workspaceSlice';
import appsettingSlice from '../layouts/appsettingSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    workspaces: workspaceSlice,
    appsetting: appsettingSlice
  },
});
