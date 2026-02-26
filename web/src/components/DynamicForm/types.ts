import type { CheckboxOptionType, SelectProps, UploadFile } from 'antd';
import type { CheckboxGroupProps } from 'antd/es/checkbox';
import type { RadioChangeEvent } from 'antd/lib/radio/interface';
import dayjs from 'dayjs';

export const pickerPlaceholder = {
  date: ['开始日期', '结束日期'],
  week: ['开始周', '结束周'],
  month: ['开始月份', '结束月份'],
  quarter: ['开始季度', '结束季度'],
  year: ['开始年份', '结束年份']
};
export const format = {
  date: 'YYYYMMDD',
  week: 'YYYYww',
  month: 'YYYYMM',
  quarter: 'YYYYQq',
  year: 'YYYY'
};

export type FormUpdateValues<TValues extends object> = {
  [K in keyof TValues]?: TValues[K] | dayjs.Dayjs | undefined;
} & Record<string, unknown>;

// 表单项类型
export type DynamicFormItemType =
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
  | 'uploadImg'
  | 'markdown';

// 所有可能的 value 类型
export type DynamicFormValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | string[]
  | number[]
  | UploadFile[];

// 表单项类型定义
export interface DynamicFormItem {
  label: string; // 表单项标签
  name: string; // 表单项名称
  type: DynamicFormItemType; // 表单项类型

  value?: DynamicFormValue; // 表单项值
  required?: boolean; // 是否必填。默认 false 不校验表单项
  pattern?: RegExp; // 校验正则表达式
  tip?: string; // 正则校验提示语
  labelCol?: number; // 标签栅格宽度
  wrapperCol?: number; // 组件栅格宽度
  width?: number; // 组件宽度，默认单位 px

  disabled?: boolean; // 是否禁用。默认 false 不禁用表单项输入
  hide?: boolean; // 是否隐藏。默认 false 不隐藏表单项
  allowClear?: boolean; // 是否允许清除。默认 false 允许清空表单项

  mode?: 'multiple' | 'tags' | undefined; // 选择框模式（仅对下拉选择框有效）。默认 undefined 下拉单选模式

  rangeName?: string[]; // 范围输入校验提示或占位符关键词名称（仅对范围输入框有效）
  maxLength?: number; // 最大输入长度（仅对多行文本框有效）。默认不配置不限制输入内容长度只统计输入长度
  rows?: { minRows?: number; maxRows?: number } | boolean; // 多行文本输入内容高度配置，可自适应高度或使用对象限制高度（仅对多行文本框有效）。默认不配置内容高度为两行

  picker?: 'date' | 'week' | 'month' | 'quarter' | 'year'; // 设置选择器类型（仅对日期选择框有效）。默认 date

  maxCount?: number; // 限制上传数量（仅对上传文件表单项有效）。默认1，始终用最新上传的文件代替当前文件.或者限制 select 最多可选中的数量
  accept?: string; // 接受上传的文件类型（仅对上传表单项有效）
  hint?: string; // 上传提示（仅对上传表单项有效）
  multiple?: boolean; // 是否支持多选文件，若配置不支持多选文件则默认不可批量上传文件（仅对上传表单项有效）。默认 false 只允许单个文件上传
  listType?: 'picture-card' | 'picture-circle'; // 上传列表的内建样式（仅对上传表单项有效）。默认 picture-card 样式

  options?: SelectProps['options'] | CheckboxOptionType[] | CheckboxGroupProps['options'];

  onBlur?: (value: string, key?: string) => void; // 表单项失去焦点时校验

  onFocus?: () => void; // 获取焦点时的回调（仅对输入框有效）

  /** 业务层 onChange，只关心最终值 */
  onChange?: (value: DynamicFormValue, options?: DynamicFormItem['options']) => void; // 表单项值改变时的回调
}

// 事件参数类型
export interface EventParams {
  e?: RadioChangeEvent;
  value?: string | number | string[] | number[] | null;
  checked?: boolean;
  checkedValue?: string[] | number[] | null;
  dateString?: string[] | string | null;
  dateStrings?: [string, string] | null;
}

// 定义表单对外暴露的操作能力，并在类型层面约束表单字段名和字段值
export interface DynamicFormRef<TValues extends object> {
  /**
   * 编辑态：获取整个表单值（不保证完整）
   */
  getFields(): Partial<TValues>;
  /**
   * 编辑态：获取指定字段值（不保证完整）
   */
  getFields<K extends Extract<keyof TValues, string>>(names: K[]): Partial<Pick<TValues, K>>;

  // 获取单个表单项的值
  getField<K extends Extract<keyof TValues, string>>(name: K): TValues[K] | undefined;

  // 重置整个表单中（或指定字段）的所有值
  resetForm(names?: Extract<keyof TValues, string>[]): void;

  // 校验整个表单中（或指定字段）的所有值
  validateForm(names?: Extract<keyof TValues, string>[]): Promise<Partial<TValues>>;

  // 批量设置表单项的值
  setFields(values: Partial<TValues>): void;

  // 设置单个表单项的值
  setField<K extends Extract<keyof TValues, string>>(name: K, value: TValues[K]): void;

  // 自动滚动到校验失败的第一个表单项
  scrollToFirstError(): void;
}
