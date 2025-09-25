/*
 * @Author: yolo
 * @Date: 2025-09-15 10:09:16
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-25 01:19:38
 * @FilePath: /web/src/layout/client/Header/Right/Navbar.tsx
 * @Description: header 导航栏
 */

import { useLocation, Link } from 'react-router-dom';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];
const menuItems: MenuItem[] = [
  { label: <Link to="/">首页</Link>, key: '/' },
  { label: <Link to="/">生活随笔</Link>, key: '/1' },
  { label: <Link to="/">留言板</Link>, key: '/2' },
  { label: <Link to="/">关于我</Link>, key: '/3' },
  { label: <Link to="/">探索</Link>, key: '/4' }
];

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
