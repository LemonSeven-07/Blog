/*
 * @Author: yolo
 * @Date: 2025-09-15 10:13:20
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-27 03:53:40
 * @FilePath: /web/src/layout/client/Header/Right.tsx
 * @Description: header 消息通知和 gitHub 地址
 */

import { memo, useMemo, useRef } from 'react';
import { Badge, Flex, Segmented, Dropdown, Button, Avatar, type MenuProps } from 'antd';
import {
  BellFilled,
  SunOutlined,
  MoonOutlined,
  UserOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useTheme } from '@/hooks/useTheme';

const HeaderRight = () => {
  console.log('HeaderRight渲染');

  const { isDark, toggleThemeByNode } = useTheme();
  const capsuleRef = useRef<HTMLDivElement>(null);
  const count = 100;
  const role = 2;
  const username = '1212';

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

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    console.log('点击个人头像选择下拉菜单', e);
  };

  const handleThemeChange = () => {
    toggleThemeByNode(capsuleRef.current);
  };

  return (
    <div className="header-right">
      <Button icon={<SearchOutlined />}>搜索文章...</Button>

      <Button icon={<SearchOutlined />} />

      <Flex gap="small" align="flex-start" vertical>
        <Segmented
          size="middle"
          shape="round"
          options={[
            { value: 'light', icon: <SunOutlined /> },
            { value: 'dark', icon: <MoonOutlined /> }
          ]}
          value={isDark ? 'dark' : 'light'}
          onChange={handleThemeChange}
          ref={capsuleRef}
        />
      </Flex>

      <Badge count={count}>
        <BellFilled className={`${count > 0 ? 'has-unread' : ''}`} />
      </Badge>

      {username.length ? (
        <Dropdown
          menu={{ items: dropDownItems, onClick: handleMenuClick }}
          trigger={['click']}
          placement="bottom"
          arrow={{ pointAtCenter: true }}
        >
          <Avatar size={34} icon={<UserOutlined />} />
        </Dropdown>
      ) : (
        <>
          <Button ghost color="primary" variant="outlined">
            登录
          </Button>
        </>
      )}
    </div>
  );
};

export default memo(HeaderRight);
