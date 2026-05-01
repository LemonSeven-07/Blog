import type { CheckboxOptionType, SelectProps, UploadFile } from 'antd';
import type { CheckboxGroupProps } from 'antd/es/checkbox';
import type { RadioChangeEvent } from 'antd/lib/radio/interface';
import dayjs from 'dayjs';

// 日期选择器默认占位文本，根据选择器类型区分开始和结束日期的占位文本
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

// 定义表单更新值的类型，支持字符串、数字、布尔值、日期对象等多种类型，并允许部分字段更新
export type FormUpdateValues<TValues extends object> = {
  [K in keyof TValues]?: TValues[K] | dayjs.Dayjs | undefined;
} & Record<string, unknown>;

// 定义表单项的基础属性
type CommonFormItem = {
  label: string; // 表单项标签
  name: string; // 表单项名称
  required?: boolean; // 是否必填。默认 false 不校验表单项
  pattern?: RegExp; // 校验正则表达式
  tip?: string; // 正则校验提示语
  disabled?: boolean; // 是否禁用。默认 false 不禁用表单项输入
  hide?: boolean; // 是否隐藏。默认 false 不隐藏表单项
  allowClear?: boolean; // 是否允许清除。默认 false 允许清空表单项
};

// 事件参数类型
export interface EventParams {
  e?: RadioChangeEvent;
  value?: TypeMap['select']['value'];
  checked?: TypeMap['switch']['value'];
  checkedValue?: TypeMap['checkbox']['value'];
  dateString?: string;
  dateStrings?: [string, string];
}

// 表单项事件回调函数类型定义，根据表单项类型约束事件参数的类型
interface EventFn {
  /** 业务层 onChange，只关心最终值 */
  OnChange: (
    value:
      | string
      | number
      | boolean
      | null
      | undefined
      | [string, string]
      | (string | number | boolean | UploadFile)[],
    options?: SelectProps['options'] | CheckboxOptionType[] | CheckboxGroupProps['options']
  ) => void; // 表单项值改变时的回调

  onBlur?: (value: string, key?: string) => void; // 获取焦点时的回调（仅对输入框有效）

  onFocus?: () => void; // 获取焦点时的回调
}

// 定义表单项类型映射，根据不同的表单项类型约束其特有属性，并继承公共属性和事件回调
type TypeMap = {
  input: CommonFormItem & {
    onBlur?: EventFn['onBlur']; // 表单项失去焦点时校验
    onFocus?: EventFn['onFocus']; // 获取焦点时的回调
    value?: string;
  }; // 表单项失去焦点时校验
  password: CommonFormItem & {
    onBlur?: EventFn['onBlur']; // 表单项失去焦点时校验
    onFocus?: EventFn['onFocus']; // 获取焦点时的回调
    value?: string;
  }; // 表单项失去焦点时校验
  textarea: CommonFormItem & {
    onBlur?: EventFn['onBlur']; // 表单项失去焦点时校验
    onFocus?: EventFn['onFocus']; // 获取焦点时的回调
    rows?: { minRows?: number; maxRows?: number } | boolean; // 多行文本输入内容高度配置，可自适应高度或使用对象限制高度（仅对多行文本框有效）。默认不配置内容高度为两行
    maxLength?: number; // 最大输入长度（仅对多行文本框有效）。默认不配置不限制输入内容长度只统计输入长度
    value?: string;
  }; // 表单项失去焦点时校验
  rangeInput: CommonFormItem & {
    onBlur?: EventFn['onBlur']; // 表单项失去焦点时校验
    rangeName?: string[];
    value?: string[];
  }; // rangeName 范围输入校验提示或占位符关键词名称
  select: Omit<CommonFormItem, 'pattern' | 'tip'> & {
    onChange?: EventFn['OnChange'];
    mode?: 'multiple' | 'tags'; // 设置 Select 的模式为多选或标签
    maxCount?: number; // 限制 select 最多可选中的数量
    options?: SelectProps['options'];
    value?: (string | number)[] | string | number;
  };
  datePicker: Omit<CommonFormItem, 'pattern' | 'tip'> & {
    onChange?: EventFn['OnChange'];
    picker?: 'date' | 'week' | 'month' | 'quarter' | 'year'; // 设置选择器类型。默认 date
    value?: string;
  };
  rangePicker: Omit<CommonFormItem, 'pattern' | 'tip'> & {
    onChange?: EventFn['OnChange'];
    picker?: 'date' | 'week' | 'month' | 'quarter' | 'year'; // 设置选择器类型。默认 date
    value?: [string, string];
  };
  switch: Pick<CommonFormItem, 'label' | 'name' | 'disabled' | 'hide'> & {
    onChange?: EventFn['OnChange'];
    value?: boolean;
  };
  checkbox: Omit<CommonFormItem, 'pattern' | 'tip' | 'allowClear'> & {
    onChange?: EventFn['OnChange'];
    options?: CheckboxOptionType[] | CheckboxGroupProps['options'];
    value?: (string | number | boolean)[];
  };
  radio: Omit<CommonFormItem, 'pattern' | 'tip' | 'allowClear'> & {
    onChange?: EventFn['OnChange'];
    options?: CheckboxOptionType[] | CheckboxGroupProps['options'];
    value?: string | number | boolean;
  };
  markdown: Pick<CommonFormItem, 'label' | 'name' | 'required' | 'hide'> & { value?: string };
  uploadFile: Omit<CommonFormItem, 'pattern' | 'tip' | 'allowClear'> & {
    multiple?: boolean; // 是否支持多选文件，若配置不支持多选文件则默认不可批量上传文件（仅对上传表单项有效）。默认 false 只允许单个文件上传
    accept?: string; // 接受上传的文件类型
    maxCount?: number; // 限制上传数量。默认1，始终用最新上传的文件代替当前文件
    hint?: string; // 上传提示
    value?: UploadFile[];
  };
  uploadImg: Omit<CommonFormItem, 'pattern' | 'tip' | 'allowClear'> & {
    multiple?: boolean; // 是否支持多选文件，若配置不支持多选文件则默认不可批量上传文件（仅对上传表单项有效）。默认 false 只允许单个文件上传
    accept?: string; // 接受上传的文件类型
    maxCount?: number; // 限制上传数量。默认1，始终用最新上传的文件代替当前文件
    listType?: 'picture-card' | 'picture-circle'; // 上传列表的内建样式。默认 picture-card 样式
    value?: UploadFile[];
  };
};

// 提交表单项类型定义，根据 type 字段的不同约束其他字段的类型和可选性
export type BaseFormItem = {
  [K in keyof TypeMap]: {
    type: K;
  } & TypeMap[K];
}[keyof TypeMap];

// 查询表单项类型定义，根据 type 字段的不同约束其他字段的类型和可选性
export type AdvancedFormItem = {
  [K in keyof Pick<TypeMap, 'input' | 'select' | 'datePicker' | 'rangePicker'>]: {
    type: K;
    width?: number; // 组件宽度，默认单位 px
    labelCol?: number; // 标签栅格宽度
    wrapperCol?: number; // 组件栅格宽度
  } & TypeMap[K];
}[keyof Pick<TypeMap, 'input' | 'select' | 'datePicker' | 'rangePicker'>];

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
