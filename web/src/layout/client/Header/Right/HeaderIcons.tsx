/*
 * @Author: yolo
 * @Date: 2025-09-15 10:13:20
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-18 14:22:44
 * @FilePath: /Blog/web/src/layout/client/Header/Right/HeaderIcons.tsx
 * @Description: header 消息通知和 gitHub 地址
 */

import { memo } from 'react';
import { Badge } from 'antd';
import { GithubFilled, BellFilled } from '@ant-design/icons';

import { config } from '@/config';

const HeaderIcons = () => {
  console.log('header 消息通知和 gitHub 地址渲染');
  const count = 100;
  const handleGitHubClick = () => {
    window.open(config.GITHUB_URL, '_blank', 'noopener,noreferrer');
  };
  return (
    <>
      {/* 消息通知 */}
      <div className="header-notify">
        <Badge count={count}>
          <BellFilled
            style={{
              color: count > 0 ? 'rgba(0, 0, 0, .88)' : 'rgba(0, 0, 0, .4)'
            }}
          />
        </Badge>
      </div>

      {/* blog 系统 github地址 */}
      <div className="header-github">
        <GithubFilled onClick={handleGitHubClick} />
      </div>
    </>
  );
};

export default memo(HeaderIcons);
