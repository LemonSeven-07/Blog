/*
 * @Author: yolo
 * @Date: 2025-09-13 19:10:24
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-15 10:01:00
 * @FilePath: /Blog/web/src/layout/client/Header/Left.tsx
 * @Description: Header 子组件（系统 logo）
 */

import { memo } from 'react';
import { NavLink } from 'react-router-dom';

import logo from '@/assets/images/logo.png';
import { config } from '@/config';

const Left = () => {
  console.log('header 左子组件渲染');
  return (
    <div className="header-left">
      <NavLink to="/">
        <img src={logo} alt="yolo's blog" className="blog-logo" />
        <span className="blog-name">{config.CLIENT_SYSTEM_NAME}</span>
      </NavLink>
    </div>
  );
};

export default memo(Left);
