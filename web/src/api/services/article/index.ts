import { http } from '@/api/http';
import type {
  OutputArticle,
  UploadArticle,
  GetArticleList,
  ViewArticleDetail,
  ToggleArticleFavorite
} from './types';

// 导出文章
export const outputArticle = (params: OutputArticle['Request'], config: OutputArticle['Config']) =>
  http.get<OutputArticle['Response'], OutputArticle['Response'], OutputArticle['Request'], true>(
    '/article/output',
    params,
    config,
    { fullResponseData: true }
  );

// 导入 Markdown 文件创建文章
export const uploadArticle = (params: UploadArticle['Request']) =>
  http.post('/article/import/file', params);

// 按分类、标签、排序、关键字滚动查询文章列表
export const getArticleList = (params: GetArticleList['Request']) =>
  http.get<GetArticleList['Response']>('/article/scroll', params);

// 查看文章
export const viewArticleDetail = (params: ViewArticleDetail['Request']) =>
  http.get<ViewArticleDetail['Response']>(
    `/article/${params.articleId}`,
    params.userId ? { userId: params.userId } : {}
  );

// 文章收藏或取消收藏单个和批量操作
export const toggleArticleFavorite = (params: ToggleArticleFavorite['Request']) =>
  http.post('/article/favorites', params);
