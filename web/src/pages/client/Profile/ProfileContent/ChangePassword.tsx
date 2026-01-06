/*
 * @Author: yolo
 * @Date: 2025-12-28 04:04:28
 * @LastEditors: yolo
 * @LastEditTime: 2025-12-31 04:42:01
 * @FilePath: /web/src/pages/client/Profile/ProfileContent/ChangePassword.tsx
 * @Description: 修改密码tab页
 */

import { Form, Input, Button } from 'antd';
import type { ChangePasswordFormValues, ChangePasswordProps } from '../types';

const ChangePassword = ({ handleSubmit }: ChangePasswordProps) => {
  const [form] = Form.useForm();

  const onFinish = (values: ChangePasswordFormValues) => {
    const { oldPassword, newPassword } = values;
    handleSubmit({ oldPassword, newPassword }, () => form.resetFields());
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
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      colon={false}
      clearOnDestroy
      initialValues={{}}
    >
      {/* 当前密码 */}
      <Form.Item
        name="oldPassword"
        label="当前密码"
        rules={[
          { required: true, message: '请输入当前密码' },
          { min: 6, message: '密码至少为6个字符' }
        ]}
      >
        <Input.Password allowClear placeholder="请输入当前密码" />
      </Form.Item>

      {/* 新密码 */}
      <Form.Item
        name="newPassword"
        label="新密码"
        rules={[
          { required: true, message: '请输入密码' },
          {
            pattern: /^[a-zA-Z0-9!@#*,]{6,16}$/,
            message: '密码由字母、数字或特殊字符“!@#*,”组成，长度6-16位'
          }
        ]}
      >
        <Input.Password allowClear placeholder="请输入新密码" />
      </Form.Item>

      {/* 确认密码 */}
      <Form.Item
        name="confirmPassword"
        label="确认新密码"
        rules={[
          { required: true, message: '请再次输入密码' },
          {
            pattern: /^[a-zA-Z0-9!@#*,]{6,16}$/,
            message: '密码由字母、数字或特殊字符“!@#*,”组成，长度6-16位'
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('两次密码输入不一致'));
            }
          })
        ]}
      >
        <Input.Password allowClear placeholder="请确认新密码" />
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

export default ChangePassword;
