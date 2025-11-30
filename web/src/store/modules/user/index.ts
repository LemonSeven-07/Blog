import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type UserState } from './types';
import type { AppDispatch } from '@/store';
import { setNavigation } from '../navigation';
import api from '@/api';

const initialState: UserState = {
  userId: null, // 用户 ID
  avatar: '', // 用户头像
  username: '', // 用户名
  role: 2, // 用户权限
  email: '', // 用户邮箱
  banned: false, // 用户是否被禁言
  phase: 'initializing'
};

/**
 * @description: 用户信息
 * @return {*}
 */
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 更新用户信息
    setUser(state, action: PayloadAction<UserState>) {
      Object.assign(state, action.payload);
    },
    // 重置用户信息
    resetUser() {
      return initialState;
    }
  }
});

const fetchAppInit = () => {
  return async (dispatch: AppDispatch) => {
    const res = await api.userApi.getAppInitData();
    const { user, routes } = res.data;
    // 更新用户信息
    if (user) {
      dispatch(setUser({ ...user, phase: 'authenticated' }));
    } else {
      dispatch(setUser({ ...initialState, phase: 'guest' }));
    }

    const categoryRoutes = routes.filter((route) => route.meta.type === 'category');
    const headerRoutes = routes.filter((route) => route.meta.type === 'header');
    const adminRoutes = routes.filter((route) => route.meta.type === 'admin');

    // 更新前端页面结构/导航信息
    dispatch(setNavigation({ routes, categoryRoutes, headerRoutes, adminRoutes }));

    return res.data;
  };
};

export const { setUser, resetUser } = userSlice.actions;
export { fetchAppInit };
export default userSlice.reducer;
