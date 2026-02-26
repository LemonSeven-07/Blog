import { http } from '@/api/http';
import type {
  OutputArticle,
  UploadArticle,
  GetArticleList,
  ViewArticleDetail,
  ToggleArticleFavorite,
  GetArticles,
  PublishArticle,
  UploadImage
} from './types';

// 导出文章（支持单个、批量和全部导出）
export const outputArticles = (params: OutputArticle['Request'], config: OutputArticle['Config']) =>
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

// 获取热门文章排行榜
export const getHotArticles = (params: { pageNum: number; pageSize: number }) =>
  http.get<GetArticles['Response']>('/article/list', params);

// 后台分页查询文章列表
export const getAllArticles = (params: GetArticles['Request']) =>
  http.get<GetArticles['Response']>('/article/admin/list', params);

// 删除文章
export const deleteArticles = (params: { ids: number[] }) =>
  http.delete('/article', params, {}, { useBodyForDelete: true });

// 上传文章图片
export const uploadImage = (params: UploadImage['Request']) =>
  http.post<UploadImage['Response']>('article/upload/image', params, { timeout: 30000 });

// 发布文章
export const publishArticle = (params: PublishArticle['Request']) =>
  http.post('/article/create/content', params, { ignoreLoading: false, timeout: 30000 });

// 文章编辑
export const updateArticle = (params: FormData, id: number) =>
  http.put(`/article/${id}`, params, { ignoreLoading: false, timeout: 30000 });
