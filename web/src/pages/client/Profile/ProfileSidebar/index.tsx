/*
 * @Author: yolo
 * @Date: 2025-12-30 03:04:50
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-01 00:37:59
 * @FilePath: /web/src/pages/client/Profile/ProfileSidebar/index.tsx
 * @Description: 个人中心左侧身份区
 */

import { memo, useRef } from 'react';
import dayjs from 'dayjs';
import { message } from 'antd';
import { UserOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchAppInit } from '@/store/modules/user';
import api from '@/api';

const ProfileSidebar = ({
  withLoading
}: {
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}) => {
  const { avatar, username, email, createdAt } = useAppSelector((state) => state.userInfo); // 用户信息
  const dispatch = useAppDispatch();

  const fileInputRef = useRef<HTMLInputElement>(null); // 文件输入dom节点

  /**
   * @description: 点击蒙层触发图像文件选择
   * @return {*}
   */
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * @description: 头像文件选择回调
   * @param {React.ChangeEvent<HTMLInputElement>} e 头像文件选择事件对象
   * @return {*}
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];
    if (!file) return;

    // 文件大小限制
    if (file.size / 1024 / 1024 > 2) {
      message.warning('头像大小不能超过 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    await withLoading(api.userApi.updateAvatar(formData));
    await dispatch(fetchAppInit());
  };

  return (
    <div className="profile-sidebar">
      <div className="profile-avatar">
        {avatar ? <img src={avatar} alt="" /> : <UserOutlined />}

        <div className="click-cover" onClick={handleAvatarClick}>
          <PlusCircleOutlined />
          <div style={{ fontSize: '0.75rem' }}>点击修改头像</div>
        </div>

        {/* 隐藏文件输入 */}
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      <div className="profile-username">{username}</div>

      <div className="profile-info">
        <div className="info-row">
          <span className="label">绑定邮箱：</span>
          <span className="value" title={email}>
            {email}
          </span>
        </div>

        <div className="info-row">
          <span className="label">注册时间：</span>
          <span className="value" title={createdAt}>
            {dayjs(createdAt).format('YYYY年M月D日')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default memo(ProfileSidebar);
