/*
 * @Author: yolo
 * @Date: 2025-09-13 19:10:08
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-27 01:10:43
 * @FilePath: /web/src/layout/client/Header/index.tsx
 * @Description: Header 组件
 */

import { memo } from 'react';
import Left from './Left';
import Navbar from './Navbar';
import Right from './Right';

const ClientHeader = () => {
  console.log('header 组件渲染');
  return (
    <div className="header-container">
      <Left />
      <Navbar />
      <Right />
    </div>
  );
};

export default memo(ClientHeader);
