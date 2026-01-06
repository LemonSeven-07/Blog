/*
 * @Author: yolo
 * @Date: 2025-09-12 17:11:24
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-07 05:04:09
 * @FilePath: /web/src/layout/admin/index.tsx
 * @Description: 后台页面布局
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  UserOutlined,
  DesktopOutlined,
  LogoutOutlined,
  DashboardOutlined,
  FileOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, Popover, Avatar, Divider, Modal, message } from 'antd';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAutoCancelRequests } from '@/api/http';
import '@/assets/styles/admin.scss';
import { config } from '@/config';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setIsDark } from '@/store/modules/theme';
import { resetUser } from '@/store/modules/user';
import HeaderLeft from '@/components/Header/Left';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import api from '@/api';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label
  } as MenuItem;
}

interface IconMap {
  DashboardOutlined: JSX.Element;
  FileOutlined: JSX.Element;
  UserOutlined: JSX.Element;
}

const iconMap: IconMap = {
  DashboardOutlined: <DashboardOutlined />,
  FileOutlined: <FileOutlined />,
  UserOutlined: <UserOutlined />
};

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  console.log('后台管理 AdminLayout 渲染');

  useAutoCancelRequests();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { username, avatar } = useAppSelector((state) => state.userInfo);
  const { adminRoutes } = useAppSelector((state) => state.navigation);
  const [collapsed, setCollapsed] = useState(false);

  // 用来判断侧边栏是否在可视区域，动态调整内容区域的 margin-left
  const [ref, visible] = useIntersectionObserver<HTMLDivElement>();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = 'light';

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applySystemTheme = (isDark: boolean) => {
      dispatch(setIsDark(isDark));
    };

    // 页面首次加载时同步系统主题（优先于 localStorage）
    applySystemTheme(mediaQuery.matches);

    // 监听系统主题变化
    const handler = (e: MediaQueryListEvent) => {
      applySystemTheme(e.matches);
    };

    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const item: MenuItem[] = useMemo(
    () =>
      adminRoutes.map((route) =>
        getItem(
          <Link to={route.path}>{route.meta.title}</Link>,
          '/admin/' + route.path,
          iconMap[route.meta.icon as keyof typeof iconMap]
        )
      ),
    [adminRoutes]
  );

  const content = (
    <div className="panel-content">
      <div className="panel-name">
        <strong>{username}</strong>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      <div className="panel-menu__content">
        <div className="panel-menu__item" onClick={() => handleMenuClick('client')}>
          <DesktopOutlined />
          <span>返回前台</span>
        </div>

        <div className="panel-menu__item" onClick={() => handleMenuClick('logout')}>
          <LogoutOutlined />
          <span>退出登录</span>
        </div>
      </div>
    </div>
  );

  const handleMenuClick = async (key: 'client' | 'logout') => {
    if (key === 'client') {
      navigate('/');
    } else if (key === 'logout') {
      Modal.confirm({
        title: '系统提示',
        content: '您确定要退出当前账号吗?',
        okText: '确认',
        cancelText: '取消',
        async onOk() {
          const res = await api.userApi.logout();
          if (res.code === '200') {
            // 清除 cookies 中存储的 refresh_token
            document.cookie = 'refresh_token=; max-age=0; path=/;';
            // 清除 token
            localStorage.removeItem('token');
            // 断开 socket 连接

            message.success(res.message);
            // 重置用户信息
            dispatch(resetUser());
            // 重定向到首页
            navigate('/', { replace: true });
          }
        },
        onCancel() {}
      });
    }
  };

  return (
    <Layout className="admin-app-container">
      <Header className="admin-header-container">
        <HeaderLeft
          systemName={config.ADMIN_SYSTEM_NAME}
          menuItems={item}
          path="/admin/dashboard"
        />

        <Popover
          content={content}
          trigger="hover"
          placement="bottom"
          classNames={{ root: 'user-propver-panel' }}
          getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
        >
          {avatar ? (
            <img
              src={avatar}
              alt=""
              style={{
                width: '44px',
                height: '44px',
                objectFit: 'cover',
                borderRadius: '50%',
                margin: '0 0.75rem'
              }}
            />
          ) : (
            <Avatar size={44} icon={<UserOutlined />} />
          )}
        </Popover>
      </Header>

      <Layout className="admin-app-main">
        <Sider
          ref={ref}
          width={200}
          className="admin-app-sider"
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderInlineEnd: 0 }}
            items={item}
          />
        </Sider>

        <Layout
          style={{
            padding: 16,
            marginLeft: visible ? (collapsed ? 80 : 200) : 0,
            marginTop: 64,
            overflowX: 'hidden'
          }}
        >
          <Content
            style={{
              margin: 0,
              minHeight: 280
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
