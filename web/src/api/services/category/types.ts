export interface GetTagsByCategory {
  Request: { categoryId: number };
  Response: {
    id: number;
    name: string;
    articleCount: number;
  }[];
}

export interface GetCategories {
  Request: {
    pageNum: number; // 当前页码
    pageSize: number; // 每页条数
    name?: string; // 分类名称搜索
    createDate?: string; // 创建时间范围
  };
  Response: {
    list: {
      id: number;
      name: string;
      slug: string;
      icon: string;
      createdAt: string;
    }[];
    total: number;
  };
}
