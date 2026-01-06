import { Form } from 'antd';
import type { DynamicFormItem, EventParams, FormUpdateValues } from '../types';
import { format } from '../types';
import dayjs from 'dayjs';

export function useForm<TValues extends object>(
  formItems: DynamicFormItem[],
  handleSubmit?: (values: TValues) => void // 表单提交方法
) {
  const [form] = Form.useForm();

  /**
   * @description: 更新表单值的预处理方法
   * @param {K} name 表单项字段名
   * @param {TValues[K]} value 表单项值
   * @return {Partial<Record<keyof TValues, unknown>>}
   */
  const processSetFormValues = <K extends Extract<keyof TValues, string>>(
    name: K,
    value: TValues[K]
  ): Partial<FormUpdateValues<TValues>> => {
    const result: Partial<FormUpdateValues<TValues>> = {};
    const formItem = formItems.find((item) => item.name === name);
    if (formItem) {
      switch (formItem.type) {
        case 'datePicker':
          if (value) {
            if (
              typeof value === 'string' &&
              dayjs(value, format[formItem.picker || 'date'], true).isValid()
            ) {
              (result as Record<string, unknown>)[name] = dayjs(
                value,
                format[formItem.picker || 'date']
              );
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
              (result as Record<string, unknown>)[name] = [
                dayjs(value[0], format[formItem.picker || 'date'])
              ];
              if (value[1])
                (result as Record<string, unknown>)[name] = [
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
          (result as Record<string, unknown>)[name] = value;
          break;
      }
    }

    return result;
  };

  /**
   * @description: 获取表单值的预处理方法
   * @param {Partial<TValues>} values
   * @return {Partial<TValues>} finalValues
   */
  const processGetFormValues = (values: Partial<TValues>): Partial<TValues> => {
    const finalValues: Partial<TValues> = {};
    for (const key of Object.keys(values) as (keyof TValues)[]) {
      const formItem = formItems.find((item) => item.name === key);
      if (!formItem) continue;

      const value = values[key];
      if (value === null || value === undefined) {
        finalValues[key] = value;
        continue;
      }

      switch (formItem.type) {
        case 'password':
          break;
        case 'datePicker':
          finalValues[key] = (value as unknown as dayjs.Dayjs).format(
            format[formItem.picker || 'date']
          ) as TValues[typeof key];
          break;
        case 'rangePicker':
          finalValues[key] = (value as dayjs.Dayjs[]).map(
            (item) => item && item.format(format[formItem.picker || 'date'])
          ) as TValues[typeof key];
          break;
        default:
          finalValues[key] = value;
          break;
      }
    }

    return finalValues;
  };

  /**
   * @description: 批量设置表单项的值
   * @param {Partial<TValues>} values
   * @return {*}
   */
  const setFields = (values: Partial<TValues>) => {
    try {
      const updateValues: Partial<Record<keyof TValues, unknown>> & Record<string, unknown> = {};

      for (const key of Object.keys(values) as (keyof TValues)[]) {
        const k = key as Extract<keyof TValues, string>;
        const value = values[k] as TValues[typeof k]; // ✅ 关键断言
        Object.assign(updateValues, processSetFormValues(k, value));
      }

      form.setFieldsValue(updateValues);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * @description: 设置单个表单项的值
   * @param {K} name
   * @param {TValues[K]} string
   * @return {*}
   */
  const setField = <K extends Extract<keyof TValues, string>>(name: K, value: TValues[K]) => {
    const updateValues = processSetFormValues(name, value);
    form.setFieldValue(name, updateValues[name]);
  };

  /**
   * @description: 获取整个表单中（或指定字段）的所有值
   * @param {string[]} names 表单项的字段名数组
   * @return {*}
   */
  /** ===== 重载声明 ===== */
  function getFields(): Partial<TValues>;
  function getFields<K extends Extract<keyof TValues, string>>(
    names: K[]
  ): Partial<Pick<TValues, K>>;
  function getFields<K extends Extract<keyof TValues, string>>(names?: K[]) {
    if (names) {
      return processGetFormValues(form.getFieldsValue(names));
    } else {
      return processGetFormValues(form.getFieldsValue());
    }
  }

  /**
   * @description: 获取单个表单项的值
   * @param {sting} name 表单项的字段名
   * @return {*}
   */
  const getField = <K extends Extract<keyof TValues, string>>(name: K): TValues[K] | undefined => {
    const values = processGetFormValues({
      [name]: form.getFieldValue(name)
    } as Partial<TValues>);

    return values[name];
  };

  /**
   * @description: 重置整个表单中（或指定字段）的所有值
   * @param {Extract<keyof TValues, string>[]} names
   * @return {*}
   */
  const resetForm = (names?: Extract<keyof TValues, string>[]) => {
    if (names) {
      form.resetFields(names);
    } else {
      form.resetFields();
    }
  };

  /**
   * @description: 校验整个表单中（或指定字段）的所有值
   * @param {Extract<keyof TValues, string>[]} names
   * @return {*}
   */
  const validateForm = (names?: Extract<keyof TValues, string>[]) => {
    if (names) {
      return form.validateFields(names);
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
   * @param {TValues extends object} values
   * @return {*}
   */
  const onFinish = (values: TValues) => {
    const finalValues = processGetFormValues(values);
    if (handleSubmit) handleSubmit(finalValues as TValues);
  };

  return {
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
  };
}
