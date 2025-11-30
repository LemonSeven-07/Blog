import { http } from '@/api/http';
import type {
  RegisterAction,
  ResetPassword,
  SendEmailCode,
  LoginAction,
  AppInitResponse,
  ArticleCategory,
  UpdateUser,
  GetUsers
} from './types';

// 获取用户信息和页面路由（如果未获取到用户信息表示未登录态返回公共路由，如果获取到了用户信息表示登录态返回角色路由）
export const getAppInitData = () =>
  http.get<AppInitResponse>('/app/init', {}, {}, { autoCancelRequests: false });

// 注册
export const register = (params: RegisterAction['Request']) =>
  http.post<RegisterAction['Response']>('/auth/register', params);

// 发送邮箱验证码
export const sendEmailCode = (params: SendEmailCode['Request']) =>
  http.post('/auth/sendEmailCode', params);

// 重置密码
export const resetPassword = (params: ResetPassword['Request']) => http.post('/auth/reset', params);

// 登录
export const login = (params: LoginAction['Request']) =>
  http.post<LoginAction['Response']>('/auth/login', params);

// 退出登录
export const logout = () => http.post('/user/logout');

// 获取文章分类
export const getCategory = () => http.get<ArticleCategory['Response']>('/user/category');

export const updateUser = (params: UpdateUser['Request']) =>
  http.patch('/user/' + params.userId, params);

export const getUsers = (params: GetUsers['Request']) => http.get('/user/list', params);

export const deleteUser = (userId: number) => http.delete('/user/' + userId);
