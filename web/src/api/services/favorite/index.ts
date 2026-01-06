import { http } from '@/api/http';
import type { GetFavoriteArticles, GetCategoriesByFavorite } from './types';

// 获取收藏文章
export const getFavoriteArticles = (params: GetFavoriteArticles['Request']) =>
  http.get<GetFavoriteArticles['Response']>('/favorite/articles', params);

// 获取收藏文章对应的文章分类
export const getCategoriesByFavorite = () =>
  http.get<GetCategoriesByFavorite['Response']>('/favorite/categories');
