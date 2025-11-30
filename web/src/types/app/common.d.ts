import type { CheckboxOptionType, SelectProps, UploadFile } from 'antd';
import type { CheckboxGroupProps } from 'antd/es/checkbox';

export type ComponentMap = {
  ArticleExplorer: (name: string) => JSX.Element;
  Notify: JSX.Element;
  LifeNotes: JSX.Element;
  Dashboard: JSX.Element;
  Articles: JSX.Element;
  Users: JSX.Element;
};

export interface RouteItem {
  id: number;
  path: string;
  name: string;
  component: keyof ComponentMap;
  meta: {
    icon?: string;
    type: 'category' | 'header' | 'normal' | 'admin';
    title: string;
    categoryId?: number;
  };
  children?: RouteItem[];
}

export interface tagItem {
  id: number;
  name: string;
}

export interface DynamicFormItem {
  label: string; // 表单项标签
  name: string; // 表单项名称
  type:
    | 'input'
    | 'password'
    | 'textarea'
    | 'rangeInput'
    | 'select'
    | 'datePicker'
    | 'rangePicker'
    | 'switch'
    | 'checkbox'
    | 'radio'
    | 'uploadFile'
    | 'uploadImg'; // 表单项类型
  value?: string | number | string[] | number[] | boolean | UploadFile[] | undefined;

  required?: boolean; // 是否必填。默认 false 不校验表单项
  pattern?: RegExp; // 校验正则表达式
  tip?: string; // 正则校验提示语

  disabled?: boolean; // 是否禁用。默认 false 不禁用表单项输入
  hide?: boolean; // 是否隐藏。默认 false 不隐藏表单项
  allowClear?: boolean; // 是否允许清除。默认 false 允许清空表单项

  mode?: 'multiple' | 'tags' | undefined; // 选择框模式（仅对下拉选择框有效）。默认 undefined 下拉单选模式
  showSearch?: boolean | object;
  options?:
    | SelectProps['options']
    | CheckboxOptionType<string>[]
    | CheckboxGroupProps<string>['options']; // 下拉选择框选项｜复选框组选项｜单选框组选项

  rangeName?: string[]; // 范围输入校验提示或占位符关键词名称（仅对范围输入框有效）
  maxLength?: number; // 最大输入长度（仅对多行文本框有效）。默认不配置不限制输入内容长度只统计输入长度
  rows?: { minRows?: number; maxRows?: number } | boolean; // 多行文本输入内容高度配置，可自适应高度或使用对象限制高度（仅对多行文本框有效）。默认不配置内容高度为两行

  picker?: 'date' | 'week' | 'month' | 'quarter' | 'year'; // 设置选择器类型（仅对日期选择框有效）。默认 date

  accept?: string; // 接受上传的文件类型（仅对上传表单项有效）
  hint?: string; // 上传提示（仅对上传表单项有效）
  multiple?: boolean; // 是否支持多选文件，若配置不支持多选文件则默认不可批量上传文件（仅对上传表单项有效）。默认 false 只允许单个文件上传
  listType?: 'picture-card' | 'picture-circle'; // 上传列表的内建样式（仅对上传表单项有效）。默认 picture-card 样式

  onBlur?: (value: string, key?: string) => void; // 表单项失去焦点时校验
  onChange?: (
    value: number | string | number[] | string[] | boolean | undefined | null,
    options?: FormItem['options']
  ) => void; // 表单项值改变时的回调
}

export interface DynamicFormRef {
  // 批量设置表单项的值
  setFields: (values: Record<string, unknown>) => void;
  // 设置单个表单项的值
  setField: (name: string, value: unknown) => void;
  // 获取整个表单中（或指定字段）的所有值
  getFields: (names?: string[]) => Record<string, unknown>;
  // 获取单个表单项的值
  getField: (name: string) => unknown;
  // 重置整个表单中（或指定字段）的所有值
  resetForm: (names?: string[]) => void;
  // 校验整个表单中（或指定字段）的所有值
  validateForm: (names?: string[]) => Promise;
  // 自动滚动到校验失败的第一个表单项
  scrollToFirstError: () => void;
}
