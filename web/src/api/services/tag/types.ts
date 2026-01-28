import type { tagItem } from '@/types/app/common';

export interface GetTags {
  Request: {
    pageNum: number; // 当前页码
    pageSize: number; // 每页条数
    name?: string; // 标签名称搜索
    createDate?: string; // 创建时间范围
    isBuiltin?: boolean; // 是否系统内置标签
  };
  Response: {
    list: (tagItem & { isBuiltin: boolean })[];
    total: number;
  };
}
