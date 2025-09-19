/*
 * @Author: yolo
 * @Date: 2025-09-15 10:09:58
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-18 01:16:02
 * @FilePath: /Blog/web/src/layout/client/Header/Right/User.tsx
 * @Description: header 个人信息入口
 */

import { memo, useMemo } from 'react';
import { Dropdown, Avatar, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const User = () => {
  console.log('header 个人信息入口渲染');
  const role = 1;
  const username = '';

  // 动态生成菜单
  const dropDownItems = useMemo<MenuProps['items']>(
    () => [
      ...(role === 2
        ? [
            { label: '导入文章', key: 'import' },
            { label: '后台管理', key: 'backstage' }
          ]
        : []),
      { label: '退出登录', key: 'logout' }
    ],
    [role]
  );

  const handleUserMenuClick: MenuProps['onClick'] = (e) => {
    console.log('点击个人头像选择下拉菜单', e);
  };

  return (
    <>
      <div className="header-user">
        {username.length ? (
          <Dropdown
            menu={{ items: dropDownItems, onClick: handleUserMenuClick }}
            trigger={['click']}
            placement="bottom"
            arrow={{ pointAtCenter: true }}
          >
            <Avatar size={34} icon={<UserOutlined />} />
          </Dropdown>
        ) : (
          <>
            <Button ghost color="primary" variant="outlined" style={{ marginRight: 16 }}>
              登录
            </Button>
            <Button ghost color="danger" variant="outlined">
              注册
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export default memo(User);
