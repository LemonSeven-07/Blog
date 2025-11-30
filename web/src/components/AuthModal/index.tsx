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
