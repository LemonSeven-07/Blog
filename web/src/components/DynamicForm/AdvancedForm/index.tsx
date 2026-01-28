/*
 * @Author: yolo
 * @Date: 2025-09-12 10:02:24
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-23 03:18:36
 * @FilePath: /web/src/components/DynamicForm/AdvancedForm/index.tsx
 * @Description: 水平布局表单组件，例如：查询表单等
 */

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Button, Form, Input, Select, DatePicker } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { SelectProps } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { useForm } from '../hooks/useForm';
import type { DynamicFormItem, DynamicFormRef } from '../types';
import { pickerPlaceholder, format } from '../types';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);

interface AdvancedFormProps<TValues extends object> {
  formItems: DynamicFormItem[]; // 表单项数据
  labelCol?: number; // 标签布局
  wrapperCol?: number; // 组件布局
  children?: React.ReactNode; // 操作按钮插槽
  showFooter?: boolean; // 是否显示表单操作按钮
  handleSubmit?: (values: TValues) => void; // 表单提交方法
}

const AdvancedFormInner = forwardRef(function AdvancedForm<TValues extends object>(
  {
    formItems,
    labelCol,
    wrapperCol,
    children,
    showFooter = true,
    handleSubmit
  }: AdvancedFormProps<TValues>,
  ref: React.Ref<DynamicFormRef<TValues>>
) {
  const {
    form,
    setFields,
    setField,
    getFields,
    getField,
    resetForm,
    validateForm,
    scrollToFirstError,
    handleBlur,
    handleChange,
    onFinish
  } = useForm(formItems, handleSubmit);

  // 使用 useImperativeHandle 暴露给父组件的 ref 方法
  useImperativeHandle(ref, () => ({
    // 批量设置表单项的值
    setFields,

    // 设置单个表单项的值
    setField,

    // 获取整个表单中（或指定字段）的所有值
    getFields,

    // 获取单个表单项的值
    getField,

    // 重置整个表单中（或指定字段）的所有值
    resetForm,

    // 校验整个表单中（或指定字段）的所有值
    validateForm,

    // 自动滚动到校验失败的第一个表单项
    scrollToFirstError
  }));

  const containerRef = useRef<HTMLDivElement | null>(null); // 用来获取容器元素
  const [isWrapped, setIsWrapped] = useState(false); // 用来存储是否换行的状态

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const observer = new ResizeObserver(() => {
      // 获取第一个子元素和最后一个子元素的 offsetTop 值
      const children = container.children;
      if (children.length === 0) return;
      const firstChild = children[0] as HTMLDivElement;
      const lastChild = children[children.length - 1] as HTMLDivElement;

      // 比较它们的 offsetTop 值，如果不同，则说明发生了换行
      if (firstChild && lastChild) {
        const isWrapped = firstChild.offsetTop !== lastChild.offsetTop;
        setIsWrapped(isWrapped);
      }
    });

    // 开始监听元素的尺寸变化
    observer.observe(container);

    // 清理观察器
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Form
      layout="inline"
      form={form}
      style={{
        width: '100%',
        margin: '0 auto',
        padding: '1rem',
        marginBottom: '1rem',
        background: '#fff',
        borderRadius: '0.5rem'
      }}
      colon={false}
      clearOnDestroy
      onFinish={onFinish}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap', // 允许自动换行
          gap: '1rem', // 表单项之间的间距
          width: '100%'
        }}
        ref={containerRef}
      >
        {formItems.map((item) => {
          if (item.hide) return null;

          // 输入框
          if (item.type === 'input')
            return (
              <div
                key={item.name}
                style={{
                  width: (item.width || '300') + 'px',
                  flex: '0 0 auto'
                }}
              >
                <Form.Item
                  label={item.label}
                  name={item.name}
                  labelCol={{ span: item.labelCol || labelCol || 8 }}
                  wrapperCol={{ span: item.wrapperCol || wrapperCol || 16 }}
                  rules={[
                    {
                      required: item.required ? item.required : false,
                      message: '请输入' + item.label + '!'
                    },
                    ...(item.pattern
                      ? [
                          {
                            pattern: item.pattern,
                            message: item.tip || '请输入正确的' + item.label + '格式!'
                          }
                        ]
                      : [])
                  ]}
                  initialValue={typeof item.value !== 'undefined' ? item.value : undefined}
                >
                  <Input
                    disabled={item.disabled ? item.disabled : false}
                    allowClear={typeof item.allowClear === 'undefined' ? true : item.allowClear}
                    onBlur={(e) => handleBlur(e, item)}
                    placeholder={'请输入' + item.label}
                  />
                </Form.Item>
              </div>
            );

          // 下拉选择框
          if (item.type === 'select')
            return (
              <div
                key={item.name}
                style={{
                  width: (item.width || '250') + 'px',
                  flex: '0 0 auto'
                }}
              >
                <Form.Item
                  label={item.label}
                  name={item.name}
                  labelCol={{ span: item.labelCol || labelCol || 8 }}
                  wrapperCol={{ span: item.wrapperCol || labelCol || 16 }}
                  rules={[
                    {
                      required: item.required ? item.required : false,
                      message: '请选择' + item.label + '!'
                    }
                  ]}
                  initialValue={typeof item.value !== 'undefined' ? item.value : undefined}
                >
                  <Select
                    showSearch
                    filterOption={(input: string, option: DefaultOptionType | undefined) =>
                      ((option?.label ?? '') as string).toLowerCase().includes(input.toLowerCase())
                    }
                    mode={item.mode}
                    disabled={item.disabled ? item.disabled : false}
                    allowClear={typeof item.allowClear === 'undefined' ? true : item.allowClear}
                    maxCount={
                      typeof item.maxCount === 'number' &&
                      (item.mode === 'multiple' || item.mode === 'tags') &&
                      item.maxCount >= 0
                        ? item.maxCount
                        : undefined
                    }
                    options={(item.options || []) as SelectProps['options']}
                    onChange={(value) => handleChange({ value }, item)}
                    placeholder={'请选择' + item.label}
                  />
                </Form.Item>
              </div>
            );

          // 日期选择框
          if (item.type === 'datePicker')
            return (
              <div
                key={item.name}
                style={{
                  width: (item.width || '250') + 'px',
                  flex: '0 0 auto'
                }}
              >
                <Form.Item
                  label={item.label}
                  name={item.name}
                  labelCol={{ span: item.labelCol || labelCol || 8 }}
                  wrapperCol={{ span: item.wrapperCol || wrapperCol || 16 }}
                  rules={[
                    {
                      required: item.required ? item.required : false,
                      message: '请选择' + item.label + '!'
                    }
                  ]}
                  initialValue={
                    typeof item.value !== 'undefined'
                      ? dayjs(item.value as string, format[item.picker || 'date'])
                      : undefined
                  }
                >
                  <DatePicker
                    // style={{ width: '100%' }}
                    disabled={item.disabled ? item.disabled : false}
                    allowClear={typeof item.allowClear === 'undefined' ? true : item.allowClear}
                    picker={item.picker ? item.picker : 'date'}
                    onChange={(_, dateString) => handleChange({ dateString }, item)}
                    placeholder={'请选择' + item.label}
                  />
                </Form.Item>
              </div>
            );

          // 范围日期选择框
          if (item.type === 'rangePicker')
            return (
              <div
                key={item.name}
                style={{
                  width: (item.width || '350') + 'px',
                  flex: '0 0 auto'
                }}
              >
                <Form.Item
                  label={item.label}
                  name={item.name}
                  labelCol={{ span: item.labelCol || labelCol || 8 }}
                  wrapperCol={{ span: item.wrapperCol || wrapperCol || 16 }}
                  rules={[
                    {
                      required: item.required ? item.required : false,
                      message: '请选择' + item.label + '!'
                    }
                  ]}
                  initialValue={
                    typeof item.value !== 'undefined'
                      ? (item.value as string[]).map(
                          (str) => item && dayjs(str, format[item.picker || 'date'])
                        )
                      : undefined
                  }
                >
                  <DatePicker.RangePicker
                    disabled={item.disabled ? item.disabled : false}
                    allowClear={typeof item.allowClear === 'undefined' ? true : item.allowClear}
                    picker={item.picker ? item.picker : 'date'}
                    onChange={(_, dateStrings) => handleChange({ dateStrings }, item)}
                    placeholder={
                      pickerPlaceholder[item.picker ? item.picker : 'date'] as [string, string]
                    }
                  />
                </Form.Item>
              </div>
            );

          return null;
        })}

        {showFooter &&
          // 查询和重置按钮
          (children ? (
            children
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: isWrapped ? 'flex-end' : 'flex-start',
                marginRight: '1rem'
              }}
            >
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginRight: '16px' }}
                icon={<SearchOutlined />}
              >
                搜索
              </Button>
              <Button
                htmlType="button"
                onClick={() => {
                  form.resetFields();
                  onFinish(getFields() as TValues);
                }}
                icon={<ReloadOutlined />}
              >
                重置
              </Button>
            </div>
          ))}
      </div>
    </Form>
  );
});

const AdvancedForm = AdvancedFormInner as <TValues extends object>(
  props: AdvancedFormProps<TValues> & React.RefAttributes<DynamicFormRef<TValues>>
) => JSX.Element;

export default AdvancedForm;
