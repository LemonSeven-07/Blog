/*
 * @Author: yolo
 * @Date: 2025-09-13 19:10:24
 * @LastEditors: yolo
 * @LastEditTime: 2025-11-11 00:58:00
 * @FilePath: /web/src/components/Header/Left.tsx
 * @Description: Header 子组件（系统 logo）
 */

import { memo, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button, Menu, type MenuProps } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import logo from '@/assets/images/logo.png';
import SidebarDrawer from '@/components/SidebarDrawer';

type MenuItem = Required<MenuProps>['items'][number];

interface HeaderLeftProps {
  systemName: string; // 系统名称
  menuItems: MenuItem[]; // 菜单项
  path: string; // logo 跳转路径
  width?: number; // 抽屉宽度（单位 rem），默认 13
}

const HeaderLeft = ({ systemName, menuItems, width = 13, path }: HeaderLeftProps) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  console.log('header 左子组件渲染', open);

  useEffect(() => {
    console.log('当前路由变化，关闭抽屉', open);
  }, []);

  return (
    <div className="header-left">
      <Button icon={<MenuOutlined />} onClick={() => setOpen(true)} />

      <NavLink to={path}>
        <img src={logo} alt={systemName} className="blog-logo" />
        <span className="blog-name">{systemName}</span>
      </NavLink>

      <SidebarDrawer placement="left" open={open} handleClose={() => setOpen(false)} width={width}>
        <div className="menu-nav-drawer">
          <div className="drawer-header">
            <NavLink to={path}>
              <img src={logo} alt={systemName} className="blog-logo" />
              <span className="blog-name">{systemName}</span>
            </NavLink>
          </div>

          <nav className="drawer-main">
            <Menu selectedKeys={[location.pathname]} mode="inline" items={menuItems} />
          </nav>
        </div>
      </SidebarDrawer>
    </div>
  );
};

export default memo(HeaderLeft);
