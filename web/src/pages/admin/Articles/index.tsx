/*
 * @Author: yolo
 * @Date: 2025-09-12 10:02:24
 * @LastEditors: yolo
 * @LastEditTime: 2025-12-22 01:21:31
 * @FilePath: /web/src/pages/admin/Articles/index.tsx
 * @Description: 文章管理页面
 */

import { useEffect, useState, useRef } from 'react';
import { Button, Table, Tooltip, Modal } from 'antd';
import type { TableColumnsType, TableProps, UploadFile } from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  SendOutlined,
  EyeOutlined,
  EditOutlined,
  UploadOutlined
} from '@ant-design/icons';
import api from '@/api';
import { useAppSelector } from '@/store/hooks';
import type { tagItem } from '@/types/app/common';
import BaseForm from '@/components/DynamicForm/BaseForm';
import AdvancedForm from '@/components/DynamicForm/AdvancedForm';
import type { DynamicFormItem, DynamicFormRef } from '@/components/DynamicForm/types';

type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];

interface DataType {
  id: number;
  author: string;
  title: number;
  coverImage: string;
  category: string;
  tag: string;
  viewCount: number;
  favoriteCount: number;
  createdAt: string;
}

interface ImportFormValues {
  title: string;
  summary: string;
  categoryId: number;
  tagIds: number[];
  file: UploadFile[];
  image: UploadFile[];
}

interface SearchFormValues {
  keyword: string;
  categoryId: number;
  tagIds: number[];
  dateRange: string[];
  userId: number;
}

const Articles = () => {
  const { categoryRoutes } = useAppSelector((state) => state.navigation);
  // 文章导入表单
  const [formItems, setFormItems] = useState<DynamicFormItem[]>([
    {
      label: '文章标题',
      name: 'title',
      type: 'input' as const,
      required: true,
      pattern: /^.{4,50}$/,
      tip: '文章标题长度应在4-50个字符之间!'
    },
    {
      label: '文章摘要',
      name: 'summary',
      type: 'textarea' as const,
      required: true,
      pattern: /^.{16,150}$/,
      tip: '输入长度必须大于等于16字符小于等于150字符',
      rows: { minRows: 3 },
      maxLength: 150
    },
    {
      label: '文章分类',
      name: 'categoryId',
      type: 'select' as const,
      required: true,
      options: categoryRoutes.map((item) => ({
        label: item.meta?.title || '未命名',
        value: item.id
      })),
      onChange: (value) => {
        console.log(129, value);
      }
    },
    {
      label: '文章标签',
      name: 'tagIds',
      type: 'select' as const,
      required: true,
      mode: 'multiple',
      maxCount: 3,
      options: []
    },
    {
      label: '文章上传',
      name: 'file',
      type: 'uploadFile' as const,
      required: true,
      accept: '.md',
      hint: '仅支持Markdown文件（.md）。严禁上传违禁文件。'
    },
    {
      label: '文章封面',
      name: 'image',
      type: 'uploadImg' as const,
      accept: 'image/png,image/jpeg,image/jpg',
      listType: 'picture-card' as const
    }
  ]);
  // 文章查询表单
  const [searchOptions, setSearchOptions] = useState<DynamicFormItem[]>([
    {
      label: '关键词',
      name: 'keyword',
      type: 'input' as const,
      labelCol: 6,
      wrapperCol: 18
    },
    {
      label: '分类',
      name: 'categoryId',
      type: 'select' as const,
      width: 230,
      labelCol: 7,
      wrapperCol: 17,
      options: categoryRoutes.map((item) => ({
        label: item.meta?.title || '未命名',
        value: item.id
      })),
      onChange: (value) => {
        console.log(129, value);
        if (value) getTags({ categoryId: value as number });
      }
    },
    {
      label: '标签',
      name: 'tagIds',
      type: 'select' as const,
      mode: 'multiple' as const,
      disabled: true,
      maxCount: 3,
      labelCol: 6,
      wrapperCol: 18,
      options: []
    },
    {
      label: '起止时间',
      name: 'dateRange',
      type: 'rangePicker' as const,
      labelCol: 6,
      wrapperCol: 18
    },
    {
      label: '作者',
      name: 'userId',
      type: 'input' as const,
      width: 250,
      labelCol: 6,
      wrapperCol: 18
    }
  ]);
  // 文章批量处理key
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  // 文章列表数据
  const [tableDatas, setTableDatas] = useState<DataType[]>([]);
  // 所有文章标签
  const [allTags, setAllTags] = useState<tagItem[]>([]);
  // 分类文章对应的所有标签
  const [tags, setTags] = useState<tagItem[]>([]);
  // 是否打开文章导入对话框
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 文章导入表单对象
  const importFormRef = useRef<DynamicFormRef<ImportFormValues>>(null);
  // 文章查询表单对象
  const searchFormRef = useRef<DynamicFormRef<SearchFormValues>>(null);
  // 文章列表表头
  const [columns] = useState<TableColumnsType<DataType>>([
    { title: '作者', dataIndex: 'userId', align: 'center' },
    { title: '标题', dataIndex: 'title', align: 'center' },
    { title: '封面', dataIndex: 'coverImage', align: 'center' },
    { title: '分类', dataIndex: 'category', align: 'center' },
    { title: '标签', dataIndex: 'tag', align: 'center' },
    { title: '浏览量', dataIndex: 'viewCount', align: 'center' },
    { title: '收藏量', dataIndex: 'favoriteCount', align: 'center' },
    { title: '发布时间', dataIndex: 'createdAt', align: 'center' },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      fixed: 'right',
      width: 220,
      render: (_, record) => (
        <>
          <Tooltip placement="bottom" title="查看">
            <Button shape="circle" onClick={() => viewArticle(record.id)} icon={<EyeOutlined />} />
          </Tooltip>

          <Tooltip placement="bottom" title="导出">
            <Button
              shape="circle"
              onClick={() => exportArticle(record.id)}
              icon={<DownloadOutlined />}
            />
          </Tooltip>

          <Tooltip placement="bottom" title="编辑">
            <Button shape="circle" onClick={() => editArticle(record.id)} icon={<EditOutlined />} />
          </Tooltip>

          <Tooltip placement="bottom" title="删除">
            <Button
              shape="circle"
              onClick={() => deleteArticle(record.id)}
              color="danger"
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        </>
      )
    }
  ]);

  useEffect(() => {
    getTags();
  }, []);

  /**
   * @description: 获取所有标签或者分类对应文章下的标签
   * @param {object} params
   * @return {*}
   */
  const getTags = async (params: { categoryId?: number } = {}) => {
    if (JSON.stringify(params) === '{}') {
      const res = await api.tagApi.getTags();
      const datas = res.data || [];
      const tags = datas.map((item) => ({
        label: item.name,
        value: item.id
      }));

      // 获取全部标签
      setFormItems((prev) =>
        prev.map((item) => (item.name === 'tagIds' ? { ...item, options: tags } : item))
      );
    } else {
      const res = await api.categoryApi.getTagsByCategory(params as { categoryId: number });
      const datas = res.data || [];
      const tags = datas.map((item) => ({
        label: item.name,
        value: item.id
      }));

      // 根据分类获取对应的标签
      setSearchOptions((prev) =>
        prev.map((item) =>
          item.name === 'tagIds'
            ? ({ ...item, options: tags, disabled: false } as typeof item)
            : item
        )
      );
    }
  };

  /**
   * @description: 表格复选框勾选事件
   * @param {React} newSelectedRowKeys 复选框勾选行key数组
   * @return {*}
   */
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // 表格行可选择配置
  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  /**
   * @description: 查看文章
   * @param {number} id 文章id
   * @return {*}
   */
  const viewArticle = (id: number) => {
    console.log('查看文章', id);
  };

  /**
   * @description: 导出文章
   * @param {number} id 文章id
   * @return {*}
   */
  const exportArticle = (id: number) => {
    console.log('导出文章', id);
  };

  /**
   * @description: 编辑文章
   * @param {number} id 文章id
   * @return {*}
   */
  const editArticle = (id: number) => {
    console.log('编辑文章', id);
  };

  /**
   * @description: 删除文章
   * @param {number} id 文章id
   * @return {*}
   */
  const deleteArticle = (id: number) => {
    console.log('删除文章', id);
  };

  /**
   * @description: 文章导入
   * @return {*}
   */
  const handleImport = () => {
    importFormRef
      .current!.validateForm()
      .then((values) => {
        const { title, summary, categoryId, tagIds, file, image } = values;
        const formData = new FormData();
        formData.append('title', title!);
        formData.append('summary', summary!);
        formData.append('categoryId', categoryId!.toString());
        formData.append('tagIds', JSON.stringify(tagIds));
        formData.append('file', file![0].originFileObj!);
        if (image && image.length) formData.append('image', image[0].originFileObj!);
        api.articleApi.uploadArticle(formData);
      })
      .catch(() => {
        importFormRef.current!.scrollToFirstError();
        console.log('表单校验失败');
      });
  };

  const handleSearch = (values: SearchFormValues) => {
    console.log(336, values);
  };

  return (
    <div className="article-manage-container">
      {/* 查询表单 */}
      <AdvancedForm<SearchFormValues>
        formItems={searchOptions}
        handleSubmit={handleSearch}
        showFooter
        ref={searchFormRef}
      />

      <div className="article-management-main">
        <div className="article-function-buttons">
          <Button
            type="primary"
            icon={<SendOutlined rotate={-45} style={{ verticalAlign: 'unset' }} />}
          >
            文章发布
          </Button>

          <Button type="primary" icon={<DownloadOutlined />}>
            批量导出
          </Button>

          <Button danger icon={<DeleteOutlined />}>
            批量删除
          </Button>

          <Button onClick={() => setIsModalOpen(true)} icon={<UploadOutlined />}>
            文章导入
          </Button>
        </div>

        <Table<DataType>
          rowSelection={rowSelection}
          columns={columns}
          dataSource={tableDatas}
          scroll={{ x: 1500 }}
          rowKey="id"
        />
      </div>

      <Modal
        title="文章导入"
        width="580px"
        maskClosable={false}
        open={isModalOpen}
        onOk={handleImport}
        onCancel={() => setIsModalOpen(false)}
      >
        {/* 文章导入表单 */}
        <BaseForm
          layout={'horizontal'}
          formItems={formItems}
          labelCol={5}
          wrapperCol={19}
          showFooter={false}
          ref={importFormRef}
        />
      </Modal>
    </div>
  );
};

export default Articles;
