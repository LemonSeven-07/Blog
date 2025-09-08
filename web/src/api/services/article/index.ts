import { http } from '@/api/http';
import type { OutputArticle } from './types';

export const outputArticle = (params: OutputArticle['Request'], config: OutputArticle['Config']) =>
  http.get<OutputArticle['Response'], OutputArticle['Response'], OutputArticle['Request'], true>(
    '/article/output',
    params,
    config,
    { fullResponseData: true }
  );
