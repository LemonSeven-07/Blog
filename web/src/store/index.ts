import { configureStore } from '@reduxjs/toolkit';

import loadingReducer from './modules/loading';
import configReducer from './modules/theme';
import userReducer from './modules/user';
import navigationReducer from './modules/navigation';
import draftReducer from './modules/draft';

export const store = configureStore({
  reducer: {
    loading: loadingReducer,
    theme: configReducer,
    userInfo: userReducer,
    navigation: navigationReducer,
    draft: draftReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
