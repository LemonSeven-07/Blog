export interface GetTagsByCategory {
  Request: { categoryId: number };
  Response: {
    id: number;
    name: string;
    articleCount: number;
  }[];
}
