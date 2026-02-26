import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const initialState: { content: string } = {
  content: '' // 文章草稿内容
};

/**
 * @description: 草稿
 * @return {*}
 */
const draftSlice = createSlice({
  name: 'draft',
  initialState,
  reducers: {
    // 更新用户信息
    setDraftContent(state, action: PayloadAction<{ content: string }>) {
      Object.assign(state, action.payload);
    }
  }
});

export const { setDraftContent } = draftSlice.actions;
export default draftSlice.reducer;
