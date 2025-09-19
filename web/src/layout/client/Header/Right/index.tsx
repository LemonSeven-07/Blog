/*
 * @Author: yolo
 * @Date: 2025-09-13 19:10:44
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-18 01:06:37
 * @FilePath: /Blog/web/src/layout/client/Header/Right/index.tsx
 * @Description: header 子组件（header 导航栏）
 */

import { memo } from 'react';
import Navbar from './Navbar';
import HeaderIcons from './HeaderIcons';
import User from './User';

const Right = () => {
  console.log('header 右子组件渲染');

  return (
    <div className="header-right">
      {/* 导航栏 */}
      <Navbar />

      {/* blog 系统 github地址 */}
      <HeaderIcons />

      {/* 个人用户 或 登录注册 */}
      <User />
    </div>
  );
};

export default memo(Right);
