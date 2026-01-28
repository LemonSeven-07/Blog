import { http } from '@/api/http';
import type { GetTagsByCategory, GetCategories } from './types';

// 查询分类下对应的所有文章标签
export const getTagsByCategory = (params: GetTagsByCategory['Request']) =>
  http.get<GetTagsByCategory['Response']>(`/category/${params.categoryId}/tags`);

// 创建分类
export const createCategory = (params: { name: string; slug: string; icon: string }) =>
  http.post('/category/create', params);

// 获取分类列表
export const getCategories = (params: GetCategories['Request']) =>
  http.get<GetCategories['Response']>('/category/list', params);

// 修改分类
export const updateCategory = (params: { id: number; name: string; slug: string; icon: string }) =>
  http.put(`/category/${params.id}`, { name: params.name, slug: params.slug, icon: params.icon });

// 删除分类
export const deleteCategory = (params: { ids: number[] }) =>
  http.delete(`/category`, params, {}, { useBodyForDelete: true });
