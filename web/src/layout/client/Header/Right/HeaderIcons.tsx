/*
 * @Author: yolo
 * @Date: 2025-09-15 10:13:20
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-25 20:11:23
 * @FilePath: /web/src/layout/client/Header/Right/HeaderIcons.tsx
 * @Description: header 消息通知和 gitHub 地址
 */

import { memo } from 'react';
import { Badge } from 'antd';
import { BellFilled } from '@ant-design/icons';

const HeaderIcons = () => {
  console.log('header 消息通知和 gitHub 地址渲染');
  const count = 100;
  return (
    <>
      {/* 消息通知 */}
      <div className="header-notify">
        <Badge count={count}>
          <BellFilled className={`${count > 0 ? 'has-unread' : ''}`} />
        </Badge>
      </div>
    </>
  );
};

export default memo(HeaderIcons);
