/*
 * @Author: yolo
 * @Date: 2025-09-12 10:02:24
 * @LastEditors: yolo
 * @LastEditTime: 2025-11-18 22:28:38
 * @FilePath: /web/src/components/SearchForm/index.tsx
 * @Description: 查询表单组件
 */

import { useEffect, useRef, useState } from 'react';
import { Button, Form, Input, Select, DatePicker, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

interface searchOptionsItem {
  label: string; // 表单项标签
  name: string; // 表单项名称
  type: string; // 表单项类型：input、select、datePicker、rangePicker
  required?: boolean; // 是否必填
  disabled?: boolean; // 是否禁用
  hide?: boolean; // 是否隐藏
  labelCol?: number; // 标签栅格宽度
  wrapperCol?: number; // 组件栅格宽度
  allowClear?: boolean; // 是否允许清除
  mode?: 'multiple' | 'tags' | undefined; // 选择框模式
  options?: { label: string; value: number }[]; // 下拉选择框选项
  tip?: string; // 校验提示语
  pattern?: RegExp; // 校验正则表达式
  width?: number; // 组件宽度，默认单位 px
  blur?: () => void; // 是否在失去焦点时校验（仅对输入框有效）
  focus?: () => void; // 获取焦点时的回调（仅对输入框有效）
  onChange?: () => void; // 值改变时的回调
}

interface SearchFormProps {
  searchOptions: searchOptionsItem[];
}

const SearchForm = ({ searchOptions }: SearchFormProps) => {
  const [form] = Form.useForm();

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
        {searchOptions.map((item) => {
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
                  labelCol={{ span: item.labelCol || 8 }}
                  wrapperCol={{ span: item.wrapperCol || 16 }}
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
                >
                  <Input
                    disabled={item.disabled ? item.disabled : false}
                    allowClear={!item.allowClear}
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
                  labelCol={{ span: item.labelCol || 8 }}
                  wrapperCol={{ span: item.wrapperCol || 16 }}
                  rules={[
                    {
                      required: item.required ? item.required : false,
                      message: '请选择' + item.label + '!'
                    }
                  ]}
                >
                  <Select
                    mode={item.mode}
                    disabled={item.disabled ? item.disabled : false}
                    allowClear={!item.allowClear}
                    options={item.options || []}
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
                  labelCol={{ span: item.labelCol || 8 }}
                  wrapperCol={{ span: item.wrapperCol || 16 }}
                  rules={[
                    {
                      required: item.required ? item.required : false,
                      message: '请选择' + item.label + '!'
                    }
                  ]}
                >
                  <DatePicker
                    format={{
                      format: 'YYYYMMDD',
                      type: 'mask'
                    }}
                    style={{ width: '100%' }}
                    disabled={item.disabled ? item.disabled : false}
                    allowClear={!item.allowClear}
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
                  labelCol={{ span: item.labelCol || 8 }}
                  wrapperCol={{ span: item.wrapperCol || 16 }}
                  rules={[
                    {
                      required: item.required ? item.required : false,
                      message: '请选择' + item.label + '!'
                    }
                  ]}
                >
                  <DatePicker.RangePicker
                    disabled={item.disabled ? item.disabled : false}
                    allowClear={!item.allowClear}
                    placeholder={['开始日期', '结束日期']}
                  />
                </Form.Item>
              </div>
            );

          return null;
        })}

        {/* 查询和重置按钮 */}
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
          <Button htmlType="button" onClick={() => message.info('重置')} icon={<ReloadOutlined />}>
            重置
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default SearchForm;
