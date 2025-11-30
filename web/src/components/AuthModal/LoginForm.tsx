import { memo, useEffect } from 'react';
import { Form, Input, Button, Flex, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import api from '@/api';
import { setUser } from '@/store/modules/user';
import { useAppDispatch } from '@/store/hooks';

interface LoginProps {
  closeModal: () => void;
  onSwitchRegister: () => void;
  onSwitchReset: () => void;
}

interface FormValues {
  account: string;
  password: string;
}

const LoginForm = ({ closeModal, onSwitchRegister, onSwitchReset }: LoginProps) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();

  useEffect(() => {
    return () => {
      form.resetFields();
    };
  }, []);

  const handleLogin = async (values: FormValues) => {
    const { account, password } = values;
    const params = {
      password
    };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account)) {
      Object.assign(params, { email: account });
    } else {
      Object.assign(params, { username: account });
    }

    const res = await api.userApi.login(params);
    dispatch(setUser({ ...res.data, phase: 'initializing' }));
    message.success(res.message);
    closeModal();
  };

  return (
    <>
      <Form name="login" form={form} initialValues={{ remember: true }} onFinish={handleLogin}>
        <Form.Item name="account" rules={[{ required: true, message: '请输入用户名/邮箱' }]}>
          <Input size="large" placeholder="用户名/邮箱" prefix={<UserOutlined />} />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input type="password" size="large" placeholder="密码" prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item style={{ marginBottom: '0.25rem' }}>
          <Button block type="primary" htmlType="submit">
            登录
          </Button>
        </Form.Item>

        <Form.Item style={{ marginBottom: '0.25rem' }}>
          <Flex justify="space-between" align="center">
            <Button type="link" style={{ padding: 0 }} onClick={onSwitchRegister}>
              没有账号？立即注册
            </Button>
            <Button type="link" style={{ padding: 0 }} onClick={onSwitchReset}>
              忘记密码
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    </>
  );
};

export default memo(LoginForm);
