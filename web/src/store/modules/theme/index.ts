import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ConfigState } from './types';

// 从 localStorage 读取整个对象
function loadConfigState(): ConfigState {
  try {
    const data = localStorage.getItem('theme_config');
    if (data) return JSON.parse(data) as ConfigState;
  } catch {
    console.error('parse error');
  }

  return {
    isDark: false
  };
}

// 保存整个对象
function saveConfigState(state: ConfigState) {
  localStorage.setItem('theme_config', JSON.stringify(state));
}

// 初始化 state
const initialState: ConfigState = loadConfigState();

/**
 * @description: 系统配置
 * @return {*}
 */
const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setIsDark: (state, action: PayloadAction<boolean>) => {
      state.isDark = action.payload;
      saveConfigState(state);
    }
  }
});

export const { setIsDark } = configSlice.actions;
export default configSlice.reducer;
