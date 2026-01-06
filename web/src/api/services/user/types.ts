import type { RouteItem } from '@/types/app/common';

export interface UserProfile {
  userId: number | null; // 用户 ID
  avatar: string; // 用户头像
  username: string; // 用户名
  role: number; // 用户权限
  email: string; // 用户邮箱
  banned: boolean; // 用户是否被禁言
  createdAt: string; // 用户注册时间
}

export interface RegisterAction {
  Request: {
    username: string;
    email: string;
    code: string;
    password: string;
  };
  Response: UserProfile;
}

export interface ResetPassword {
  Request: {
    email: string;
    code: string;
    password: string;
  };
}

export interface AppInitResponse {
  user: UserProfile | null;
  routes: RouteItem[];
}

export interface SendEmailCode {
  Request: {
    email: string;
    type: 'register' | 'reset' | 'update';
  };
}

export interface LoginAction {
  Request: {
    username?: string;
    email?: string;
    password: string;
  };
  Response: UserProfile;
}

export interface ArticleCategory {
  Response: {
    id: number;
    name: string;
    url: string;
  };
}

export interface UpdateUser {
  Request: {
    username?: string;
    role?: number;
    banned?: boolean;
  };
}

export interface GetUsers {
  Request: {
    pageNum: number;
    pageSize: number;
    username: string;
    rangeDate: string;
  };
}

export interface UpdateAvatar {
  Request: FormData;
}

export interface UpdatePasswrd {
  Request: {
    oldPassword: string;
    newPassword: string;
  };
}

export interface UpdateEmail {
  Request: {
    password: string;
    email: string;
    code: string;
  };
}
