import { useEffect, useState } from 'react';
import { WebSocketManager } from './manager';
import { WebSocketSingleton } from './singleton';

/**
 * React Hook：获取全局 WebSocketManager
 * 根据用户登录状态决定是否创建连接
 */
export function useWebSocket(userId?: string, token?: string): WebSocketManager | null {
  // 初始获取单例
  const [manager, setManager] = useState<WebSocketManager | null>(() =>
    WebSocketSingleton.getInstance(userId, token)
  );

  // 监听 userId 和 token 变化（登录/登出）
  useEffect(() => {
    const ws = WebSocketSingleton.getInstance(userId, token);
    setManager(ws);

    return () => {
      // 用户退出登录时销毁 WebSocket
      if (!userId || !token) {
        WebSocketSingleton.destroy();
        setManager(null);
      }
    };
  }, [userId, token]);

  return manager;
}
