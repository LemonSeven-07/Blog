import { memo, useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import api from '@/api';

interface ResetProps {
  onSwitchLogin: () => void;
}
interface FormValues {
  email: string;
  code: string;
  password: string;
  newPassword: string;
}

const ResetForm = ({ onSwitchLogin }: ResetProps) => {
  const [form] = Form.useForm();
  const [countdown, setCountdown] = useState(0);

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

  const sendCode = () => {
    form.validateFields(['email']).then(async () => {
      const res = await api.userApi.sendEmailCode({
        email: form.getFieldValue('email'),
        type: 'reset'
      });
      message.success(res.message);
      setCountdown(60);
    });
  };

  const submit = async (values: FormValues) => {
    const { email, code, password } = values;
    const res = await api.userApi.resetPassword({ email, code, password });
    message.success(res.message);
    onSwitchLogin();
  };

  return (
    <>
      <Form
        name="reset"
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
          <Input size="large" placeholder="注册邮箱" prefix={<MailOutlined />} />
        </Form.Item>

        <Form.Item name="code" rules={[{ required: true, message: '请输入验证码' }]}>
          <Input
            placeholder="请输入验证码"
            suffix={
              <Button type="link" size="small" disabled={countdown > 0} onClick={sendCode}>
                {countdown > 0 ? `${countdown}s` : '发送验证码'}
              </Button>
            }
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少 6 位' }
          ]}
        >
          <Input type="password" size="large" placeholder="密码" prefix={<LockOutlined />} />
        </Form.Item>

        <Form.Item
          name="newPassword"
          rules={[
            { required: true, message: '请再次输入密码' },
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
          <Button type="primary" htmlType="submit" block>
            确认重置
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

export default memo(ResetForm);
