/*
 * @Author: yolo
 * @Date: 2025-09-11 09:18:11
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-11 16:58:54
 * @FilePath: /Blog/web/src/api/websocket/strategies.ts
 * @Description: 心跳 & 重连策略
 */

/** 心跳策略 */
export class HeartbeatStrategy {
  private timer?: number; // 心跳定时器 ID
  private readonly interval: number; // 心跳间隔（毫秒）
  private readonly sendPing: () => void; // 执行 ping 的函数

  constructor(sendPing: () => void, interval = 30000) {
    this.sendPing = sendPing; // 传入发送 ping 的方法
    this.interval = interval; // 默认 30s 一次
  }

  /**
   * @description: 启动心跳
   * @return {void}
   */
  start(): void {
    this.stop(); // 启动前先清理旧的定时器
    this.timer = window.setInterval(() => {
      this.sendPing(); // 定时发送 PING
    }, this.interval);
  }

  /**
   * @description: 停止心跳
   * @return {void}
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer); // 清理定时器
      this.timer = undefined;
    }
  }
}

/** 重连策略（指数退避） */
export class RetryStrategy {
  private attempt = 0; // 当前重连次数
  private readonly maxAttempt = 10; // 最大重连次数
  private readonly maxDelay: number; // 最大延迟时间
  private readonly baseDelay: number; // 初始延迟

  constructor(baseDelay = 1000, maxDelay = 30000) {
    this.baseDelay = baseDelay; // 默认 1s
    this.maxDelay = maxDelay; // 最大 30s
  }

  /**
   * @description: 获取下一次重连延迟时间
   * @return {number}
   */
  nextDelay(): number {
    if (this.attempt >= this.maxAttempt) return -1; // 超过次数返回 -1 表示停止重连
    const delay = Math.min(this.baseDelay * Math.pow(2, this.attempt), this.maxDelay);
    this.attempt++;
    return delay;
  }

  /**
   * @description: 重置重连计数
   * @return {void}
   */
  reset(): void {
    this.attempt = 0;
  }
}
