import { http } from '@/api/http';
import type {
  RegisterAction,
  ResetPassword,
  SendEmailCode,
  LoginAction,
  AppInitResponse,
  ArticleCategory,
  UpdateUser,
  GetUsers,
  UpdateAvatar,
  UpdatePasswrd,
  UpdateEmail
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

// 修改用户头像
export const updateAvatar = (params: UpdateAvatar['Request']) =>
  http.post('/user/avatar', params, {}, { autoCancelRequests: false });

// 修改用户基本信息
export const updateUser = (params: UpdateUser['Request']) => http.put('/user/profile', params);

// 修改密码
export const updatePasswrd = (params: UpdatePasswrd['Request']) =>
  http.put('/user/password', params);

// 更换邮箱
export const updateEmail = (params: UpdateEmail['Request']) => http.put('/user/email', params);

// 获取文章分类
export const getCategory = () => http.get<ArticleCategory['Response']>('/user/category');

// 获取用户列表
export const getUsers = (params: GetUsers['Request']) =>
  http.get<GetUsers['Response']>('/user/list', params);

// 删除用户
export const deleteUser = (params: { ids: number[] }) =>
  http.delete('/user', params, {}, { useBodyForDelete: true });

// 恢复删除用户
export const restoreUser = (params: { ids: number[] }) => http.put('/user/restore', params);
