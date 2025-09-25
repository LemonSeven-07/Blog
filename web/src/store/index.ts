import { configureStore } from '@reduxjs/toolkit';

import loadingReducer from './modules/loading';
import configReducer from './modules/config';

export const store = configureStore({
  reducer: {
    loading: loadingReducer,
    config: configReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
