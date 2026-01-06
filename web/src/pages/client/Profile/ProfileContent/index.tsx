/*
 * @Author: yolo
 * @Date: 2025-12-30 03:05:58
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-01 00:39:50
 * @FilePath: /web/src/pages/client/Profile/ProfileContent/index.tsx
 * @Description: 个人中心右侧操作区
 */

import { memo, useState } from 'react';
import { message, Tabs } from 'antd';
import type { userProfileFormValues, ChangePasswordProps, ChangeEmailProps } from '../types';
import BaseInfo from './BaseInfo';
import ChangePassword from './ChangePassword';
import ChangeEmail from './ChangeEmail';
import { useAppDispatch } from '@/store/hooks';
import { fetchAppInit } from '@/store/modules/user';
import api from '@/api';

const ProfileContent = ({
  withLoading
}: {
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}) => {
  const dispatch = useAppDispatch();

  /**
   * @description: 保存个人信息修改
   * @param {userProfileFormValues} values
   * @return {*}
   */
  const saveBaseInfo = async (values: userProfileFormValues) => {
    const res = await withLoading(api.userApi.updateUser(values));
    message.success(res.message);
    dispatch(fetchAppInit());
  };

  /**
   * @description: 保存密码修改
   * @param {object} values 表单值
   * @param {*} cb 表单重置回调
   * @return {*}
   */
  const saveChangePassword: ChangePasswordProps['handleSubmit'] = async (values, cb) => {
    const res = await withLoading(api.userApi.updatePasswrd(values));
    message.success(res.message);
    cb();
  };

  /**
   * @description: 保存邮箱修改
   * @param {*} values 表单值
   * @param {*} cb 表单重置回调
   * @return {*}
   */
  const saveChangeEmail: ChangeEmailProps['handleSubmit'] = async (values, cb) => {
    const res = await withLoading(api.userApi.updateEmail(values));
    message.success(res.message);
    cb();
  };

  const [tabItems] = useState([
    {
      label: '基本信息',
      key: '1',
      children: <BaseInfo handleSubmit={saveBaseInfo} />
    },
    {
      label: '修改密码',
      key: '2',
      children: <ChangePassword handleSubmit={saveChangePassword} />
    },
    {
      label: '更换邮箱',
      key: '3',
      children: <ChangeEmail handleSubmit={saveChangeEmail} />
    }
  ]);

  return (
    <div className="profile-content">
      <Tabs defaultActiveKey="1" centered items={tabItems} />
    </div>
  );
};

export default memo(ProfileContent);
