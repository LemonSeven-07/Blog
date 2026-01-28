/*
 * @Author: yolo
 * @Date: 2025-10-03 16:05:51
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-13 01:16:36
 * @FilePath: /web/src/components/AuthModal/index.tsx
 * @Description: 登录/注册模态框
 */
import { memo, useState } from 'react';
import { Modal } from 'antd';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ResetForm from './ResetForm';

interface ModalProps {
  open: boolean;
  handleCancel: () => void;
}

const AuthModal = ({ open, handleCancel }: ModalProps) => {
  console.log('登录/注册页面');
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'reset'

  /**
   * @description: 关闭模态框
   * @return {*}
   */
  const closeModal = () => {
    setMode('login');
    handleCancel();
  };

  return (
    <>
      <Modal
        title={mode === 'login' ? '登录' : mode === 'register' ? '注册' : '重置密码'}
        width={400}
        classNames={{
          content: 'auth-modal',
          header: 'auth-modal-header',
          body: 'auth-modal-body'
        }}
        closable={{ 'aria-label': '关闭登录/注册对话框按钮' }}
        open={open}
        footer={null}
        maskClosable={false}
        onCancel={closeModal}
        destroyOnHidden
      >
        {mode === 'login' && (
          <LoginForm
            closeModal={() => handleCancel()}
            onSwitchRegister={() => setMode('register')}
            onSwitchReset={() => setMode('reset')}
          />
        )}

        {mode === 'register' && (
          <RegisterForm
            handleRegister={() => closeModal()}
            onSwitchLogin={() => setMode('login')}
          />
        )}

        {mode === 'reset' && <ResetForm onSwitchLogin={() => setMode('login')} />}
      </Modal>
    </>
  );
};

export default memo(AuthModal);
