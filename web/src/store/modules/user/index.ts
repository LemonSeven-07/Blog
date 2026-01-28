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
  createdAt: '', // 用户注册时间
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
    },
    // 修改当前身份阶段重新初始化获取用户信息和权限路由
    setPhase(state, action: PayloadAction<{ phase: UserState['phase'] }>) {
      Object.assign(state, action.payload);
    },
    // 修改用户信息
    updateUser(state, action: PayloadAction<Partial<UserState>>) {
      Object.assign(state, { ...state, ...action.payload });
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

    // 分类重新排序把其他分类排到最后
    const categoryList = routes.filter((route) => route.meta.type === 'category');
    const categoryRoutes = [];
    let otherItem = null;
    for (const item of categoryList) {
      if (item.name === 'other') {
        otherItem = item;
      } else {
        categoryRoutes.push(item);
      }
    }
    if (otherItem) categoryRoutes.push(otherItem);

    // 前台系统header导航栏菜单
    const headerRoutes = routes.filter((route) => route.meta.type === 'header');
    // 后台系统菜单导航菜单
    const adminRoutes = routes.filter((route) => route.meta.type === 'admin');

    // 更新前端页面结构/导航信息
    dispatch(setNavigation({ routes, categoryRoutes, headerRoutes, adminRoutes }));

    return res.data;
  };
};

export const { setUser, resetUser, setPhase, updateUser } = userSlice.actions;
export { fetchAppInit };
export default userSlice.reducer;
