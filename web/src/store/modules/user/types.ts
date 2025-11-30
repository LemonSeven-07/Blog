export interface UserState {
  userId: number | null; // 用户 ID
  avatar: string; // 用户头像
  username: string; // 用户名
  role: number; // 用户权限
  email: string; // 用户邮箱
  banned: boolean; // 用户是否被禁言
  phase: 'initializing' | 'guest' | 'authenticated'; // 标识当前身份阶段和驱动初始化逻辑
}
