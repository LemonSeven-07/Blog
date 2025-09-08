/*
 * @Author: yolo
 * @Date: 2025-09-08 15:52:20
 * @LastEditors: chenshijie
 * @LastEditTime: 2025-09-08 23:49:07
 * @FilePath: /Blog/web/src/api/http/types.ts
 * @Description: axios 相关类型定义
 */

import type { AxiosRequestConfig, AxiosResponse } from 'axios';

// 扩展 AxiosRequestConfig 类型
export interface MyAxiosRequestConfig extends AxiosRequestConfig {
  ignoreLoading?: boolean; // 是否触发全局 loading 加载状态，⭐️ 默认 false 触发
}

// http 请求方法类型
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

/**
 * @description: 通用 HTTP 请求函数类型
 *
 * @template: T 返回的数据类型（data）
 * @template: P 返回的业务数据类型，⭐️ 默认 CommonResponse<T>
 * @template: R 请求参数类型（query 或 body），⭐️ 默认 unknown
 * @template: Full 是否返回完整 AxiosResponse，⭐️ 默认 false
 *
 * @param: url 请求地址
 * @param: params 请求参数，可选
 * @param: config axios 请求配置，可选
 * @param: customizeOpt 自定义选项，可控制返回完整响应
 *
 * @returns 当 Full 为 true 时，返回 AxiosResponse；否则返回业务数据 P
 */
export type service = <T, P = CommonResponse<T>, R = unknown, Full extends boolean = false>(
  url: string,
  params?: R,
  config?: MyAxiosRequestConfig,
  customizeOpt?: CustomizeOpt & { fullResponseData?: Full }
) => Promise<Full extends true ? AxiosResponse : P>;

// 接口公共响应结构(对于特殊响应数据结构可自定义)
export interface CommonResponse<T> {
  code: string; // 业务状态码(‼️ 此 axios 封装是以业务 code === '200' 为成功处理逻辑的)
  message: string; // 业务消息
  data: T; // 业务数据
}

// 接口请求自定义配置参数
export interface CustomizeOpt extends CacheOptions {
  autoCancelRequests?: boolean; // 路由切换时取消上个页面还在 pending 中的请求，⭐️ 默认 true 取消 pending 中的请求
  fullResponseData?: boolean; // 响应数据是否全量交给交互逻辑层，⭐️ 默认 false 非全量
  handleBusinessCode?: boolean; // 是否统一处理业务 code，⭐️ 默认 true 统一处理
  useBodyForDelete?: boolean; // delete 请求是否使用 body 传参，⭐️ 默认 false 使用 params 传参
  httpConditionalCache?: 'none' | 'etag' | 'lastModified' | 'both'; // http 协商缓存配置， 根据配置传递相应的请求头信息，⭐️ 默认 none 不使用协商缓存
}

// http 缓存配置
export interface CacheOptions {
  strategy?: Strategy; // 缓存策略， ⭐️ 默认 'none'
  ttl?: number; // 缓存有效期 ms， ⭐️ 默认 0
  paramType?: 'number' | 'string'; // 动态路径参数的类型，⭐️ 默认 number(接口请求自定义配置中该配置无效，只在缓存规则中有效)
}

// 缓存值类型
export type CacheValue<T = unknown> = {
  data: T; // 缓存请求所需的响应数据
  expire: number; // 缓存过期时间戳
  etag?: string; // http 协商缓存 Etag
  lastModified?: string; // http 协商缓存 Last-Modified
};

// 缓存策略类型 默认 'none'
export type Strategy =
  | 'none' // 不缓存
  | 'memory' // 缓存在内存(JS 变量，页面刷新就没了)
  | 'local' // 浏览器本地缓存
  | 'session' // 浏览器会话缓存
  | 'localHttpCache' // http 协商缓存（Etag/Last-Modified）+ localStorage
  | 'sessionHttpCache' // http 协商缓存（Etag/Last-Modified） + sessionStorage
  | 'memoryHttpCache'; // http 协商缓存（Etag/Last-Modified） + 内存
