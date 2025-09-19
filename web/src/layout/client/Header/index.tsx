/*
 * @Author: yolo
 * @Date: 2025-09-13 19:10:08
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-15 10:35:04
 * @FilePath: /Blog/web/src/layout/client/Header/index.tsx
 * @Description: Header 组件
 */

import { memo } from 'react';
import Left from './Left';
import Middle from './Middle';
import Right from './Right';

const ClientHeader = () => {
  console.log('header 组件渲染');
  return (
    <div className="header-container">
      <Left />
      <Middle />
      <Right />
    </div>
  );
};

export default memo(ClientHeader);
