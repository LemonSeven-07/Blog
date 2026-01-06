/*
 * @Author: yolo
 * @Date: 2025-09-15 10:13:20
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-07 02:25:53
 * @FilePath: /web/src/components/Header/Right.tsx
 * @Description: header 消息通知和 gitHub 地址
 */

import { memo, useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge, Flex, Segmented, Button, Avatar, Modal, Popover, message, Divider } from 'antd';
import {
  BellFilled,
  SunOutlined,
  MoonOutlined,
  UserOutlined,
  SearchOutlined,
  LogoutOutlined,
  StarOutlined,
  LaptopOutlined
} from '@ant-design/icons';
import { useTheme } from '@/hooks/useTheme';
import SearchModal from '@/components/SearchModal';
import AuthModal from '@/components/AuthModal';
import { resetUser } from '@/store/modules/user';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import api from '@/api';

const HeaderRight = () => {
  console.log('HeaderRight渲染');
  const { role, userId, username, avatar } = useAppSelector((state) => state.userInfo);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleThemeByNode } = useTheme();
  const capsuleRef = useRef<HTMLDivElement>(null);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const count = 100;

  const content = (
    <div className="panel-content">
      <div className="panel-name">
        <strong>{username}</strong>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      <div className="panel-menu__content">
        <div className="panel-menu__item" onClick={() => handleMenuClick('profile')}>
          <UserOutlined />
          <span>个人中心</span>
        </div>

        <div className="panel-menu__item" onClick={() => handleMenuClick('favorites')}>
          <StarOutlined />
          <span>我的收藏</span>
        </div>

        {(role === 1 || role === 2) && (
          <div className="panel-menu__item" onClick={() => handleMenuClick('admin')}>
            <LaptopOutlined />
            <span>后台管理</span>
          </div>
        )}

        <div className="panel-menu__item" onClick={() => handleMenuClick('logout')}>
          <LogoutOutlined />
          <span>退出登录</span>
        </div>
      </div>
    </div>
  );

  // 点击搜索的文章后关闭对话框
  useEffect(() => {
    if (openSearchModal) {
      setOpenSearchModal(false);
    }
  }, [location.key]);

  /**
   * @description: 点击下拉菜单
   * @param {*} key 菜单 key
   * @return {*}
   */
  const handleMenuClick = async (key: 'profile' | 'favorites' | 'admin' | 'logout') => {
    console.log('点击个人头像选择下拉菜单', key);
    if (key === 'logout') {
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
    } else if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'favorites') {
      navigate('/favorites');
    } else if (key === 'admin') {
      navigate('/admin/dashboard');
    }
  };

  /**
   * @description: 切换主题
   * @return {*}
   */
  const handleThemeChange = () => {
    toggleThemeByNode(capsuleRef.current);
  };

  return (
    <div className="header-right">
      <Button icon={<SearchOutlined />} onClick={() => setOpenSearchModal(true)}>
        搜索文章...
      </Button>

      {openSearchModal && (
        <SearchModal open={openSearchModal} handleCancel={() => setOpenSearchModal(false)} />
      )}

      <Button icon={<SearchOutlined />} onClick={() => setOpenSearchModal(true)} />

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

      {userId && (
        <Badge count={count} onClick={() => navigate('/notify')}>
          <BellFilled className={`${count > 0 ? 'has-unread' : ''}`} />
        </Badge>
      )}

      {userId ? (
        <Popover
          content={content}
          trigger="hover"
          placement="bottom"
          classNames={{ root: 'user-propver-panel' }}
          getPopupContainer={() => document.body}
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
      ) : (
        <>
          <Button
            ghost
            color="primary"
            variant="outlined"
            onClick={() => setOpenAuthModal(true)}
            id="auth-button"
          >
            登录 | 注册
          </Button>
        </>
      )}

      {openAuthModal && (
        <AuthModal open={openAuthModal} handleCancel={() => setOpenAuthModal(false)} />
      )}
    </div>
  );
};

export default memo(HeaderRight);
