import { http } from '@/api/http';

import type { GetTags } from './types';

// 创建标签
export const createTag = (params: { name: string }) => http.post({ url: '/tag/create', params });

// 获取标签列表
export const getTags = (params: GetTags['Request']) =>
  http.get<GetTags['Response']>({ url: '/tag/list', params });

// 修改标签
export const updateTag = (data: { id: number; name: string }) => {
  const { id, ...params } = data;
  return http.put({
    url: `/tag/${id}`,
    params
  });
};

// 删除标签
export const deleteTag = (params: { ids: number[] }) =>
  http.delete({ url: `/tag`, params, customizeOpt: { useBodyForDelete: true } });
