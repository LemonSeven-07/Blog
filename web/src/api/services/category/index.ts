import { http } from '@/api/http';
import type { GetTagsByCategory, GetCategories } from './types';

// 查询分类下对应的所有文章标签
export const getTagsByCategory = (data: GetTagsByCategory['Request']) =>
  http.get<GetTagsByCategory['Response']>({
    url: `/category/${data.categoryId}/tags`
  });

// 创建分类
export const createCategory = (params: { name: string; slug: string; icon: string }) =>
  http.post({
    url: '/category/create',
    params
  });

// 获取分类列表
export const getCategories = (params: GetCategories['Request']) =>
  http.get<GetCategories['Response']>({
    url: '/category/list',
    params
  });

// 修改分类
export const updateCategory = (data: { id: number; name: string; slug: string; icon: string }) => {
  const { id, ...params } = data;
  return http.put({
    url: `/category/${id}`,
    params
  });
};

// 删除分类
export const deleteCategory = (params: { ids: number[] }) =>
  http.delete({
    url: '/category',
    params,
    customizeOpt: { useBodyForDelete: true }
  });
