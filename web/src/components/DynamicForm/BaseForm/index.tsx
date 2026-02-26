/*
 * @Author: yolo
 * @Date: 2025-11-18 00:38:43
 * @LastEditors: yolo
 * @LastEditTime: 2026-02-26 12:33:11
 * @FilePath: /web/src/components/DynamicForm/BaseForm/index.tsx
 * @Description: 提交类表单组件
 */

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Checkbox,
  Radio,
  Upload,
  Image
} from 'antd';
import { InboxOutlined, PlusOutlined } from '@ant-design/icons';
import type { CheckboxGroupProps } from 'antd/es/checkbox';
import type { DefaultOptionType } from 'antd/es/select';
import type {
  CheckboxOptionType,
  UploadProps,
  UploadFile,
  GetProp,
  SelectProps,
  FormProps
} from 'antd';
import type { DynamicFormItem, DynamicFormRef } from '../types';
import { pickerPlaceholder, format } from '../types';
import { useForm } from '../hooks/useForm';
import RangeInputFormItem from '../RangeInputFormItem';
import MarkdownEditor from '@/components/MarkdownEditor';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

interface BaseFormProps<TValues extends object> {
  formItems: DynamicFormItem[]; // 表单项数据
  labelCol: number; // 标签布局
  wrapperCol: number; // 组件布局
  layout: FormProps['layout']; // 表单布局方式
  children?: React.ReactNode; // 操作按钮插槽
  showFooter?: boolean; // 是否显示表单操作按钮
  handleSubmit?: (values: TValues) => void; // 表单提交方法
}

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const BaseFormInner = forwardRef(function BaseForm<TValues extends object>(
  {
    formItems,
    layout,
    labelCol,
    wrapperCol,
    children,
    showFooter = true,
    handleSubmit
  }: BaseFormProps<TValues>,
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

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [files, setFiles] = useState<{
    [key: string]: UploadFile[];
  }>({});

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

  // 上传按钮
  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  /**
   * @description: // 处理图片预览逻辑
   * @param {UploadFile} img
   * @return {*}
   */
  const handlePreview = async (img: UploadFile) => {
    if (!img.url && !img.preview) {
      img.preview = await getBase64(img.originFileObj as FileType);
    }

    setPreviewImage(img.url || (img.preview as string));
    setPreviewOpen(true);
  };

  /**
   * @description: 提交表单且数据验证失败后回调事件
   * @return {*}
   */
  const onFinishFailed = () => {
    scrollToFirstError();
  };

  return (
    <>
      <Form
        layout={layout}
        form={form}
        style={{
          width: '100%',
          margin: '0 auto',
          padding: '1rem'
        }}
        className="base-form-container"
        labelCol={{ span: labelCol }}
        wrapperCol={{ span: wrapperCol }}
        colon={false}
        clearOnDestroy
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        {formItems.map((item) => {
          if (item.hide) return null;

          // 输入框
          if (item.type === 'input')
            return (
              <Form.Item
                label={item.label}
                name={item.name}
                key={item.name}
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
            );

          // 密码输入框
          if (item.type === 'password')
            return (
              <Form.Item
                label={item.label}
                name={item.name}
                key={item.name}
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
                <Input.Password
                  disabled={item.disabled ? item.disabled : false}
                  allowClear={typeof item.allowClear === 'undefined' ? true : item.allowClear}
                  onBlur={(e) => handleBlur(e, item)}
                  placeholder={'请输入' + item.label}
                />
              </Form.Item>
            );

          // 多行文本框
          if (item.type === 'textarea')
            return (
              <Form.Item
                label={item.label}
                name={item.name}
                key={item.name}
                rules={[
                  {
                    required: item.required ? item.required : false,
                    message: '请输入' + item.label + '!'
                  },
                  {
                    pattern: item.pattern,
                    message: item.tip
                  }
                ]}
                initialValue={typeof item.value !== 'undefined' ? item.value : undefined}
              >
                <Input.TextArea
                  className="text-area-with-count"
                  disabled={item.disabled ? item.disabled : false}
                  allowClear={typeof item.allowClear === 'undefined' ? true : item.allowClear}
                  autoSize={item.rows}
                  showCount
                  maxLength={item.maxLength}
                  onBlur={(e) => handleBlur(e, item)}
                  placeholder={'请输入' + item.label}
                />
              </Form.Item>
            );

          // 范围输入框
          if (item.type === 'rangeInput')
            return (
              <Form.Item
                label={item.label}
                name={item.name}
                required={item.required ? item.required : false}
                rules={[
                  {
                    validator(_, value: string[]) {
                      if (item.required) {
                        if (!value || value.length !== 2) {
                          return Promise.reject(`请输入${item.label}`);
                        }
                        if (!value[0] || !value[1]) {
                          return Promise.reject(
                            item.rangeName &&
                              Array.isArray(item.rangeName) &&
                              item.rangeName.length >= 2
                              ? `${item.rangeName[0]}和${item.rangeName[1]}均为必填`
                              : '范围输入框均为必填'
                          );
                        }
                      }

                      return Promise.resolve();
                    }
                  }
                ]}
                key={item.name}
              >
                <RangeInputFormItem
                  formItem={item}
                  value={item.value ? (item.value as string[]) : []}
                  handleBlur={handleBlur}
                />
              </Form.Item>
            );

          // 下拉选择框
          if (item.type === 'select')
            return (
              <Form.Item
                label={item.label}
                name={item.name}
                key={item.name}
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
            );

          // 日期选择框
          if (item.type === 'datePicker')
            return (
              <Form.Item
                label={item.label}
                name={item.name}
                key={item.name}
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
            );

          // 日期范围选择框
          if (item.type === 'rangePicker')
            return (
              <Form.Item
                label={item.label}
                name={item.name}
                key={item.name}
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
            );

          // 开关
          if (item.type === 'switch')
            return (
              <Form.Item
                label={item.label}
                name={item.name}
                key={item.name}
                initialValue={typeof item.value !== 'undefined' ? item.value : undefined}
              >
                <Switch
                  disabled={item.disabled ? item.disabled : false}
                  onChange={(checked) => handleChange({ checked }, item)}
                />
              </Form.Item>
            );

          // 复选框
          if (item.type === 'checkbox')
            return (
              <Form.Item
                label={item.label}
                name={item.name}
                key={item.name}
                rules={[
                  {
                    required: item.required ? item.required : false,
                    message: '请选择' + item.label + '!'
                  }
                ]}
                initialValue={typeof item.value !== 'undefined' ? item.value : undefined}
              >
                <Checkbox.Group
                  options={(item.options || []) as CheckboxOptionType<string>[]}
                  disabled={item.disabled ? item.disabled : false}
                  onChange={(checkedValue) => handleChange({ checkedValue }, item)}
                />
              </Form.Item>
            );

          // 单选框
          if (item.type === 'radio')
            return (
              <Form.Item
                label={item.label}
                name={item.name}
                key={item.name}
                rules={[
                  {
                    required: item.required ? item.required : false,
                    message: '请选择' + item.label + '!'
                  }
                ]}
                initialValue={typeof item.value !== 'undefined' ? item.value : undefined}
              >
                <Radio.Group
                  options={(item.options || []) as CheckboxGroupProps<string>['options']}
                  disabled={item.disabled ? item.disabled : false}
                  onChange={(e) => handleChange({ e }, item)}
                />
              </Form.Item>
            );

          // markdown编辑器
          if (item.type === 'markdown')
            return (
              <Form.Item
                label={item.label}
                name={item.name}
                key={item.name}
                rules={[
                  {
                    required: item.required ? item.required : false,
                    message: '请输入' + item.label + '!'
                  }
                ]}
                initialValue={typeof item.value !== 'undefined' ? item.value : undefined}
              >
                <MarkdownEditor
                  initialValue={typeof item.value !== 'undefined' ? (item.value as string) : ''}
                  onChange={(value: string) => form.setFieldsValue({ [item.name]: value })}
                  height="600px"
                />
              </Form.Item>
            );

          // 文件上传
          if (item.type === 'uploadFile')
            return (
              <Form.Item
                label={item.label}
                name={item.name}
                key={item.name}
                valuePropName="fileList"
                getValueFromEvent={({ fileList }) => fileList}
                rules={[
                  { required: item.required ? item.required : false, message: '请选择一个文件!' }
                ]}
              >
                <Upload.Dragger
                  multiple={item.multiple ? item.multiple : false}
                  accept={item.accept}
                  fileList={files[item.name] || []}
                  beforeUpload={() => false}
                  maxCount={
                    typeof item.maxCount === 'number' && item.maxCount >= 0 ? item.maxCount : 1
                  }
                >
                  <p className="ant-upload-drag-icon" style={{ marginTop: 0 }}>
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">点击或拖动文件至此区域上传</p>
                  <p className="ant-upload-hint" style={{ margin: 0 }}>
                    {item.hint}
                  </p>
                </Upload.Dragger>
              </Form.Item>
            );

          // 图片上传
          if (item.type === 'uploadImg')
            return (
              <Form.Item
                label={item.label}
                name={item.name}
                key={item.name}
                valuePropName="fileList"
                getValueFromEvent={({ fileList }) => fileList}
                rules={[
                  { required: item.required ? item.required : false, message: '请选择一个文件!' }
                ]}
              >
                <Upload
                  multiple={item.multiple ? item.multiple : false}
                  accept={item.accept}
                  listType={item.listType ? item.listType : 'picture-card'}
                  fileList={files[item.name] || []}
                  showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                  onPreview={handlePreview}
                  beforeUpload={() => false}
                  onChange={({ fileList: newFileList }) =>
                    setFiles({ ...files, [item.name]: newFileList })
                  }
                  maxCount={
                    typeof item.maxCount === 'number' && item.maxCount >= 0 ? item.maxCount : 1
                  }
                >
                  {uploadButton}
                </Upload>
              </Form.Item>
            );

          return null;
        })}

        {showFooter && (
          <Form.Item className="base-form-footer-item">
            {children ? (
              children
            ) : (
              <>
                <Button type="primary" htmlType="submit" style={{ marginRight: '16px' }}>
                  提交
                </Button>
                <Button onClick={() => form.resetFields()} style={{ marginRight: '16px' }}>
                  重置
                </Button>
                <Button htmlType="button">取消</Button>
              </>
            )}
          </Form.Item>
        )}
      </Form>

      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage('')
          }}
          src={previewImage}
        />
      )}
    </>
  );
});

const BaseForm = BaseFormInner as <TValues extends object>(
  props: BaseFormProps<TValues> & React.RefAttributes<DynamicFormRef<TValues>>
) => JSX.Element;

export default BaseForm;
