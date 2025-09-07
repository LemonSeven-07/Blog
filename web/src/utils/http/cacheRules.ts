interface CacheOptions {
  strategy?: // 缓存策略 默认 'none'
  | 'none' // 不缓存
    | 'memory' // 缓存在内存(JS 变量，页面刷新就没了)
    | 'local' // 浏览器本地缓存
    | 'session' // 浏览器会话缓存
    | 'localHttpCache' // http 协商缓存（Etag/Last-Modified）+ localStorage
    | 'sessionHttpCache' // http 协商缓存（Etag/Last-Modified） + sessionStorage
    | 'memoryHttpCache'; // http 协商缓存（Etag/Last-Modified） + 内存
  ttl?: number; // 缓存有效时间，单位 ms
  paramType?: 'number' | 'string'; // 动态路径参数的类型，默认 number
}

// 缓存规则数据为所有get请求，key 为请求 method + url 组成。数据排列顺序优先级静态路由优先，动态路由其次（其他特殊请求方法的请求走自定义）
export const cacheRules: Record<string, CacheOptions> = {
  'get/article/list': { strategy: 'session', ttl: 5 * 60 * 1000 },
  'get/article/info/detail': { strategy: 'session', ttl: 6 },
  'get/article/:id': { strategy: 'session', ttl: 7 },
  'get/article/:slug': { strategy: 'session', ttl: 8, paramType: 'string' },
  'get/article/:id/detail': { strategy: 'session', ttl: 9 },
  'get/article/:slug/detail': { strategy: 'session', ttl: 10, paramType: 'string' }
};
