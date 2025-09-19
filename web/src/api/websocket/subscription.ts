/*
 * @Author: yolo
 * @Date: 2025-09-09 17:46:51
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-11 09:24:52
 * @FilePath: /Blog/web/src/api/websocket/subscription.ts
 * @Description: 订阅管理器
 */

import type { WSMessage } from './types';

/** 订阅回调函数类型（泛型确保 payload 类型安全） */
export type SubscriptionCallback<T> = (payload: T) => void;

/** 订阅管理器 */
export class SubscriptionManager {
  // 存储订阅关系：频道 → 回调集合
  private subscriptions: Map<string, Set<SubscriptionCallback<unknown>>> = new Map();

  /** 添加订阅 */
  add<T>(channel: string, callback: SubscriptionCallback<T>): boolean {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    const callbacks = this.subscriptions.get(channel)!;
    callbacks.add(callback as SubscriptionCallback<unknown>);
    // 返回是否是首次订阅（用来决定是否通知服务端）
    return callbacks.size === 1;
  }

  /** 移除订阅 */
  remove<T>(channel: string, callback: SubscriptionCallback<T>): boolean {
    const callbacks = this.subscriptions.get(channel);
    if (!callbacks) return false;
    callbacks.delete(callback as SubscriptionCallback<unknown>);
    // 返回是否已经没有订阅者了
    if (callbacks.size === 0) {
      this.subscriptions.delete(channel);
      return true;
    }
    return false;
  }

  /** 分发消息 */
  dispatch<T>(msg: WSMessage<T>) {
    if (!msg.channel) return;
    const callbacks = this.subscriptions.get(msg.channel);
    if (!callbacks) return;
    callbacks.forEach((cb) => (cb as SubscriptionCallback<T>)(msg.payload as T));
  }
}
