/*
 * @Author: chenshijie
 * @Date: 2025-09-08 15:53:36
 * @LastEditors: chenshijie
 * @LastEditTime: 2025-09-08 23:49:49
 * @FilePath: /Blog/web/src/api/http/cacheRules.ts
 * @Description: ✅ 性能优化：缓存规则配置
 */
import type { CacheOptions } from './types';

// ‼️ 缓存规则数据为所有get请求，key 为请求 method + url 组成。数据排列顺序优先级静态路由优先，动态路由其次（其他特殊请求方法的请求走自定义）
export const cacheRules: Record<string, CacheOptions> = {
  'get/article/list': { strategy: 'session', ttl: 5 * 60 * 1000 },
  'get/article/info/detail': { strategy: 'session', ttl: 6 },
  'get/article/:id': { strategy: 'session', ttl: 7 },
  'get/article/:slug': { strategy: 'session', ttl: 8, paramType: 'string' },
  'get/article/:id/detail': { strategy: 'session', ttl: 9 },
  'get/article/:slug/detail': { strategy: 'session', ttl: 10, paramType: 'string' }
};
