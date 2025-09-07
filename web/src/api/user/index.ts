import { http } from '@/utils/http';
import type { AuthAction, UpdateUser, GetUsers } from './user.types';

export const login = (params: AuthAction['Request']) => http.post<AuthAction['Response']>('/user/login', params);

export const register = (params: AuthAction['Request']) => http.post('/user/register', params);

export const updateUser = (params: UpdateUser['Request']) => http.patch('/user/' + params.userId, params);

export const getUsers = (params: GetUsers['Request']) => http.get('/user/list', params);

export const deleteUser = (userId: number) => http.delete('/user/' + userId);
