/*
 * @Author: yolo
 * @Date: 2025-12-25 01:41:19
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-01 00:36:24
 * @FilePath: /web/src/pages/client/Profile/index.tsx
 * @Description: 个人中心页
 */

import { Spin } from 'antd';
import ProfileSidebar from './ProfileSidebar';
import ProfileContent from './ProfileContent';
import { useLocalLoading } from '@/hooks/useLocalLoading';

const Profile = () => {
  const [loading, withLoading] = useLocalLoading();

  return (
    <Spin spinning={loading} wrapperClassName="profile-container">
      <ProfileSidebar withLoading={withLoading} />
      <ProfileContent withLoading={withLoading} />
    </Spin>
  );
};

export default Profile;
