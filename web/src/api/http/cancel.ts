/*
 * @Author: yolo
 * @Date: 2025-09-08 15:52:04
 * @LastEditors: yolo
 * @LastEditTime: 2025-10-23 01:32:42
 * @FilePath: /web/src/api/http/cancel.ts
 * @Description: ✅ 性能优化：取消不必要的请求
 */

import type { AxiosRequestConfig } from 'axios';

class CancelRequest {
  // 存储当前正在进行的请求
  private currentRouteRequests = new Map<string, AbortController>();
  // 存储上一个路由未完成的请求
  private routeChangeRequests = new Map<string, AbortController>();

  /**
   * @description: 添加请求到集合中
   * @param {string} autoCancelRequests 自定义配置参数，路由切换时是否取消上个页面还在 pending 中的请求
   * @param {string} key 页面请求唯一 key
   * @param {AbortController} controller 中止请求控制器
   * @return {void}
   */
  addCurrentRequest(autoCancelRequests: boolean, key: string, controller: AbortController): void {
    if (autoCancelRequests) {
      this.routeChangeRequests.set(key, controller);
    }
  }

  /**
   * @description: 移除集合中的已完成的请求
   * @param {string} key 当前页面请求唯一 key
   * @return {void}
   */
  removeCurrentRequest(key: string): void {
    if (this.routeChangeRequests.has(key)) {
      this.routeChangeRequests.delete(key);
    }
  }

  /**
   * @description: 生成请求 key
   * @param {AxiosRequestConfig} config
   * @return {string} 请求唯一 key
   */
  getRequestKey(config: AxiosRequestConfig): string {
    const { method, url, params, data } = config;
    let tailStr: string = '';
    if (params) tailStr += JSON.stringify(params);
    if (data) tailStr += JSON.stringify(data);
    return `${method}-${url}` + `${tailStr ? '-' + tailStr : ''}`;
  }

  /**
   * @description: ✅ 性能优化： 当前页面重复请求上一个接口未响应取消上一个
   * @param {string} key 当前页面请求唯一 key
   * @param {AbortController} controller 中止请求控制器
   * @return {void}
   */
  cancelPreviousRequest(key: string, controller: AbortController): void {
    if (this.currentRouteRequests.has(key)) {
      this.currentRouteRequests.get(key)!.abort();
      this.currentRouteRequests.delete(key);
    }
    this.currentRouteRequests.set(key, controller);
  }

  /**
   * @description: ✅ 性能优化：切换页面路由取消上个页面所有 Pending 中的请求
   */
  cancelPendingRequests() {
    this.routeChangeRequests.forEach((controller) => controller.abort());
    this.routeChangeRequests.clear();
  }
}

export const cancelRequest = new CancelRequest();
