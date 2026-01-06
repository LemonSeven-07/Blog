/*
 * @Author: yolo
 * @Date: 2025-09-12 10:02:24
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-07 04:57:34
 * @FilePath: /web/src/pages/admin/Articles/index.tsx
 * @Description: 文章管理页面
 */

import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button, Table, Tooltip, Modal, Tag } from 'antd';
import type { TableColumnsType, TableProps, UploadFile, TablePaginationConfig } from 'antd';
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
import BaseForm from '@/components/DynamicForm/BaseForm';
import AdvancedForm from '@/components/DynamicForm/AdvancedForm';
import type { DynamicFormItem, DynamicFormRef } from '@/components/DynamicForm/types';

type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];

interface DataType {
  id: number;
  user: {
    id: number;
    username: string;
  };
  title: string;
  coverImage: string;
  category: {
    id: number;
    name: string;
  };
  tags: {
    id: number;
    name: string;
  }[];
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
  tagId: number;
  publishTimeRange: string[];
  author?: string;
}

// 文章标签显示颜色
const tagColor = ['geekblue', 'purple', 'cyan'];

const Articles = () => {
  const { categoryRoutes } = useAppSelector((state) => state.navigation);
  const { role } = useAppSelector((state) => state.userInfo);
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
      }))
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
        searchFormRef.current?.resetForm(['tagId']);
        if (value) getTags({ categoryId: value as number });
      }
    },
    {
      label: '标签',
      name: 'tagId',
      type: 'select' as const,
      disabled: true,
      maxCount: 3,
      labelCol: 6,
      wrapperCol: 18,
      options: []
    },
    {
      label: '发布起止时间',
      name: 'publishTimeRange',
      type: 'rangePicker' as const,
      labelCol: 7,
      wrapperCol: 17
    }
  ]); // 非管理员不显示作者查询条件
  // 文章批量处理key
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState({
    pageNum: 1, // 当前页
    pageSize: 10, // 每页条数
    total: 0 // 总条数（后端返回）
  });
  // 文章列表数据
  const [tableDatas, setTableDatas] = useState<DataType[]>([]);
  // 是否打开文章导入对话框
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 文章导入表单对象
  const importFormRef = useRef<DynamicFormRef<ImportFormValues>>(null);
  // 文章查询表单对象
  const searchFormRef = useRef<DynamicFormRef<SearchFormValues>>(null);
  // 文章列表表头
  const [columns] = useState<TableColumnsType<DataType>>([
    { title: '作者', dataIndex: 'user', align: 'center', render: (value) => value.username },
    { title: '标题', dataIndex: 'title', align: 'center' },
    {
      title: '封面',
      dataIndex: 'coverImage',
      align: 'center',
      render: (value) =>
        value ? (
          <img src={value} alt="" style={{ width: '90px', height: '60px', objectFit: 'cover' }} />
        ) : (
          ''
        )
    },
    { title: '分类', dataIndex: 'category', align: 'center', render: (value) => value.name },
    {
      title: '标签',
      dataIndex: 'tags',
      align: 'center',
      render: (value) => {
        return (
          <div>
            {value.map((tag: { id: number; name: string }, index: number) => (
              <Tag color={tagColor[index]} key={tag.id}>
                {tag.name}
              </Tag>
            ))}
          </div>
        );
      }
    },
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
            <Link to={`/article/${record.id}`} style={{ marginRight: '12px' }}>
              <Button shape="circle" icon={<EyeOutlined />} />
            </Link>
          </Tooltip>

          <Tooltip placement="bottom" title="导出">
            <Button
              shape="circle"
              onClick={() => exportArticle(record.id)}
              icon={<DownloadOutlined />}
              style={{ marginRight: '12px' }}
            />
          </Tooltip>

          <Tooltip placement="bottom" title="编辑">
            <Button
              shape="circle"
              onClick={() => editArticle(record.id)}
              icon={<EditOutlined />}
              style={{ marginRight: '12px' }}
            />
          </Tooltip>

          <Tooltip placement="bottom" title="删除">
            <Button
              shape="circle"
              onClick={() => deleteArticle(record.id)}
              danger
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        </>
      )
    }
  ]);

  useEffect(() => {
    // 超级管理员可按文章作者查询，普通管理员不可见该查询条件只能查自身发布的文章
    if (role === 1) {
      setSearchOptions([
        ...searchOptions,
        {
          label: '文章作者',
          name: 'author',
          type: 'input' as const,
          width: 240,
          labelCol: 8,
          wrapperCol: 16
        }
      ]);
    }
    getTags();
    getArticles({ pageNum: 1, pageSize: 10 });
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
          item.name === 'tagId'
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
    fixed: 'left',
    onChange: onSelectChange
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
      });
  };

  /**
   * @description: 调取文章分页查询接口
   * @param {*} params 参数报文
   * @return {*}
   */
  const getArticles = async (
    values: Partial<SearchFormValues & { pageNum: number; pageSize: number }>
  ) => {
    const {
      keyword,
      categoryId,
      tagId,
      author,
      publishTimeRange,
      pageNum = 1,
      pageSize = 10
    } = values;
    const params = {
      pageNum,
      pageSize,
      keyword,
      categoryId,
      tagId,
      author,
      publishTimeRange: publishTimeRange ? publishTimeRange.join() : publishTimeRange
    };
    console.log(419, params);
    const res = await api.articleApi.getArticles(params);
    const { list, total } = res.data;
    setPagination({ pageNum, pageSize, total });
    setTableDatas(list);
  };

  /**
   * @description: 文章查询
   * @param {SearchFormValues} values
   * @return {*}
   */
  const handleSearch = (values: SearchFormValues) => {
    getArticles({ ...values, pageNum: pagination.pageNum, pageSize: pagination.pageSize });
  };

  /**
   * @description: 分页、排序、筛选变化时触发
   * @param {TablePaginationConfig} value
   * @return {*}
   */
  const handlePaginationChange = (value: TablePaginationConfig) => {
    const { current: pageNum = 1, pageSize = 10, total = 0 } = value;
    setPagination({
      pageNum,
      pageSize,
      total
    });

    searchFormRef.current?.validateForm().then((values) => {
      getArticles({ ...values, pageNum, pageSize });
    });
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

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            disabled={selectedRowKeys.length ? false : true}
          >
            批量导出
          </Button>

          <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length ? false : true}>
            批量删除
          </Button>

          <Button onClick={() => setIsModalOpen(true)} icon={<UploadOutlined />}>
            文章导入
          </Button>
        </div>

        <Table<DataType>
          rowKey="id"
          rowSelection={rowSelection}
          columns={columns}
          dataSource={tableDatas}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: pagination.pageNum,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true, // 是否可切换 pageSize
            showQuickJumper: true, // 是否可快速跳页
            showTotal: (total) => `共 ${total} 条`
          }}
          onChange={handlePaginationChange}
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
