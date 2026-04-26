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
  http.get<OutputArticle['Response'], OutputArticle['Request'], true>({
    url: '/article/output',
    params,
    config,
    customizeOpt: { fullResponseData: true }
  });

// 导入 Markdown 文件创建文章
export const uploadArticle = (params: UploadArticle['Request']) =>
  http.post({
    url: '/article/import/file',
    params,
    config: { timeout: 30000 }
  });

// 按分类、标签、排序、关键字滚动查询文章列表
export const getArticleList = (params: GetArticleList['Request']) =>
  http.get<GetArticleList['Response']>({
    url: '/article/scroll',
    params
  });

// 查看文章
export const viewArticleDetail = (data: ViewArticleDetail['Request']) =>
  http.get<ViewArticleDetail['Response']>({
    url: `/article/${data.articleId}`,
    params: data.userId ? { userId: data.userId } : {}
  });

// 文章收藏或取消收藏单个和批量操作
export const toggleArticleFavorite = (params: ToggleArticleFavorite['Request']) =>
  http.post({
    url: '/article/favorites',
    params
  });

// 获取热门文章排行榜
export const getHotArticles = (params: { pageNum: number; pageSize: number }) =>
  http.get<GetArticles['Response']>({
    url: '/article/list',
    params
  });

// 后台分页查询文章列表
export const getAllArticles = (params: GetArticles['Request']) =>
  http.get<GetArticles['Response']>({
    url: '/article/admin/list',
    params
  });

// 删除文章
export const deleteArticles = (params: { ids: number[] }) =>
  http.delete({
    url: '/article',
    params,
    customizeOpt: { useBodyForDelete: true }
  });

// 上传文章图片
export const uploadImage = (params: UploadImage['Request']) =>
  http.post<UploadImage['Response']>({
    url: 'article/upload/image',
    params,
    config: { timeout: 30000 }
  });

// 发布文章
export const publishArticle = (params: PublishArticle['Request']) =>
  http.post({
    url: '/article/create/content',
    params,
    config: { ignoreLoading: false, timeout: 30000 }
  });

// 文章编辑
export const updateArticle = (params: FormData, id: number) =>
  http.put({
    url: `/article/${id}`,
    params,
    config: { ignoreLoading: false, timeout: 30000 }
  });
