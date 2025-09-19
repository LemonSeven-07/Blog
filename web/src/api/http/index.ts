/*
 * @Author: yolo
 * @Date: 2025-09-08 15:51:21
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-18 10:39:29
 * @FilePath: /Blog/web/src/api/http/index.ts
 * @Description: 对外统一导出方法。axios 封装包含：自动添加 token、更新 token、取消不必要的请求、缓存接口请求、页面 loading
 */

import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

import type { MyAxiosRequestConfig } from './types';
import { store } from '@/store';
import { startLoading, stopLoading } from '@/store/modules/loading';
import { getMthod, postMthod, putMthod, deleteMthod, patchMthod } from './request';
import { config } from '@/config';

/* 创建 axios 实例 */
export const httpInstance: AxiosInstance = axios.create({
  baseURL: config.AXIOS_BASE_URL,
  timeout: config.AXIOS_TIMEOUT
});

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

// 请求拦截
httpInstance.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig & { ignoreLoading?: boolean }
  ): InternalAxiosRequestConfig & { ignoreLoading?: boolean } => {
    // 如果 config.ignoreLoading 为 true，则不触发全局 loading
    if (!config.ignoreLoading) {
      store.dispatch(startLoading());
    }

    // 携带 token 请求头
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
  (
    response: AxiosResponse & { config: MyAxiosRequestConfig }
  ): AxiosResponse & { config: MyAxiosRequestConfig } => {
    if (!response.config.ignoreLoading) {
      store.dispatch(stopLoading());
    }

    // 接口可能会返回新的 token，更新本地存储的 token
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

    // 处理请求失败
    if ((error as AxiosError).response) {
      const status = (error as AxiosError).response?.status;
      if (status && httpExceptionCode[status]) {
        if (status === 401) {
          localStorage.removeItem('token');
          message.warning(httpExceptionCode[status]);
        } else {
          message.error(httpExceptionCode[status]);
        }
      } else {
        message.error('请求错误' + `(${status})`);
      }
    } else {
      const { message: msg } = error;
      if (msg) {
        message.error(msg);
      } else {
        message.error('请求错误');
      }
    }

    return Promise.reject(error);
  }
);

export const http = {
  get: getMthod,
  post: postMthod,
  put: putMthod,
  delete: deleteMthod,
  patch: patchMthod
};

export * from './cancel';
export * from './useAutoCancelRequests';
