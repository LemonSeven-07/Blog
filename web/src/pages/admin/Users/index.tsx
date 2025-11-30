/*
 * @Author: yolo
 * @Date: 2025-09-12 10:04:30
 * @LastEditors: yolo
 * @LastEditTime: 2025-11-30 20:57:04
 * @FilePath: /web/src/pages/admin/Users/index.tsx
 * @Description: 用户管理页面
 */

import { memo, useEffect, useRef } from 'react';
import DynamicForm from '@/components/DynamicForm';
import type { DynamicFormItem, DynamicFormRef } from '@/types/app/common';

const formItems: DynamicFormItem[] = [
  {
    label: '文章标题',
    name: 'title',
    type: 'input' as const,
    // required: true,
    pattern: /^.{4,50}$/,
    tip: '文章标题长度应在4-50个字符之间!',
    onBlur: (value, key) => {
      console.log('onBlur', value, key);
    }
  },
  {
    label: '文章摘要',
    name: 'summary',
    type: 'textarea' as const,
    // required: true,
    pattern: /^.{16,150}$/,
    tip: '输入长度必须大于等于16字符小于等于150字符',
    rows: { minRows: 3 },
    maxLength: 150
  },
  {
    label: '文章分类',
    name: 'category',
    type: 'select' as const,
    options: [
      { label: '前端', value: 'frontend' },
      { label: '后端', value: 'backend' }
    ],
    onChange: (value, options) => {
      console.log('onChange', value, options);
    }
    // required: true
  },
  {
    label: '文章标签',
    name: 'tag',
    type: 'select' as const,
    mode: 'multiple',
    options: [
      { label: 'vue', value: 'vue' },
      { label: 'js', value: 'js' },
      { label: 'react', value: 'react' }
    ]
    // required: true
  },
  {
    label: '日期',
    name: 'datePicker',
    type: 'datePicker' as const
    // required: true
  },
  {
    label: '起止日期',
    name: 'rangePicker',
    type: 'rangePicker' as const
    // required: true
    // value: ['20251103', '20251203']
  },
  {
    label: '开关',
    name: 'switch',
    type: 'switch' as const
  },
  {
    label: '复选框',
    name: 'checkbox',
    type: 'checkbox' as const,
    options: [
      { label: '男', value: 'man' },
      { label: '女', value: 'woman' }
    ]
    // required: true
  },
  {
    label: '单选框',
    name: 'radio',
    type: 'radio' as const,
    options: [
      { label: '男', value: 'man' },
      { label: '女', value: 'woman' }
    ]
    // required: true
  },
  {
    label: '密码',
    name: 'password',
    type: 'password' as const
    // required: true
  },
  {
    label: '起止地点',
    name: 'rangeInput',
    rangeName: ['起点', '终点'],
    type: 'rangeInput' as const,
    pattern: /^.{4,50}$/
    // required: true
    // value: ['startrangeInput', 'newemail@example.com']
  },
  {
    label: '文章上传',
    name: 'file',
    type: 'uploadFile' as const,
    // required: true,
    accept: '.md',
    multiple: true,
    hint: '支持单个或批量上传，但仅支持Markdown文件（.md）。严禁上传违禁文件。'
  },
  {
    label: '文章封面',
    name: 'img',
    type: 'uploadImg' as const,
    required: true,
    accept: 'image/png,image/jpeg,image/jpg',
    multiple: false,
    listType: 'picture-card' as const
  }
];

const Users = () => {
  console.log('用户管理页面渲染');
  const formRef = useRef<DynamicFormRef>(null);

  useEffect(() => {
    formRef.current!.setFields({
      rangeInput: ['startrangeInput', 'endrangeInput'],
      title: '12345678',
      // summary: '11',
      category: 'backend',
      tag: ['react'],
      datePicker: '20250819',
      rangePicker: ['20251103', '20251203'],
      switch: true,
      checkbox: 'woman',
      radio: 'man',
      password: '111111'
    });

    formRef
      .current!.validateForm()
      .then((values: Record<string, unknown>) => {
        console.log(values);
      })
      .catch(() => {
        console.log('校验不通过');
      });
  }, []);

  const save = (values: Record<string, unknown>) => {
    console.log(values);
  };

  return (
    <>
      <DynamicForm
        formItems={formItems}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 19 }}
        submitForm={save}
        showFooter={true}
        ref={formRef}
      />
    </>
  );
};

export default memo(Users);
