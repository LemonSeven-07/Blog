/*
 * @Author: yolo
 * @Date: 2025-09-13 19:10:24
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-28 18:11:26
 * @FilePath: /web/src/layout/client/Header/Left.tsx
 * @Description: Header 子组件（系统 logo）
 */

import { memo, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Button, Menu, type MenuProps } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

import logo from '@/assets/images/logo.png';
import { config } from '@/config';
import SidebarDrawer from '@/components/SidebarDrawer';

type MenuItem = Required<MenuProps>['items'][number];
const menuItems: MenuItem[] = [
  { label: <Link to="/">首页</Link>, key: '/' },
  { label: <Link to="/">生活随笔</Link>, key: '/1' },
  { label: <Link to="/">树洞</Link>, key: '/2' },
  { label: <Link to="/">留言墙</Link>, key: '/3' },
  {
    label: '探索',
    key: '/article',
    children: [
      { key: '/article/5', label: <Link to="/article/5">Option 5</Link> },
      { key: '/article/6', label: <Link to="/article/6">Option 6</Link> },
      { key: '/article/7', label: <Link to="/article/7">Option 7</Link> },
      { key: '/article/8', label: <Link to="/article/8">Option 8</Link> }
    ]
  }
];

const HeaderLeft = () => {
  console.log('header 左子组件渲染');
  const [open, setOpen] = useState(false);

  return (
    <div className="header-left">
      <Button icon={<MenuOutlined />} onClick={() => setOpen(true)} />

      <NavLink to="/">
        <img src={logo} alt="yolo's blog" className="blog-logo" />
        <span className="blog-name">{config.CLIENT_SYSTEM_NAME}</span>
      </NavLink>

      <SidebarDrawer placement="left" open={open} handleClose={() => setOpen(false)}>
        <div className="menu-nav-drawer">
          <div className="drawer-header">
            <NavLink to="/">
              <img src={logo} alt="yolo's blog" className="blog-logo" />
              <span className="blog-name">{config.CLIENT_SYSTEM_NAME}</span>
            </NavLink>
          </div>

          <nav className="drawer-main">
            <Menu
              selectedKeys={[location.pathname]}
              mode="inline"
              defaultOpenKeys={['/article']}
              items={menuItems}
            />
          </nav>
        </div>
      </SidebarDrawer>
    </div>
  );
};

export default memo(HeaderLeft);
