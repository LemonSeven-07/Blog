import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { NavigationState } from './types';

const initialState: NavigationState = {
  routes: [],
  categoryRoutes: [],
  headerRoutes: [],
  adminRoutes: []
};

/**
 * @description: 前端页面结构/导航信息
 * @return {*}
 */
const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    // 更新前端页面结构/导航信息
    setNavigation(state, action: PayloadAction<NavigationState>) {
      state.routes = action.payload.routes;
      state.categoryRoutes = action.payload.categoryRoutes;
      state.headerRoutes = action.payload.headerRoutes;
      state.adminRoutes = action.payload.adminRoutes;
    }
  }
});

export const { setNavigation } = navigationSlice.actions;
export default navigationSlice.reducer;
