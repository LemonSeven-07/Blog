import { WebSocketManager } from './manager';
import { config } from '@/config';

/** WebSocket 单例管理器（绑定登录用户） */
class WebSocketSingleton {
  private static instance: WebSocketManager | null = null;

  /**
   * @description: 获取 WebSocketManager 实例
   * @param {string} userId 用户 ID
   * @param {string} token 登录 token
   * @return {WebSocketManager | null}
   */
  static getInstance(userId?: string, token?: string): WebSocketManager | null {
    if (!userId || !token) return null; // 未登录不创建连接

    if (!WebSocketSingleton.instance) {
      WebSocketSingleton.instance = new WebSocketManager(config.WEBSOCKET_URL + `?token=${token}`);
      WebSocketSingleton.instance.connect();
      console.log('✅ WebSocket 单例已创建并连接');
    }
    return WebSocketSingleton.instance;
  }

  /**
   * @description: 销毁 WebSocketManager
   * @return {void}
   */
  static destroy(): void {
    if (WebSocketSingleton.instance) {
      WebSocketSingleton.instance.close();
      WebSocketSingleton.instance = null;
      console.log('🛑 WebSocket 单例已关闭');
    }
  }
}

export { WebSocketSingleton };
