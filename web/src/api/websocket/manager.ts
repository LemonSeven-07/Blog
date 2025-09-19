/*
 * @Author: yolo
 * @Date: 2025-09-11 09:18:40
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-11 16:52:12
 * @FilePath: /Blog/web/src/api/websocket/manager.ts
 * @Description: WebSocket 管理器
 */

import type { WSMessage } from './types';
import { SubscriptionManager } from './subscription';
import { HeartbeatStrategy, RetryStrategy } from './strategies';

/** WebSocket 管理器 */
export class WebSocketManager {
  private ws?: WebSocket; // WebSocket 实例
  private readonly url: string; // 服务端地址
  private readonly subs = new SubscriptionManager(); // 订阅管理器
  private readonly heartbeat: HeartbeatStrategy; // 心跳策略
  private readonly retry = new RetryStrategy(); // 重连策略
  private reconnecting = false; // 是否正在重连
  private messageQueue: string[] = []; // 消息队列

  constructor(url: string) {
    this.url = url;
    // 心跳策略：定时发送 { action: "PING" }
    this.heartbeat = new HeartbeatStrategy(() => this.send({ action: 'PING' }));
  }

  /**
   * @description: 建立连接
   * @return {void}
   */
  connect(): void {
    this.ws = new WebSocket(this.url);

    // 连接成功
    this.ws.onopen = () => {
      console.log('✅ WebSocket 已连接');
      this.retry.reset(); // 重置重连计数
      this.heartbeat.start(); // 启动心跳

      // 把之前丢进队列的消息，逐条发出去
      this.messageQueue.forEach((msg) => this.ws?.send(msg));
      this.messageQueue = [];
    };

    // 收到消息
    this.ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        this.subs.dispatch(msg); // 分发给对应的订阅者
      } catch {
        console.error('❌ 无法解析消息:', event.data);
      }
    };

    // 连接关闭
    this.ws.onclose = () => {
      console.warn('⚠️ WebSocket 连接关闭');
      this.heartbeat.stop(); // 停止心跳
      this.scheduleReconnect(); // 启动重连
    };

    // 出错
    this.ws.onerror = () => {
      console.error('❌ WebSocket 出错');
      this.ws?.close(); // 出错时强制关闭，触发 onclose
    };
  }

  /**
   * @description: 主动关闭连接
   * @return {void}
   */
  close(): void {
    this.heartbeat.stop(); // 停止心跳
    this.ws?.close(); // 关闭连接
    this.ws = undefined;
    this.messageQueue = []; // 清空队列，避免内存泄漏
  }

  /**
   * @description: 发送消息（泛型约束 payload 类型）
   * @template {T} payload 类型
   * @param {WSMessage<T>} message
   * @return {void}
   */
  send<T>(message: WSMessage<T>): void {
    const data = JSON.stringify(message);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      console.warn('⚠️ WebSocket 未连接，消息加入队列:', message);
      this.messageQueue.push(data); // 缓存起来
    }
  }

  /**
   * @description: 订阅（返回取消订阅函数）
   * @template {T} 发送消息数据类型
   * @param {string} channel
   * @param {(payload: T) => void} cb
   * @return {void}
   */
  subscribe<T>(channel: string, cb: (payload: T) => void): () => void {
    const first = this.subs.add(channel, cb);
    if (first) this.send({ action: 'SUBSCRIBE', channel });
    return () => {
      const empty = this.subs.remove(channel, cb);
      if (empty) this.send({ action: 'UNSUBSCRIBE', channel });
    };
  }

  /**
   * @description: 调度重连
   * @return {void}
   */
  private scheduleReconnect(): void {
    if (this.reconnecting) return;
    const delay = this.retry.nextDelay();
    if (delay < 0) {
      console.warn('❌ WebSocket 已达到最大重连次数，不再重连');
      return;
    }
    this.reconnecting = true;
    console.log(`⏳ ${delay / 1000}s 后重连...`);
    setTimeout(() => {
      this.reconnecting = false;
      this.connect();
    }, delay);
  }
}
