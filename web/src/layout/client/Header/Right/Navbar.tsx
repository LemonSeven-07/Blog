/*
 * @Author: yolo
 * @Date: 2025-09-15 10:09:16
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-17 22:38:17
 * @FilePath: /Blog/web/src/layout/client/Header/Right/Navbar.tsx
 * @Description: header 导航栏
 */

import { useLocation, Link } from 'react-router-dom';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];
const menuItems: MenuItem[] = [{ label: <Link to="/">首页</Link>, key: '/' }];

const Navbar = () => {
  console.log('header 导航栏渲染');
  const location = useLocation();
  return (
    <nav>
      <Menu selectedKeys={[location.pathname]} mode="horizontal" items={menuItems} />
    </nav>
  );
};

export default Navbar;
