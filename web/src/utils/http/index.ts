import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

import { store } from '@/store';
import { startLoading, stopLoading } from '@/store/modules/loading/slice';
import { cacheRules } from './cacheRules';

/* 创建 axios 实例 */
const httpInstance: AxiosInstance = axios.create({
  baseURL: '/yolo',
  timeout: 3000
});

/**
 * @description: 通用 HTTP 请求函数类型
 *
 * @template: T 返回的数据类型（data）
 * @template: P 返回的业务数据类型，默认 CommonResponse<T>
 * @template: R 请求参数类型（query 或 body），默认 unknown
 * @template: Full 是否返回完整 AxiosResponse，默认 false
 *
 * @param: url 请求地址
 * @param: params 请求参数，可选
 * @param: config axios 请求配置，可选
 * @param: customizeOpt 自定义选项，可控制返回完整响应
 *
 * @returns 当 Full 为 true 时，返回 AxiosResponse；否则返回业务数据 P
 */
type service = <T, P = CommonResponse<T>, R = unknown, Full extends boolean = false>(
  url: string,
  params?: R,
  config?: MyAxiosRequestConfig,
  customizeOpt?: CustomizeOpt & { fullResponseData?: Full }
) => Promise<Full extends true ? AxiosResponse : P>;
// 响应数据自定义配置
interface CustomizeOpt extends CacheOptions {
  autoCancelRequests?: boolean;
  fullResponseData?: boolean;
  handleBusinessCode?: boolean;
  useBodyForDelete?: boolean;
  httpConditionalCache?: 'none' | 'etag' | 'lastModified' | 'both';
}
// 扩展 AxiosRequestConfig 类型
interface MyAxiosRequestConfig extends AxiosRequestConfig {
  ignoreLoading?: boolean;
}
// http 请求方法类型
type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';
// 接口公共响应结构(对于特殊响应数据结构可自定义)
interface CommonResponse<T> {
  code: string;
  message: string;
  data: T;
}
interface CacheOptions {
  strategy?: 'none' | 'memory' | 'local' | 'session' | 'localHttpCache' | 'sessionHttpCache' | 'memoryHttpCache'; // 缓存策略 默认 'none'
  ttl?: number; // 缓存有效期 ms 默认 0
}
type CacheValue<T = unknown> = {
  data: T;
  expire: number;
  etag?: string;
  lastModified?: string;
};

// 接口异常响应 code 以及异常原因
const httpExceptionCode: Record<number, string> = {
  400: '请求参数错误，请检查输入(400)',
  401: '用户未登录或登录状态失效，请重新登录(401)',
  403: '您没有权限访问该功能(403)',
  404: '请求的资源不存在(404)',
  405: '请求方法不被允许，请联系管理员(405)',
  408: '请求超时，请重试(408)',
  413: '上传内容过大，请检查文件大小或参数(413)',
  429: '操作过于频繁，请稍后再试(429)',
  500: '服务器开小差了，请稍后再试(500)',
  502: '网关异常，请稍后重试(502)',
  503: '服务暂时不可用，请稍后再试(503)',
  504: '请求超时，请稍后再试(504)',
  505: '请求协议不被支持，请联系管理员(505)'
};
// 存储上一个路由未完成的请求
const routeChangeRequests = new Map<string, AbortController>();
// 存储当前正在进行的请求
const currentRouteRequests = new Map<string, AbortController>();
// 存储每个接口请求的缓存
const memoryCache = new Map<string, CacheValue>();

// 缓存工具
const webStorageCache = {
  get(key: string, type: 'local' | 'session'): CacheValue | null {
    const raw = type === 'local' ? localStorage.getItem(key) : sessionStorage.getItem(key);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (obj.expire > Date.now()) return obj;
    if (type === 'local') {
      localStorage.removeItem(key);
    } else {
      sessionStorage.removeItem(key);
    }
    return null;
  },
  set<T>(key: string, type: 'local' | 'session', data: T, ttl: number) {
    const obj = { data, expire: Date.now() + ttl };
    if (type === 'local') {
      localStorage.setItem(key, JSON.stringify(obj));
    } else {
      sessionStorage.setItem(key, JSON.stringify(obj));
    }
  }
};
/**
 * @description: 匹配缓存规则
 * @param {string} str 待匹配字符串(请求方法 + url)
 * @return {*} CacheOptions | null
 */
function matchCacheRule(str: string): CacheOptions | null {
  for (const key in cacheRules) {
    const pattern = key.replace(/:([^/]+)/g, () => {
      if (cacheRules[key].paramType === 'string') return '[^/]+'; // 字符串 ID
      return '\\d+'; // 默认数字 ID
    });
    const regex = new RegExp('^' + pattern + '$');
    if (regex.test(str)) {
      if (cacheRules[key].strategy === 'none') return null;
      return cacheRules[key];
    }
  }
  return null;
}

// 生成请求 key
function getRequestKey(config: AxiosRequestConfig) {
  const { method, url, params, data } = config;
  let tailStr: string = '';
  if (params) tailStr += JSON.stringify(params);
  if (data) tailStr += JSON.stringify(data);
  return `${method}-${url}` + `${tailStr ? '-' + tailStr : ''}`;
}

// 请求拦截
httpInstance.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig & { ignoreLoading?: boolean }
  ): InternalAxiosRequestConfig & { ignoreLoading?: boolean } => {
    // 如果 config.ignoreLoading 为 true，则不触发全局 loading
    if (!config.ignoreLoading) {
      store.dispatch(startLoading());
    }

    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError): Promise<never> => {
    store.dispatch(stopLoading());
    return Promise.reject(error);
  }
);

// 响应拦截
httpInstance.interceptors.response.use(
  (response: AxiosResponse & { config: MyAxiosRequestConfig }): AxiosResponse & { config: MyAxiosRequestConfig } => {
    if (!response.config.ignoreLoading) {
      store.dispatch(stopLoading());
    }

    const token = response.headers['x-access-token'];
    if (token) localStorage.setItem('token', token);
    return response;
  },
  (error: AxiosError): Promise<never> => {
    if (error.config && !(error.config as MyAxiosRequestConfig).ignoreLoading) {
      store.dispatch(stopLoading());
    }

    // 判断请求是否被终止
    if (axios.isCancel(error)) {
      // 请求被终止，静默处理，不提示错误
      return Promise.reject({ canceled: true });
    }

    const status = (error as AxiosError).response?.status;
    if (status && httpExceptionCode[status]) {
      if (status === 401) {
        localStorage.removeItem('token');
        message.warning(httpExceptionCode[status]);
      } else {
        message.error(httpExceptionCode[status]);
      }
    } else {
      message.error('请求错误' + status ? `(${status})` : '');
    }

    return Promise.reject(error);
  }
);

/**
 * @description: HTTP 请求封装方法
 *
 * @template: T 返回的数据类型（data）
 * @template: P 返回的业务数据类型，默认 CommonResponse<T>
 * @template: R 请求参数类型（query 或 body），默认 unknown
 * @template: Full 是否返回完整 AxiosResponse，默认 false
 *
 * @param: method 请求地址
 * @param: url 请求地址
 * @param: params 请求参数，可选
 * @param: config axios 请求配置，可选
 * @param: customizeOpt 自定义选项，可控制返回完整响应
 *
 * @returns 当 Full 为 true 时，返回 AxiosResponse；否则返回业务数据 P
 */
function request<T, P = CommonResponse<T>, R = unknown, Full extends boolean = false>(
  method: HttpMethod,
  url: string,
  params?: R,
  config?: MyAxiosRequestConfig,
  customizeOpt?: CustomizeOpt & { fullResponseData?: Full }
): Promise<Full extends true ? AxiosResponse : P> {
  const {
    fullResponseData = false,
    handleBusinessCode = true,
    useBodyForDelete = false,
    autoCancelRequests = true,
    httpConditionalCache = 'none',
    strategy = 'none',
    ttl = 0
  } = customizeOpt || {};

  // 创建中止请求操作的控制器
  const controller = new AbortController();
  const { ignoreLoading = false } = config || {};
  const axiosConfig: MyAxiosRequestConfig = {
    url,
    method,
    ...config,
    ignoreLoading,
    signal: controller.signal // 传给请求，绑定取消逻辑
  };

  if (method === 'get' || (method === 'delete' && !useBodyForDelete)) {
    axiosConfig.params = params;
  } else {
    axiosConfig.data = params;
  }

  const cKey = getRequestKey(axiosConfig); // 生成当前路由页面请求唯一 key

  // ✅ 性能优化一：请求缓存处理
  let rule: CacheOptions | null = null;
  // 判断请求头是否设置了 http 强缓存
  if (
    !axiosConfig.headers ||
    (axiosConfig.headers &&
      (axiosConfig.headers['Cache-Control'] === 'no-cache' || !axiosConfig.headers['Cache-Control']))
  ) {
    // 没有设置 http 强缓存，则判断是否有缓存规则(优先自定义配置，其次是预设规则)
    if (strategy !== 'none') rule = { strategy, ttl };
    if (!rule) rule = matchCacheRule(method + url);
    if (rule) {
      // 1️⃣ memory 缓存
      if (rule.strategy === 'memory') {
        const entry = memoryCache.get(cKey);
        if (entry && Date.now() < entry.expire) {
          // 命中缓存，返回缓存数据
          return new Promise((resolve) => {
            resolve(entry.data as Full extends true ? never : P);
          });
        } else {
          // 没有缓存或者缓存过期，删除缓存
          memoryCache.delete(cKey);
        }
      } else if (rule.strategy === 'local' || rule.strategy === 'session') {
        // 2️⃣ localStorage/sessionStorage 缓存
        const entry = webStorageCache.get(cKey, rule.strategy);
        if (entry) {
          // 命中缓存，返回缓存数据
          return new Promise((resolve) => {
            resolve(entry.data as Full extends true ? never : P);
          });
        }
      } else if (
        rule.strategy === 'localHttpCache' ||
        rule.strategy === 'sessionHttpCache' ||
        rule.strategy === 'memoryHttpCache'
      ) {
        // 3️⃣ http 协商缓存 + localStorage/sessionStorage/memory 缓存
        let entry = null;
        if (rule.strategy === 'localHttpCache') entry = localStorage.getItem(cKey);
        if (rule.strategy === 'sessionHttpCache') entry = sessionStorage.getItem(cKey);
        if (rule.strategy === 'memoryHttpCache') entry = memoryCache.get(cKey);
        if (entry) {
          // 命中缓存，判断是否过期
          const {
            data,
            etag,
            lastModified,
            expiry = 0
          } = rule.strategy === 'memoryHttpCache' ? entry : JSON.parse(entry as string);
          if (Date.now() < expiry) {
            return new Promise((resolve) => {
              resolve(data as Full extends true ? never : P);
            });
          } else {
            if (!axiosConfig.headers) axiosConfig.headers = {};
            // 没有缓存或者缓存过期，正常请求
            if (httpConditionalCache === 'etag') {
              // 仅使用 Etag 进行协商缓存
              if (etag) axiosConfig.headers['If-None-Match'] = etag;
            } else if (httpConditionalCache === 'lastModified') {
              // 仅使用 Last-Modified 进行协商缓存
              if (lastModified) axiosConfig.headers['If-Modified-Since'] = lastModified;
            } else if (httpConditionalCache === 'both') {
              // Etag + Last-Modified 混合使用
              if (etag) axiosConfig.headers['If-None-Match'] = etag;
              if (lastModified) axiosConfig.headers['If-Modified-Since'] = lastModified;
            }
          }
        }
      }
    }
  }

  // ✅ 性能优化二： 同一页面重复请求上一个接口未响应取消上一个
  if (currentRouteRequests.has(cKey)) {
    currentRouteRequests.get(cKey)!.abort();
    currentRouteRequests.delete(cKey);
  }
  currentRouteRequests.set(cKey, controller);

  // ✅ 性能优化三：切换页面路由取消请求
  const rKey = `${url}_${Date.now()}`; // 每次路由切换请求 key 都不一样，保证每次路由切换都取消上一个路由的请求
  if (autoCancelRequests) {
    routeChangeRequests.set(rKey, controller);
  }

  return httpInstance
    .request<P>(axiosConfig)
    .then(async (res) => {
      // ✳️ http 协商缓存返回 304
      if (res.status === 304) {
        let cacheData;
        if (rule?.strategy === 'memoryHttpCache')
          cacheData = memoryCache.get(cKey)?.data as Full extends true ? AxiosResponse : P;
        if (rule?.strategy === 'localHttpCache')
          cacheData = JSON.parse(localStorage.getItem(cKey) as string)?.data as Full extends true ? AxiosResponse : P;
        if (rule?.strategy === 'sessionHttpCache')
          cacheData = JSON.parse(sessionStorage.getItem(cKey) as string)?.data as Full extends true ? AxiosResponse : P;
        return cacheData as Full extends true ? AxiosResponse : P;
      }

      let data = res.data;
      // 🏷️ 响应数据什么都不做处理全量返回给交互逻辑层
      if (fullResponseData) return res as Full extends true ? AxiosResponse : never;

      // 🏷️ 判断交互逻辑层是否要处理异常业务 code（默认需要）
      if (!handleBusinessCode) return data as Full extends true ? never : P;

      const contentType = res.headers['content-type'];
      // 🏷️ 判断响应数据是文件流二进制数据还是 json 数据
      if (config?.responseType === 'blob') {
        if (contentType.includes('application/json')) {
          // 响应数据是 json 数据
          const text = await (data as Blob).text();
          data = JSON.parse(text);
        } else {
          // 向交互逻辑层返回文件流二进制数据
          return data as Full extends true ? never : P;
        }
      }

      if ((data as P & { code?: string }).code === '200') {
        // ✳️ 缓存在内存(JS 变量，页面刷新就没了)
        if (rule?.strategy === 'memory') memoryCache.set(cKey, { data, expire: Date.now() + (rule.ttl || 0) });
        // ✳️ 浏览器本地缓存
        if (rule?.strategy === 'local') webStorageCache.set(cKey, 'local', data, rule.ttl || 0);
        // ✳️ 浏览器会话缓存
        if (rule?.strategy === 'session') webStorageCache.set(cKey, 'session', data, rule.ttl || 0);
        // ✳️ 存储 http 协商缓存相关字段
        if (
          rule?.strategy === 'localHttpCache' ||
          rule?.strategy === 'sessionHttpCache' ||
          rule?.strategy === 'memoryHttpCache'
        ) {
          const cacheEntry: CacheValue = {
            data,
            expire: Date.now() + (rule.ttl || 0)
          };
          if (res.headers['etag']) cacheEntry.etag = res.headers['etag'];
          if (res.headers['last-modified']) cacheEntry.lastModified = res.headers['last-modified'];
          if (rule.strategy === 'localHttpCache') {
            localStorage.setItem(cKey, JSON.stringify(cacheEntry));
          } else if (rule.strategy === 'sessionHttpCache') {
            sessionStorage.setItem(cKey, JSON.stringify(cacheEntry));
          } else if (rule.strategy === 'memoryHttpCache') {
            memoryCache.set(cKey, cacheEntry);
          }
        }

        // 🏷️ 业务逻辑处理成功直接返回 data
        return data as Full extends true ? never : P;
      } else {
        // 🏷️ 统一处理异常业务code并提示，交互逻辑层无需提示
        message.error((data as P & { message?: string }).message || '请求异常');
        // 🏷️ 抛出业务错误。若交互逻辑层有业务抛错后的逻辑，在交互逻辑层用catch捕捉异常并写业务代码即可
        return Promise.reject(new Error((data as P & { message?: string }).message || '请求异常'));
      }
    })
    .finally(() => {
      // 清除 routeChangeRequests 中已完成的请求
      routeChangeRequests.delete(rKey);
    });
}

/* axios 封装请求方法使用说明：
  * 范型参数
    🟩 T: 接口返回的业务数据结构，例如：获取用户信息 { id: number; name: string; age: number }
    🟩 P: 默认 CommonResponse<T> 结构，以获取用户信息为例： {code: string, data: { id: number; name: string; age: number }, message: string }。接口完整响应结构，如果接口响应数据有特殊数据结构可自定义覆盖
    🟩 R: 默认 unknown。请求参数类型
    🟩 Full: 泛型布尔值，默认 false。控制返回类型，如果 true 返回 AxiosResponse，否则返回 P
  * 方法参数
    🟩 url: string类型，为接口请求地址
    🟩 params: R类型，为接口请求参数
    🟩 config: MyAxiosRequestConfig类型，为扩展后 axios 请求配置，包含：url、method、baseURL、headers，params、data、timeout、responseType、ignoreGlobalLoading、cancelOnRouteChange等。重点 💡ignoreGlobalLoading?: boolean 扩展字段，接口请求 pending 过程中控制全局 loading 显示与否的开关。如果某些请求是“静默”或低优先级的，全局 loading 会闪烁，影响用户体验。默认 false 显示页面loading; 
    🟩 customizeOpt: CustomizeOpt & { fullResponseData?: Full } 类型，为自定义选项包括：💡autoCancelRequests?: boolean(路由切换时取消上个页面还在 pending 中的请求，默认 true 取消 pending 中的请求)、💡fullResponseData?: boolean(响应数据是否全量交给交互逻辑层，默认 false 非全量)、💡handleBusinessCode?: boolean(是否统一处理接口业务code状态码，默认 true 统一处理)、💡useBodyForDelete?: boolean(delete 请求参数是放在query还是body里面，默认 false 放在query)
  * 方法返回类型结构
    🟩 Promise<P>: 如果 fullResponseData = false（默认），返回接口实际数据结构（默认 CommonResponse<T>）
    🟩 Promise<AxiosResponse>: 如果 fullResponseData = true, 返回完整的 Axios 响应对象，包括：data、status、headers、config、statusText
*/
const getMthod: service = (url, params, config, customizeOpt) => {
  return request('get', url, params, config, customizeOpt);
};
const postMthod: service = (url, params, config, customizeOpt) => {
  return request('post', url, params, config, customizeOpt);
};
const putMthod: service = (url, params, config, customizeOpt) => {
  return request('put', url, params, config, customizeOpt);
};
const deleteMthod: service = (url, params, config, customizeOpt) => {
  return request('delete', url, params, config, customizeOpt);
};
const patchMthod: service = (url, params, config, customizeOpt) => {
  return request('patch', url, params, config, customizeOpt);
};

export const http = {
  get: getMthod,
  post: postMthod,
  put: putMthod,
  delete: deleteMthod,
  patch: patchMthod
};

/**
 * @description: 立即中止绑定的请求/任务
 */
export function cancelPendingRequests() {
  routeChangeRequests.forEach((controller) => controller.abort());
  routeChangeRequests.clear();
}
