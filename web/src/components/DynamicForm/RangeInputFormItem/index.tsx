/*
 * @Author: yolo
 * @Date: 2025-12-22 13:01:18
 * @LastEditors: yolo
 * @LastEditTime: 2026-04-29 08:11:32
 * @FilePath: /Blog/web/src/components/DynamicForm/RangeInputFormItem/index.tsx
 * @Description:
 */
import { Space, Input } from 'antd';
import type { BaseFormItem } from '../types';

interface RangeInputFormItemProps {
  formItem: Extract<BaseFormItem, { type: 'rangeInput' }>;
  value?: string[];
  handleBlur?: (
    e: React.FocusEvent<HTMLInputElement>,
    item: Extract<BaseFormItem, { type: 'rangeInput' }>
  ) => void;
  onChange?: (value: string[]) => void;
}
const RangeInputFormItem = ({
  formItem,
  value = [],
  handleBlur,
  onChange
}: RangeInputFormItemProps) => {
  const [start = '', end = ''] = value;

  return (
    <Space style={{ width: '100%' }}>
      <Input
        value={start}
        disabled={formItem.disabled ? formItem.disabled : false}
        allowClear={!formItem.allowClear}
        onBlur={(e) => handleBlur?.(e, formItem)}
        onChange={(e) => {
          onChange?.([e.target.value, end]);
        }}
        placeholder={`请输入${formItem.rangeName ? (formItem.rangeName as string[])[0] : ''}`}
      />
      <span>——</span>
      <Input
        value={end}
        disabled={formItem.disabled ? formItem.disabled : false}
        allowClear={!formItem.allowClear}
        onBlur={(e) => handleBlur?.(e, formItem)}
        onChange={(e) => {
          onChange?.([start, e.target.value]);
        }}
        placeholder={`请输入${formItem.rangeName ? (formItem.rangeName as string[])[1] : ''}`}
      />
    </Space>
  );
};

export default RangeInputFormItem;
