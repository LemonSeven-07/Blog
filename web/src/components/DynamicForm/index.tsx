/*
 * @Author: yolo
 * @Date: 2025-11-18 00:38:43
 * @LastEditors: yolo
 * @LastEditTime: 2025-11-30 20:57:51
 * @FilePath: /web/src/components/DynamicForm/index.tsx
 * @Description: 提交表单组件
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
import type { CheckboxOptionType, UploadProps, UploadFile, GetProp, SelectProps } from 'antd';
import type { RadioChangeEvent } from 'antd/lib/radio/interface';
import type { DynamicFormItem, DynamicFormRef } from '@/types/app/common';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

interface EventParams {
  dateString?: string[] | string | null;
  dateStrings?: [string, string] | null;
  checked?: boolean;
  checkedValue?: string[] | number[];
  e?: RadioChangeEvent;
  value?: string | number | string[] | number[] | undefined;
}

interface DynamicFormProps {
  formItems: DynamicFormItem[];
  labelCol: { span: number }; // 标签布局
  wrapperCol: { span: number }; // 组件布局
  submitForm?: (values: Record<string, unknown>) => void;
  layout?: 'inline' | 'horizontal' | 'vertical'; // 表单布局方式，默认 inline
  children?: React.ReactNode;
  showFooter?: boolean;
}

const pickerPlaceholder = {
  date: ['开始日期', '结束日期'],
  week: ['开始周', '结束周'],
  month: ['开始月份', '结束月份'],
  quarter: ['开始季度', '结束季度'],
  year: ['开始年份', '结束年份']
};
const format = {
  date: 'YYYYMMDD',
  week: 'YYYYww',
  month: 'YYYYMM',
  quarter: 'YYYYQq',
  year: 'YYYY'
};

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const DynamicForm = forwardRef<DynamicFormRef, DynamicFormProps>(
  (
    {
      formItems,
      layout = 'horizontal',
      labelCol,
      wrapperCol,
      submitForm,
      children,
      showFooter
    }: DynamicFormProps,
    ref
  ) => {
    const [form] = Form.useForm();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [imgList, setImgList] = useState<UploadFile[]>([]);

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

    /**
     * @description: 更新表单值的预处理方法
     * @param {string} name 表单项字段名
     * @param {unknown} value 表单项值
     * @return {Record<string, unknown>}
     */
    const processSetFormValues = (name: string, value: unknown) => {
      const result: Record<string, unknown> = {};
      const formItem = formItems.find((item) => item.name === name);
      if (formItem) {
        switch (formItem.type) {
          case 'rangeInput':
            if (Array.isArray(value)) {
              result[`start${name}`] = value[0];
              result[`end${name}`] = value[1];
            } else {
              throw new Error(`Invalid value for [${name}]: Expected an array.`);
            }
            break;
          case 'datePicker':
            if (value) {
              if (
                typeof value === 'string' &&
                dayjs(value, format[formItem.picker || 'date'], true).isValid()
              ) {
                result[name] = dayjs(value, format[formItem.picker || 'date']);
              } else {
                throw new Error(
                  `Invalid value for [${name}]: The value must be a valid date string(${format[formItem.picker || 'date']}).`
                );
              }
            } else {
              result[name] = undefined;
            }
            break;
          case 'rangePicker':
            if (value && Array.isArray(value) && value.length) {
              if (
                typeof value[0] === 'string' &&
                dayjs(value[0], format[formItem.picker || 'date'], true).isValid() &&
                (!value[1] ||
                  (value[1] &&
                    typeof value[1] === 'string' &&
                    dayjs(value[1], format[formItem.picker || 'date'], true).isValid()))
              ) {
                if (
                  value[0] &&
                  value[1] &&
                  dayjs(value[1], format[formItem.picker || 'date'], true).isBefore(
                    dayjs(value[0], format[formItem.picker || 'date'], true)
                  )
                )
                  throw new Error(`Invalid value for [${name}]: Invalid date range.`);
                result[name] = [dayjs(value[0], format[formItem.picker || 'date'])];
                if (value[1])
                  result[name] = [
                    ...(result[name] as dayjs.Dayjs[]),
                    dayjs(value[1], format[formItem.picker || 'date'])
                  ];
              } else {
                throw new Error(
                  `Invalid value for [${name}]: The value must be an array of strings(${format[formItem.picker || 'date']}), each representing a valid date.`
                );
              }
            } else {
              result[name] = undefined;
            }
            break;
          default:
            result[name] = value;
            break;
        }
      }

      return result;
    };

    /**
     * @description: 获取表单值的预处理方法
     * @param {Record<string, unknown>} values
     * @return {Record<string, unknown>} finalValues
     */
    const processGetFormValues = (values: Record<string, unknown>): Record<string, unknown> => {
      const finalValues: Record<string, unknown> = {};
      for (const key in values) {
        const formItem = formItems.find((item) => item.name === key);
        if (formItem) {
          if (!values[key]) {
            finalValues[key] = values[key];
            continue;
          }

          switch (formItem.type) {
            case 'password':
              break;
            case 'rangeInput':
              finalValues[key] = [values['start' + key] || '', values['end' + key] || ''];
              break;
            case 'datePicker':
              finalValues[key] = (values[key] as dayjs.Dayjs).format(
                format[formItem.picker || 'date']
              );
              break;
            case 'rangePicker':
              finalValues[key] = (values[key] as dayjs.Dayjs[]).map(
                (item) => item && item.format(format[formItem.picker || 'date'])
              );
              break;
            default:
              finalValues[key] = values[key];
              break;
          }
        }
      }

      return finalValues;
    };

    /**
     * @description: 操作表单项字段名预处理方法
     * @param {string[]} names
     * @return {*}
     */
    const processFieldNames = (names: string[]) => {
      const itemMap = new Map(formItems.map((item) => [item.name, item]));
      const result = names
        .map((str) => itemMap.get(str))
        .filter((item) => item && item.type === 'rangeInput');
      let newNames = [...names];
      if (result.length > 0) {
        // 范围输入框类型表单需要获取多个值才行，用批量设置表单值的方法
        result.forEach((item) => {
          newNames = newNames.concat([`start${item!.name}`, `end${item!.name}`]);
        });
      }

      return newNames;
    };

    /**
     * @description: 批量设置表单项的值
     * @param {Record<string, unknown>} values
     * @return {*}
     */
    const setFields = (values: Record<string, unknown>) => {
      try {
        let updateValues = JSON.parse(JSON.stringify(values));
        for (const key in values) {
          updateValues = { ...updateValues, ...processSetFormValues(key, values[key]) };
        }
        form.setFieldsValue(updateValues);
      } catch (err) {
        console.error(err);
      }
    };

    /**
     * @description: 设置单个表单项的值
     * @param {string} name
     * @param {unknown} value
     * @return {*}
     */
    const setField = (name: string, value: unknown) => {
      const updateValues = processSetFormValues(name, value);
      if (Object.keys(updateValues).length > 1) {
        // 范围输入框类型表单还需要设置start、end值才行，用批量设置表单值的方法
        form.setFieldsValue({ ...updateValues, name: value });
      } else {
        form.setFieldValue(name, updateValues[name]);
      }
    };

    /**
     * @description: 获取整个表单中（或指定字段）的所有值
     * @param {string[]} names 表单项的字段名数组
     * @return {*}
     */
    const getFields = (names?: string[]) => {
      if (names) {
        // 范围输入框类型表单还需要获取start、end值才行
        const newNames = processFieldNames(names);
        return processGetFormValues(form.getFieldsValue(newNames));
      } else {
        return processGetFormValues(form.getFieldsValue());
      }
    };

    /**
     * @description: 获取单个表单项的值
     * @param {sting} name 表单项的字段名
     * @return {*}
     */
    const getField = (name: string) => {
      const formItem = formItems.find((item) => item.name === name);
      if (formItem?.type === 'rangeInput') {
        return processGetFormValues(form.getFieldsValue([name, `start${name}`, `end${name}`]))[
          name
        ];
      } else {
        return processGetFormValues({ [name]: form.getFieldValue(name) })[name];
      }
    };

    /**
     * @description: 重置整个表单中（或指定字段）的所有值
     * @param {string[]} names
     * @return {*}
     */
    const resetForm = (names?: string[]) => {
      if (names) {
        // 范围输入框类型表单还需要重置start、end值才行
        const newNames = processFieldNames(names);
        form.resetFields(newNames);
      } else {
        form.resetFields();
      }
    };

    /**
     * @description: 校验整个表单中（或指定字段）的所有值
     * @param {string[]} names
     * @return {*}
     */
    const validateForm = (names?: string[]) => {
      if (names) {
        // 范围输入框类型表单还需要校验start、end值才行
        const newNames = processFieldNames(names);
        return form.validateFields(newNames);
      } else {
        return form.validateFields();
      }
    };

    /**
     * @description: 自动滚动到校验失败的第一个表单项
     * @return {*}
     */
    const scrollToFirstError = () => {
      // 获取所有表单项的错误信息
      const errors = form.getFieldsError();

      // 找到第一个失败的表单项
      const firstError = errors.find((item) => item.errors.length > 0);
      if (firstError) {
        // 获取第一个失败的字段
        const firstErrorField = document.getElementById(firstError.name[0] as string);

        if (firstErrorField) {
          const formItem = formItems.find((item) => item.name === firstError.name[0]);
          if (formItem && (formItem.type === 'uploadFile' || formItem.type === 'uploadImg')) {
            firstErrorField.parentElement!.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          } else {
            firstErrorField.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }
      }
    };

    // 上传按钮
    const uploadButton = (
      <button style={{ border: 0, background: 'none' }} type="button">
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </button>
    );

    /**
     * @description: // 处理文件上传前的逻辑
     * @param {FileType} file 上传文件
     * @param {boolean} multiple 文件是否支持批量上传
     * @param {'uploadFile' | 'uploadImg'} type 上传类型
     * @return {*}
     */
    const beforeUploadFile = (
      file: FileType & { url?: string },
      multiple: boolean,
      type: 'uploadFile' | 'uploadImg'
    ) => {
      if (!multiple) {
        if (type === 'uploadImg') {
          // 为文件生成一个预览 URL，供预览使用
          file.url = URL.createObjectURL(file);
          // 限制只上传一个文件，清除文件列表，覆盖旧文件
          setImgList([file]);
        } else {
          setFileList([file]);
        }
      }

      // 阻止默认上传行为，手动上传
      return false;
    };

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
     * @description: 输入框失焦事件
     * @param {React} e 事件对象
     * @param {DynamicFormItem} item 表单项对象
     * @return {*}
     */
    const handleBlur = (
      e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
      item: DynamicFormItem
    ) => {
      form.validateFields([e.target.id]).then((value) => {
        if (!item.onBlur || !value[e.target.id]) return;
        item.onBlur(e.target.value, e.target.id);
      });
    };

    /**
     * @description: 表单项值改变事件
     * @param {EventParams} params 事件对象
     * @param {DynamicFormItem} item 表单项对象
     * @return {*}
     */
    const handleChange = (params: EventParams, item: DynamicFormItem) => {
      console.log('表单项值改变', params, item);
      if (!item.onChange) return;
      switch (item.type) {
        case 'select':
          item.onChange(params.value, item.options);
          return;
        case 'datePicker':
          item.onChange(params.dateString);
          return;
        case 'rangePicker':
          item.onChange(params.dateStrings);
          return;
        case 'switch':
          item.onChange(params.checked);
          return;
        case 'checkbox':
          item.onChange(params.checkedValue, item.options);
          return;
        case 'radio':
          item.onChange(params.e?.target.value, item.options);
          return;
      }
    };

    /**
     * @description: 提交表单的方法
     * @param {Record<string, unknown>} values
     * @return {*}
     */
    const onFinish = (values: Record<string, unknown>) => {
      const finalValues = processGetFormValues(values);
      if (submitForm) submitForm(finalValues);
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
          className="submit-form-container"
          labelCol={labelCol}
          wrapperCol={wrapperCol}
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
                  initialValue={item.value ? item.value : undefined}
                >
                  <Input
                    disabled={item.disabled ? item.disabled : false}
                    allowClear={!item.allowClear}
                    placeholder={'请输入' + item.label}
                    onBlur={(e) => handleBlur(e, item)}
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
                  initialValue={item.value ? item.value : undefined}
                >
                  <Input.Password
                    disabled={item.disabled ? item.disabled : false}
                    allowClear={!item.allowClear}
                    placeholder={'请输入' + item.label}
                    onBlur={(e) => handleBlur(e, item)}
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
                  initialValue={item.value ? item.value : undefined}
                >
                  <Input.TextArea
                    className="text-area-with-count"
                    disabled={item.disabled ? item.disabled : false}
                    allowClear={!item.allowClear}
                    autoSize={item.rows}
                    showCount
                    maxLength={item.maxLength}
                    placeholder={'请输入' + item.label}
                    onBlur={(e) => handleBlur(e, item)}
                  />
                </Form.Item>
              );

            // 范围输入框
            if (item.type === 'rangeInput')
              return (
                <Form.Item
                  label={item.label}
                  name={item.name}
                  key={item.name}
                  rules={[
                    {
                      required: item.required ? item.required : false,
                      message: ''
                    }
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <div className="range-input-form-item">
                    <Form.Item
                      name={'start' + item.name}
                      key={'start' + item.name}
                      dependencies={[item.name]}
                      rules={[
                        {
                          required: item.required ? item.required : false,
                          message: `请输入${(item.rangeName as string[])[0]}!`
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
                      initialValue={item.value ? (item.value as string[])[0] : undefined}
                    >
                      <Input
                        disabled={item.disabled ? item.disabled : false}
                        allowClear={!item.allowClear}
                        placeholder={`请输入${(item.rangeName as string[])[0]}`}
                        onBlur={(e) => handleBlur(e, item)}
                      />
                    </Form.Item>

                    {/* 连接符（——） */}
                    <div
                      style={{
                        width: '3rem',
                        textAlign: 'center',
                        lineHeight: '2rem'
                      }}
                    >
                      ——
                    </div>

                    <Form.Item
                      name={'end' + item.name}
                      key={'end' + item.name}
                      dependencies={[item.name]}
                      rules={[
                        {
                          required: item.required ? item.required : false,
                          message: `请输入${(item.rangeName as string[])[1]}!`
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
                      initialValue={item.value ? (item.value as string[])[1] : undefined}
                    >
                      <Input
                        disabled={item.disabled ? item.disabled : false}
                        allowClear={!item.allowClear}
                        placeholder={`请输入${(item.rangeName as string[])[1]}`}
                        onBlur={(e) => handleBlur(e, item)}
                      />
                    </Form.Item>
                  </div>
                </Form.Item>
              );

            // 选择框
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
                  initialValue={item.value ? item.value : undefined}
                >
                  <Select
                    showSearch
                    filterOption={(input: string, option: DefaultOptionType | undefined) =>
                      ((option?.label ?? '') as string).toLowerCase().includes(input.toLowerCase())
                    }
                    mode={item.mode}
                    disabled={item.disabled ? item.disabled : false}
                    allowClear={!item.allowClear}
                    options={(item.options || []) as SelectProps['options']}
                    placeholder={'请选择' + item.label}
                    onChange={(value) => handleChange({ value }, item)}
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
                    item.value
                      ? dayjs(item.value as string, format[item.picker || 'date'])
                      : undefined
                  }
                >
                  <DatePicker
                    // style={{ width: '100%' }}
                    disabled={item.disabled ? item.disabled : false}
                    allowClear={!item.allowClear}
                    picker={item.picker ? item.picker : 'date'}
                    placeholder={'请选择' + item.label}
                    onChange={(_, dateString) => handleChange({ dateString }, item)}
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
                    item.value
                      ? (item.value as string[]).map(
                          (str) => item && dayjs(str, format[item.picker || 'date'])
                        )
                      : undefined
                  }
                >
                  <DatePicker.RangePicker
                    disabled={item.disabled ? item.disabled : false}
                    allowClear={!item.allowClear}
                    picker={item.picker ? item.picker : 'date'}
                    placeholder={
                      pickerPlaceholder[item.picker ? item.picker : 'date'] as [string, string]
                    }
                    onChange={(_, dateStrings) => handleChange({ dateStrings }, item)}
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
                  initialValue={item.value ? item.value : undefined}
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
                  initialValue={item.value ? item.value : undefined}
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
                  initialValue={item.value ? item.value : undefined}
                >
                  <Radio.Group
                    options={(item.options || []) as CheckboxGroupProps<string>['options']}
                    disabled={item.disabled ? item.disabled : false}
                    onChange={(e) => handleChange({ e }, item)}
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
                    fileList={fileList}
                    beforeUpload={(file) =>
                      beforeUploadFile(file, item.multiple ? item.multiple : false, 'uploadFile')
                    }
                    onChange={({ fileList: newFileList }) => setFileList(newFileList)}
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
                  valuePropName="imgList"
                  getValueFromEvent={({ fileList: imgList }) => imgList}
                  rules={[
                    { required: item.required ? item.required : false, message: '请选择一个文件!' }
                  ]}
                >
                  <Upload
                    multiple={item.multiple ? item.multiple : false}
                    accept={item.accept}
                    listType={item.listType ? item.listType : 'picture-card'}
                    fileList={imgList}
                    showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                    onPreview={handlePreview}
                    beforeUpload={(img) =>
                      beforeUploadFile(img, item.multiple ? item.multiple : false, 'uploadImg')
                    }
                    onChange={({ fileList: newFileList }) => setImgList(newFileList)}
                  >
                    {uploadButton}
                  </Upload>
                </Form.Item>
              );

            return null;
          })}

          {showFooter && (
            <Form.Item className="submit-form-footer-item">
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
  }
);

DynamicForm.displayName = 'DynamicForm';

export default DynamicForm;
