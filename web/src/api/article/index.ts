import { http } from '@/utils/http';
import type { OutputArticle } from './article.types';

export const outputArticle = (params: OutputArticle['Request'], config: OutputArticle['Config']) =>
  http.get<OutputArticle['Response'], OutputArticle['Response'], OutputArticle['Request'], true>(
    '/article/output',
    params,
    config,
    { fullResponseData: true }
  );
