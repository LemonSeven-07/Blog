/*
 * @Author: yolo
 * @Date: 2025-09-08 15:51:53
 * @LastEditors: chenshijie
 * @LastEditTime: 2025-09-08 23:28:25
 * @FilePath: /Blog/web/src/api/http/cache.ts
 * @Description: ✅ 性能优化：请求缓存处理
 */

import type { AxiosHeaders } from 'axios';

import type { CacheValue, CacheOptions, MyAxiosRequestConfig, Strategy } from './types';
import { cacheRules } from './cacheRules';

// 缓存处理类
class Cache {
  // 存储每个接口请求的缓存
  private memory = new Map<string, CacheValue>();

  /**
   * @description: 获取缓存
   * @param {string} key 请求唯一 key
   * @param {Strategy} type 缓存类型
   * @return {CacheValue | null} 缓存数据或 null
   */
  private get(key: string, type: Strategy): CacheValue | null {
    let obj: CacheValue | null = null;
    if (/local/g.test(type)) {
      obj = JSON.parse(localStorage.getItem(key) || 'null');
    } else if (/session/g.test(type)) {
      obj = JSON.parse(sessionStorage.getItem(key) || 'null');
    } else if (/memory/g.test(type)) {
      obj = this.memory.get(key) || null;
    }
    if (!obj) return null;
    if (obj.expire > Date.now() || /HttpCache/g.test(type)) return obj;
    if (!/HttpCache/g.test(type)) {
      if (type === 'memory') this.memory.delete(key);
      if (type === 'local') localStorage.removeItem(key);
      if (type === 'session') sessionStorage.removeItem(key);
    }
    return null;
  }

  /**
   * @description: 设置缓存
   * @param {string} key 请求唯一 key
   * @param {Strategy} type 缓存类型
   * @param {CacheValue} data 缓存数据
   * @return {void}
   */
  private set(key: string, type: Strategy, data: CacheValue): void {
    if (/local/g.test(type)) {
      localStorage.setItem(key, JSON.stringify(data));
    } else if (/session/g.test(type)) {
      sessionStorage.setItem(key, JSON.stringify(data));
    } else if (/memory/g.test(type)) {
      this.memory.set(key, data);
    }
  }

  /**
   * @description: 匹配缓存规则
   * @param {string} str 请求的 method + url
   * @return {CacheOptions | null} 匹配到的缓存规则或 null
   */
  private matchCacheRule(str: string): CacheOptions | null {
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

  /**
   * @description: 解析缓存
   * @template T 缓存数据类型
   * @param {MyAxiosRequestConfig} axiosConfig axios 请求配置
   * @param {Strategy} strategy 自定义缓存策略
   * @param {number} ttl 自定义缓存有效期
   * @param {string} key 请求唯一 key
   * @param {'none' | 'etag' | 'lastModified' | 'both'} httpConditionalCache http 协商缓存类型
   * @return {{ newRule: CacheOptions | null; cacheData: T | null }} 解析后的数据类型
   */
  resolveCache<T>(
    axiosConfig: MyAxiosRequestConfig,
    strategy: Strategy,
    ttl: number,
    key: string,
    httpConditionalCache: 'none' | 'etag' | 'lastModified' | 'both'
  ): { newRule: CacheOptions | null; cacheData: T | null } {
    const { url, method, headers } = axiosConfig;
    let rule: CacheOptions | null = null;
    let cacheData: T | null = null;
    // 判断请求头是否设置了 http 强缓存
    if (!headers || (headers && (headers['Cache-Control'] === 'no-cache' || !headers['Cache-Control']))) {
      // 没有设置 http 强缓存，则判断是否有缓存规则(优先自定义配置，其次是预设规则)
      if (strategy !== 'none') rule = { strategy, ttl };
      if (!rule) rule = this.matchCacheRule((method as string) + url);
      if (rule && rule.strategy !== 'none') {
        const entry = this.get(key, rule.strategy as Strategy);
        if (/HttpCache/g.test(rule.strategy as string)) {
          if (entry) {
            // 命中缓存，判断是否过期
            const { data, etag, lastModified, expire = 0 } = entry;
            if (Date.now() < expire) {
              // 未过期，返回缓存数据
              cacheData = data as T;
            } else {
              // 没有缓存或者缓存过期, 设置 http 协商缓存请求头并正常请求
              if (!axiosConfig.headers) axiosConfig.headers = {};
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
        } else {
          // 命中缓存，返回缓存数据
          if (entry) cacheData = entry.data as T;
        }
      }
    }
    return { newRule: rule, cacheData };
  }

  /**
   * @description: HTTP code 为304时表示 http 协商缓存虽然本地缓存过期但后台内容未变更，仍可直接使用缓存数据
   * @template T 缓存数据类型
   * @param {string} key 请求唯一 key
   * @param {'memoryHttpCache' | 'localHttpCache' | 'sessionHttpCache'} type 缓存类型
   * @return {CacheValue} 缓存数据类型
   */
  applyRemoteCache<T>(key: string, type: 'memoryHttpCache' | 'localHttpCache' | 'sessionHttpCache'): T {
    return this.get(key, type)?.data as T;
  }

  /**
   * @description: 请求成功后根据缓存类型缓存数据
   * @template T 接口响应数据类型
   * @param {string} key 请求唯一 key
   * @param {CacheOptions} rule 缓存规则
   * @param {AxiosHeaders} headers 响应头
   * @param {T} data 接口响应数据
   * @return {void}
   */
  applyLocalCache<T>(key: string, rule: CacheOptions, headers: AxiosHeaders, data: T): void {
    if (rule && rule.strategy !== 'none') {
      if (/HttpCache/g.test(rule.strategy as string)) {
        // ✳️ 存储 http 协商缓存相关字段
        const cacheEntry: CacheValue = {
          data,
          expire: Date.now() + (rule.ttl || 0)
        };
        if (headers['etag']) cacheEntry.etag = headers['etag'];
        if (headers['last-modified']) cacheEntry.lastModified = headers['last-modified'];

        this.set(key, rule.strategy as Strategy, cacheEntry);
      } else {
        this.set(key, rule.strategy as Strategy, {
          data,
          expire: Date.now() + (rule.ttl || 0)
        });
      }
    }
  }
}

export const cache = new Cache();
