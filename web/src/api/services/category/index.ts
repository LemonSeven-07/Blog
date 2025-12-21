import { http } from '@/api/http';
import type { GetTagsByCategory } from './types';

// 查询分类下对应的所有文章标签
export const getTagsByCategory = (params: GetTagsByCategory['Request']) =>
  http.get<GetTagsByCategory['Response']>(`/category/${params.categoryId}/tags`);
