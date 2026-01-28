import { http } from '@/api/http';

import type { GetTags } from './types';

// 创建标签
export const createTag = (params: { name: string }) => http.post('/tag/create', params);

// 获取标签列表
export const getTags = (params: GetTags['Request']) =>
  http.get<GetTags['Response']>('/tag/list', params);

// 修改标签
export const updateTag = (params: { id: number; name: string }) =>
  http.put(`/tag/${params.id}`, { name: params.name });

// 删除标签
export const deleteTag = (params: { ids: number[] }) =>
  http.delete(`/tag`, params, {}, { useBodyForDelete: true });
