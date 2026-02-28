import { http } from '@/api/http';
import type { GetDashboardStats } from './types';

// 获取仪表盘统计数据
export const getDashboardStats = () => http.get<GetDashboardStats['Response']>('/dashboard/stats');
