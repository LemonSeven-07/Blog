import { memo, useEffect, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import api from '@/api';
import { setUser } from '@/store/modules/user';
import { useAppDispatch } from '@/store/hooks';

interface LoginProps {
  handleRegister: () => void;
  onSwitchLogin: () => void;
}

interface FormValues {
  username: string;
  email: string;
  code: string;
  password: string;
  newPassword: string;
}

const RegisterForm = ({ handleRegister, onSwitchLogin }: LoginProps) => {
  const [countdown, setCountdown] = useState(0);

  const [form] = Form.useForm();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    return () => {
      setCountdown(0);
      form.resetFields();
    };
  }, []);

  const submit = async (values: FormValues) => {
    const { username, email, code, password } = values;

    const res = await api.userApi.register({ username, email, code, password });
    dispatch(setUser({ ...res.data, phase: 'initializing' }));
    message.success(res.message);

    handleRegister();
  };

  const sendCode = async () => {
    form.validateFields(['email']).then(async () => {
      const res = await api.userApi.sendEmailCode({
        email: form.getFieldValue('email'),
        type: 'register'
      });
      message.success(res.message);
      setCountdown(60);
    });
  };

  return (
    <>
      <Form
        name="register"
        form={form}
        initialValues={{ remember: true }}
        onFinish={submit}
        autoComplete="off"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '邮箱格式不正确' }
          ]}
        >
          <Input size="large" placeholder="邮箱" prefix={<MailOutlined />} />
        </Form.Item>

        <Form.Item name="code" rules={[{ required: true, message: '请输入邮箱验证码' }]}>
          <Input
            placeholder="请输入邮箱验证码"
            suffix={
              <Button type="link" size="small" disabled={countdown > 0} onClick={sendCode}>
                {countdown > 0 ? `${countdown}s` : '发送验证码'}
              </Button>
            }
          />
        </Form.Item>

        <Form.Item
          name="username"
          rules={[
            { required: true, message: '请输入用户名' },
            {
              pattern: /^[\u4e00-\u9fa5a-zA-Z0-9-_]{4,12}$/,
              message: '用户名由中文、字母、数字、下划线或减号组成，长度4-12位'
            }
          ]}
        >
          <Input size="large" placeholder="用户名" prefix={<UserOutlined />} />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            {
              pattern: /^[a-zA-Z0-9!@#*,]{6,16}$/,
              message: '密码由字母、数字或特殊字符“!@#*,”组成，长度6-16位'
            }
          ]}
        >
          <Input type="password" size="large" placeholder="密码" prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item
          name="newPassword"
          rules={[
            { required: true, message: '请再次输入密码' },
            {
              pattern: /^[a-zA-Z0-9!@#*,]{6,16}$/,
              message: '密码由字母、数字或特殊字符“!@#*,”组成，长度6-16位'
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次密码输入不一致'));
              }
            })
          ]}
        >
          <Input type="password" size="large" placeholder="确认密码" prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item style={{ marginBottom: '0.25rem' }}>
          <Button block type="primary" htmlType="submit">
            注册
          </Button>
        </Form.Item>

        <Form.Item style={{ marginBottom: '0.25rem' }}>
          <Button type="link" style={{ padding: 0 }} onClick={onSwitchLogin}>
            已有账号？去登录
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default memo(RegisterForm);
