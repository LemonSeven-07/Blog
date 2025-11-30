import type { tagItem } from '@/types/app/common';

export interface GetTags {
  Request: {
    articleId?: number;
    categoryId?: number;
  };
  Response: tagItem[];
}
