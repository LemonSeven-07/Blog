/*
 * @Author: yolo
 * @Date: 2026-01-29 18:26:03
 * @LastEditors: yolo
 * @LastEditTime: 2026-02-27 02:02:45
 * @FilePath: /web/src/pages/admin/Articles/ArticleBuilder/index.tsx
 * @Description: 文章发布和修改界面
 */

import { memo, useState, useRef, useEffect } from 'react';
import { Button, Modal, message } from 'antd';
import BaseForm from '@/components/DynamicForm/BaseForm';
import type { DynamicFormItem, DynamicFormRef } from '@/components/DynamicForm/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setDraftContent } from '@/store/modules/draft';
import api from '@/api';
import type { FormValues, RowData } from '../types';

interface ArticleBuilderProp {
  rowData: RowData | null;
  isEdit: boolean;
  cancel: (isRefresh?: boolean) => void;
}

const ArticleBuilder = ({ rowData, isEdit, cancel }: ArticleBuilderProp) => {
  const { categoryRoutes } = useAppSelector((state) => state.navigation);
  const { content: draftContent } = useAppSelector((state) => state.draft);
  const dispatch = useAppDispatch();
  const [formItems, setFormItems] = useState<DynamicFormItem[]>([
    {
      label: '标题',
      name: 'title',
      type: 'input' as const,
      required: true,
      pattern: /^.{4,50}$/,
      tip: '标题长度应在4-50个字符之间!'
    },
    {
      label: '内容',
      name: 'content',
      type: 'markdown' as const,
      required: true,
      value: rowData ? rowData.content : ''
    },
    {
      label: '摘要',
      name: 'summary',
      type: 'textarea' as const,
      required: true,
      pattern: /^.{16,150}$/,
      tip: '输入长度必须大于等于16字符小于等于150字符',
      rows: { minRows: 3 },
      maxLength: 150
    },
    {
      label: '分类',
      name: 'categoryId',
      type: 'select' as const,
      required: true,
      options: categoryRoutes.map((item) => ({
        label: item.meta?.title || '未命名',
        value: item.meta.categoryId
      }))
    },
    {
      label: '标签',
      name: 'tagIds',
      type: 'select' as const,
      required: true,
      mode: 'multiple',
      maxCount: 3,
      options: []
    },
    {
      label: '封面',
      name: 'image',
      type: 'uploadImg' as const,
      accept: 'image/png,image/jpeg,image/jpg',
      listType: 'picture-card' as const
    }
  ]);
  const formRef = useRef<DynamicFormRef<FormValues>>(null);

  useEffect(() => {
    getTags();

    if (!isEdit && draftContent.trim().length) {
      Modal.confirm({
        title: '系统提示',
        content: '您有未发布的草稿，是否继续编辑？',
        okText: '是',
        cancelText: '否',
        onOk() {
          formRef.current?.setField('content', draftContent);
          setFormItems((prev) =>
            prev.map((item) => (item.name === 'content' ? { ...item, value: draftContent } : item))
          );
          dispatch(setDraftContent({ content: '' }));
        },
        onCancel() {}
      });
    }
  }, []);

  /**
   * @description: 获取所有标签
   * @return {*}
   */
  const getTags = async () => {
    const res = await api.tagApi.getTags({ pageNum: 1, pageSize: 1000 });
    const { list = [] } = res.data;
    const tags = list.map((item) => ({
      label: item.name,
      value: item.id
    }));

    // 获取全部标签
    setFormItems((prev) =>
      prev.map((item) => (item.name === 'tagIds' ? { ...item, options: tags } : item))
    );

    // 如果是编辑文章，设置表单初始值
    if (isEdit && rowData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...initVaules } = rowData;
      formRef.current?.setFields(initVaules);
    }
  };

  /**
   * @description: 表单提交事件
   * @return {*}
   */
  const onOk = () => {
    formRef.current
      ?.validateForm()
      .then(async (values) => {
        const { title, summary, categoryId, tagIds, image, content } = values;
        const formData = new FormData();
        formData.append('title', title!);
        formData.append('summary', summary!);
        formData.append('categoryId', categoryId!.toString());
        formData.append('tagIds', JSON.stringify(tagIds));
        // 优化处理：只有当内容或封面图片发生修改时才上传，避免不必要的网络请求
        if (!isEdit || (isEdit && rowData && rowData.content !== content!.trim()))
          formData.append('content', content!.trim());
        if (
          image &&
          image.length &&
          (!isEdit ||
            (isEdit && rowData && JSON.stringify(rowData?.image) !== JSON.stringify(image)))
        )
          formData.append('image', image[0].originFileObj!);

        if (isEdit) {
          const { id, ...initValues } = rowData!;
          if (JSON.stringify(initValues) === JSON.stringify(values))
            return message.warning('您未修改任何内容，无需保存！');

          const res = await api.articleApi.updateArticle(formData, id);
          message.success(res.message);
        } else {
          const res = await api.articleApi.publishArticle(formData);
          message.success(res.message);
        }

        cancel(true);
      })
      .catch(() => {
        formRef.current!.scrollToFirstError();
      });
  };

  return (
    <div className="article-builder-container">
      <div className="article-builder-header">
        <div className="article-builder-title">{isEdit ? '文章编辑' : '文章发布'}</div>

        <div className="article-builder-btn">
          <Button style={{ marginRight: '8px' }} onClick={() => cancel(false)}>
            取消
          </Button>

          <Button type="primary" onClick={onOk}>
            {isEdit ? '保存' : '发布'}
          </Button>
        </div>
      </div>

      <div className="article-builder-main">
        <BaseForm
          layout={'vertical'}
          formItems={formItems}
          labelCol={24}
          wrapperCol={24}
          showFooter={false}
          ref={formRef}
        />
      </div>
    </div>
  );
};

export default memo(ArticleBuilder);
