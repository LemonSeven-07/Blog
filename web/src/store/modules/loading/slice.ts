import { createSlice } from '@reduxjs/toolkit';
import type { LoadingState } from './loading.types';

const initialState: LoadingState = {
  activeRequests: 0,
  globalLoading: false
};

/**
 * @description: 全局 loading
 * @return {*}
 */
const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    /* 依赖 Axios 拦截器控制全局 loading */
    startLoading: (state) => {
      state.activeRequests += 1;
      state.globalLoading = true;
    },
    stopLoading: (state) => {
      state.activeRequests = Math.max(0, state.activeRequests - 1);
      if (state.activeRequests === 0) state.globalLoading = false;
    },

    /* 手动控制全局 loading */
    showLoading: (state) => {
      state.globalLoading = true;
    },
    hideLoading: (state) => {
      state.globalLoading = false;
    },
    resetLoading: (state) => {
      state.activeRequests = 0;
      state.globalLoading = false;
    }
  }
});

export const { startLoading, stopLoading, showLoading, hideLoading, resetLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
