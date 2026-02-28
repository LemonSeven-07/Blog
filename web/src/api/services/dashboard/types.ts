export interface GetDashboardStats {
  Response: {
    categoryCount: number;
    tagCount: number;
    articleGroupInfo: {
      articleCount: number;
      totalFavorites: number;
      totalViews: number;
      category: {
        id: number;
        name: string;
      };
    }[];
    tagGroupInfo: {
      id: number;
      name: string;
      articleCount: number;
    }[];
  };
}
