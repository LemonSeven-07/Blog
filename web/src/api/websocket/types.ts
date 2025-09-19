/*
 * @Author: yolo
 * @Date: 2025-09-09 17:13:31
 * @LastEditors: chenshijie
 * @LastEditTime: 2025-09-11 09:21:05
 * @FilePath: /Blog/web/src/api/websocket/types.ts
 * @Description: WebSocket 消息类型定义
 */

/** WebSocket 消息动作类型 */
export type WSAction = 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'PING' | 'COMMENT' | 'CHAT';

/** WebSocket 消息结构（泛型约束 payload） */
export interface WSMessage<T = unknown> {
  action: WSAction; // 动作，例如 SUBSCRIBE、COMMENT
  channel?: string; // 频道，例如 article:123 / chat:room1
  payload?: T; // 消息数据
}
