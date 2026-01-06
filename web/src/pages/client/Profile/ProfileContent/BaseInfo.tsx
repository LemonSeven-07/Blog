/*
 * @Author: yolo
 * @Date: 2025-12-28 03:27:00
 * @LastEditors: yolo
 * @LastEditTime: 2025-12-31 04:25:03
 * @FilePath: /web/src/pages/client/Profile/ProfileContent/BaseInfo.tsx
 * @Description: 个人信息修改tab页
 */

import { useRef, useState } from 'react';
import { Button } from 'antd';
import { useAppSelector } from '@/store/hooks';
import BaseForm from '@/components/DynamicForm/BaseForm';
import type { DynamicFormItem, DynamicFormRef } from '@/components/DynamicForm/types';
import type { userProfileFormValues, BaseInfoProps } from '../types';

const BaseInfo = ({ handleSubmit }: BaseInfoProps) => {
  const userProfileFormRef = useRef<DynamicFormRef<userProfileFormValues>>(null); // 个人信息修改表单dom节点
  const { username } = useAppSelector((state) => state.userInfo); // 用户信息

  const [userProfileFormItems] = useState<DynamicFormItem[]>([
    {
      label: '用户名',
      name: 'username',
      type: 'input' as const,
      required: true,
      value: username
    }
  ]); // 个人信息修改表单项

  /**
   * @description: 保存个人信息修改
   * @param {userProfileFormValues} values
   * @return {*}
   */
  const save = (values: userProfileFormValues) => {
    if (values.username.trim() === username) return;
    handleSubmit(values);
  };

  /**
   * @description: 重置个人信息表单项和个人头像
   * @return {*}
   */
  const reset = () => {
    userProfileFormRef.current?.resetForm();
  };

  return (
    <div className="base-info-form" style={{ width: '23rem', margin: '0 auto' }}>
      <BaseForm
        layout={'horizontal'}
        formItems={userProfileFormItems}
        labelCol={6}
        wrapperCol={18}
        handleSubmit={save}
        ref={userProfileFormRef}
      >
        <Button type="primary" htmlType="submit" style={{ marginRight: '16px' }}>
          保存修改
        </Button>
        <Button onClick={reset}>重置</Button>
      </BaseForm>
    </div>
  );
};

export default BaseInfo;
