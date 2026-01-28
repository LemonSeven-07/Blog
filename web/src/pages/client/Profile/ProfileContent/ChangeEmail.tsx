/*
 * @Author: yolo
 * @Date: 2025-12-28 04:04:28
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-29 04:50:17
 * @FilePath: /web/src/pages/client/Profile/ProfileContent/ChangeEmail.tsx
 * @Description: 更换邮箱tab页
 */

import { useEffect, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import type { ChangeEmailProps, ChangeEmailFormValues } from '../types';
import api from '@/api';

const ChangeEmail = ({ handleSubmit }: ChangeEmailProps) => {
  const [form] = Form.useForm();
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  /**
   * @description: 发送邮箱验证码
   * @return {*}
   */
  const sendCode = async () => {
    form.validateFields(['email']).then(async () => {
      const res = await api.userApi.sendEmailCode({
        email: form.getFieldValue('email'),
        type: 'update'
      });
      message.success(res.message);
      setCountdown(60);
    });
  };

  const onFinish = (values: ChangeEmailFormValues) => {
    handleSubmit(values, () => form.resetFields());
  };

  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout="horizontal"
      style={{
        width: '23rem',
        margin: '0 auto',
        padding: '1rem'
      }}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      colon={false}
      clearOnDestroy
      initialValues={{ remember: true }}
    >
      <Form.Item
        name="password"
        label="当前密码"
        rules={[
          { required: true, message: '请输入当前密码' },
          { min: 6, message: '密码至少为6个字符' }
        ]}
      >
        <Input type="password" size="large" placeholder="请输入当前密码" />
      </Form.Item>

      <Form.Item
        name="email"
        label="新邮箱"
        rules={[
          { required: true, message: '请输入新邮箱' },
          { type: 'email', message: '邮箱格式不正确' }
        ]}
      >
        <Input size="large" placeholder="请输入新邮箱" />
      </Form.Item>

      <Form.Item
        name="code"
        label="验证码"
        rules={[{ required: true, message: '请输入邮箱验证码' }]}
      >
        <Input
          placeholder="请输入邮箱验证码"
          suffix={
            <Button type="link" size="small" disabled={countdown > 0} onClick={sendCode}>
              {countdown > 0 ? `${countdown}s` : '发送验证码'}
            </Button>
          }
        />
      </Form.Item>

      {/* 操作按钮 */}
      <Form.Item className="profile-form-footer-item">
        <Button type="primary" htmlType="submit" style={{ marginRight: '16px' }}>
          保存修改
        </Button>

        <Button onClick={() => form.resetFields()}>重置</Button>
      </Form.Item>
    </Form>
  );
};

export default ChangeEmail;
