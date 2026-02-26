/*
 * @Author: yolo
 * @Date: 2025-09-08 15:51:32
 * @LastEditors: yolo
 * @LastEditTime: 2026-02-27 02:41:19
 * @FilePath: /web/src/api/http/request.ts
 * @Description: axios 请求核心封装
 */

import type { AxiosResponse, AxiosHeaders } from 'axios';
import { message } from 'antd';

import { httpInstance } from './index';
import type {
  CommonResponse,
  HttpMethod,
  MyAxiosRequestConfig,
  CustomizeOpt,
  CacheOptions,
  Service
} from './types';
import { cancelRequest } from './cancel';
import { cacheRequest } from './cache';

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
  // ‼️ 自定义配置参数默认值
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
  const { ignoreLoading = true } = config || {};
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

  // 生成当前路由页面请求唯一 key
  const cKey = cancelRequest.getRequestKey(axiosConfig);
  // ✅ 性能优化：请求缓存处理
  let rule: CacheOptions | null = null;
  const { newRule, cacheData } = cacheRequest.resolveCache<Full extends true ? AxiosResponse : P>(
    axiosConfig,
    strategy,
    ttl,
    cKey,
    httpConditionalCache
  );

  console.log('缓存数据：', cacheData);
  if (cacheData) {
    // 命中缓存，返回缓存数据
    return new Promise((resolve) => {
      resolve(cacheData);
    });
  }
  rule = newRule;

  // ✅ 性能优化： 同一页面重复请求上一个接口未响应取消上一个
  cancelRequest.cancelPreviousRequest(cKey, controller);

  // ✅ 性能优化：切换页面路由取消请求
  const rKey = `${url}_${Date.now()}`; // 每次路由切换请求 key 都不一样，保证每次路由切换都取消上一个路由的请求
  cancelRequest.addCurrentRequest(autoCancelRequests, rKey, controller);

  return httpInstance
    .request<P>(axiosConfig)
    .then(async (res) => {
      if (res.status === 304) {
        // ✅ 性能优化：http 协商缓存返回 304，即使本地缓存的数据过期但后台内容未变更，仍可直接使用缓存数据
        return cacheRequest.applyRemoteCache<Full extends true ? AxiosResponse : P>(
          cKey,
          rule?.strategy as 'memoryHttpCache' | 'localHttpCache' | 'sessionHttpCache'
        );
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
        // ✅ 性能优化四：请求成功后缓存数据
        cacheRequest.applyLocalCache<P>(
          cKey,
          rule as CacheOptions,
          res.headers as AxiosHeaders,
          data
        );

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
      cancelRequest.removeCurrentRequest(rKey);
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
    🟩 config: MyAxiosRequestConfig类型，为扩展后 axios 请求配置，包含：url、method、baseURL、headers，params、data、timeout、responseType、ignoreLoading、cancelOnRouteChange等。重点 💡ignoreLoading?: boolean 扩展字段，接口请求 pending 过程中控制全局 loading 显示与否的开关。如果某些请求是“静默”或低优先级的，全局 loading 会闪烁，影响用户体验。默认 true 不显示页面loading; 
    🟩 customizeOpt: CustomizeOpt & { fullResponseData?: Full } 类型，为自定义选项包括：💡autoCancelRequests?: boolean(路由切换时取消上个页面还在 pending 中的请求，默认 true 取消 pending 中的请求)、💡fullResponseData?: boolean(响应数据是否全量交给交互逻辑层，默认 false 非全量)、💡handleBusinessCode?: boolean(是否统一处理接口业务code状态码，默认 true 统一处理)、💡useBodyForDelete?: boolean(delete 请求参数是放在query还是body里面，默认 false 放在query)
  * 方法返回类型结构
    🟩 Promise<P>: 如果 fullResponseData = false（默认），返回接口实际数据结构（默认 CommonResponse<T>）
    🟩 Promise<AxiosResponse>: 如果 fullResponseData = true, 返回完整的 Axios 响应对象，包括：data、status、headers、config、statusText
*/
export const getMthod: Service = (url, params, config, customizeOpt) => {
  return request('get', url, params, config, customizeOpt);
};
export const postMthod: Service = (url, params, config, customizeOpt) => {
  return request('post', url, params, config, customizeOpt);
};
export const putMthod: Service = (url, params, config, customizeOpt) => {
  return request('put', url, params, config, customizeOpt);
};
export const deleteMthod: Service = (url, params, config, customizeOpt) => {
  return request('delete', url, params, config, customizeOpt);
};
export const patchMthod: Service = (url, params, config, customizeOpt) => {
  return request('patch', url, params, config, customizeOpt);
};
