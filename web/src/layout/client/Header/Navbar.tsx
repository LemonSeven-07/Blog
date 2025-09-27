/*
 * @Author: yolo
 * @Date: 2025-09-15 10:09:16
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-27 19:00:42
 * @FilePath: /web/src/layout/client/Header/Navbar.tsx
 * @Description: header 导航栏
 */

import { useLocation, Link } from 'react-router-dom';
import { Menu, type MenuProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';

type MenuItem = Required<MenuProps>['items'][number];
const menuItems: MenuItem[] = [
  { label: <Link to="/">首页</Link>, key: '/' },
  { label: <Link to="/">生活随笔</Link>, key: '/1' },
  { label: <Link to="/">树洞</Link>, key: '/2' },
  { label: <Link to="/">留言墙</Link>, key: '/3' },
  {
    label: (
      <span>
        探索 <DownOutlined style={{ fontSize: 12, marginLeft: 4 }} />
      </span>
    ),
    key: '/article',
    children: [
      { key: '/article/5', label: <Link to="/article/5">Option 5</Link> },
      { key: '/article/6', label: <Link to="/article/6">Option 6</Link> },
      { key: '/article/7', label: <Link to="/article/7">Option 7</Link> },
      { key: '/article/8', label: <Link to="/article/8">Option 8</Link> }
    ]
  }
];

const Navbar = () => {
  console.log('header 导航栏渲染');
  const location = useLocation();
  return (
    <nav className="header-nav">
      <Menu selectedKeys={[location.pathname]} mode="horizontal" items={menuItems} />
    </nav>
  );
};

export default Navbar;
