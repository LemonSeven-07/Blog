/*
 * @Author: yolo
 * @Date: 2025-09-12 10:02:24
 * @LastEditors: yolo
 * @LastEditTime: 2026-02-27 04:20:02
 * @FilePath: /web/src/pages/admin/Articles/index.tsx
 * @Description: 文章管理页面
 */

import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button, Table, Tooltip, Modal, Tag, message } from 'antd';
import type { TableColumnsType, TableProps, UploadFile, TablePaginationConfig } from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  SendOutlined,
  EyeOutlined,
  EditOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import api from '@/api';
import { Utils } from '@/utils';
import { useAppSelector } from '@/store/hooks';
import BaseForm from '@/components/DynamicForm/BaseForm';
import AdvancedForm from '@/components/DynamicForm/AdvancedForm';
import type { DynamicFormItem, DynamicFormRef } from '@/components/DynamicForm/types';
import ArticleBuilder from './ArticleBuilder';
import { type RowData } from './types';

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
const tagColor = ['green', 'cyan', 'purple'];

const Articles = () => {
  const { categoryRoutes } = useAppSelector((state) => state.navigation);
  const { role } = useAppSelector((state) => state.userInfo);
  // 文章导入表单
  const [formItems, setFormItems] = useState<DynamicFormItem[]>([
    {
      label: '标题',
      name: 'title',
      type: 'input' as const,
      required: true,
      pattern: /^.{4,50}$/,
      tip: '文章标题长度应在4-50个字符之间!'
    },
    {
      label: '上传',
      name: 'file',
      type: 'uploadFile' as const,
      required: true,
      accept: '.md',
      hint: '仅支持Markdown文件（.md）。严禁上传违禁文件。'
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
      options: categoryRoutes
        .map((item) => ({
          label: item.meta?.title || '未命名',
          value: item.meta.categoryId
        }))
        .concat([
          {
            label: '未分类',
            value: 0
          }
        ]),
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
  // 当前编辑文章数据
  const [selectedRowData, setSelectedRowData] = useState<RowData | null>(null);
  // 文章导入表单对象
  const importFormRef = useRef<DynamicFormRef<ImportFormValues>>(null);
  // 文章查询表单对象
  const searchFormRef = useRef<DynamicFormRef<SearchFormValues>>(null);
  // 文章列表表头
  const [columns] = useState<TableColumnsType<DataType>>([
    {
      title: '作者',
      dataIndex: 'user',
      align: 'center',
      render: (value) =>
        value.deletedAt ? (
          <div>
            <span>{value.username}</span>
            <span style={{ color: 'red' }}>(账号已注销)</span>
          </div>
        ) : (
          value.username
        )
    },
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
    {
      title: '分类',
      dataIndex: 'category',
      align: 'center',
      render: (value) => (value ? value.name : <span style={{ color: '#d6d6d6' }}>未分类</span>)
    },
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
              <Button shape="circle" color="primary" variant="outlined" icon={<EyeOutlined />} />
            </Link>
          </Tooltip>

          <Tooltip placement="bottom" title="导出">
            <Button
              shape="circle"
              color="primary"
              variant="outlined"
              onClick={() => exportArticle('single', [record.id])}
              icon={<DownloadOutlined />}
              style={{ marginRight: '12px' }}
            />
          </Tooltip>

          <Tooltip placement="bottom" title="编辑">
            <Button
              shape="circle"
              color="primary"
              variant="outlined"
              onClick={() =>
                editArticle(
                  record as DataType & { content: string; summary: string; categoryId: number }
                )
              }
              icon={<EditOutlined />}
              style={{ marginRight: '12px' }}
            />
          </Tooltip>

          <Tooltip placement="bottom" title="删除">
            <Button
              shape="circle"
              onClick={() => deleteArticles([record.id])}
              danger
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        </>
      )
    }
  ]);
  // 是否显示文章发布获文章修改界面
  const [isShow, setIsShow] = useState(false);
  // 文章是否是编辑模式。true 编辑模式 false 发布模式
  const [isEdit, setIsEdit] = useState(false);

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
   * @param {'single' | 'batch' | 'all'} type 文章导出操作类型 single 单篇导出 batch 多篇导出 all 全部导出
   * @param {number[] | null} ids 文章 id 数组
   * @return {*}
   */
  const exportArticle = async (type: 'single' | 'batch' | 'all', ids: number[] | null) => {
    let result = null;
    if (type === 'single' || type === 'batch') {
      // 单篇文章获多篇文章导出
      const params = { ids: ids ? ids.join() : (selectedRowKeys as number[]).join() };
      result = await api.articleApi.outputArticles(params, { responseType: 'blob' });

      // 清空批量已选择的文章
      if (type === 'batch') setSelectedRowKeys([]);
    } else {
      // 导出所有文章
      result = await api.articleApi.outputArticles({}, { responseType: 'blob' });
    }

    // 获取 Content-Disposition 头部
    const disposition = result.headers['content-disposition'] as string;
    // 获取加密的文件名
    const encodedFilename = disposition && disposition.match(/filename=([^;]+)/)?.[1];
    if (encodedFilename) {
      // 解密文件名
      const decodedFilename = decodeURIComponent(encodedFilename);
      // 文件下载
      Utils.downloadFile(decodedFilename, result.data);
    }
  };

  /**
   * @description: 编辑文章
   * @param {number} id 文章id
   * @return {*}
   */
  const editArticle = (
    row: DataType & { content: string; summary: string; categoryId: number }
  ) => {
    const { id, title, content, summary, categoryId, tags, coverImage } = row;
    const uid = uuidv4();
    setSelectedRowData({
      id,
      title,
      content,
      summary,
      categoryId,
      tagIds: tags.map((tag) => tag.id),
      image: [
        {
          uid: coverImage.match(/([^/]+)(?=\.[a-zA-Z0-9]+$)/)?.[0] || uid,
          name: coverImage.match(/([^/]+\.[a-zA-Z0-9]+)$/)?.[0] || uid + '.jpg',
          status: 'done',
          url: coverImage
        }
      ]
    });
    setIsEdit(true);
    setIsShow(true);
  };

  /**
   * @description: 发布文章
   * @return {*}
   */
  const publishArticle = () => {
    setSelectedRowData(null);
    setIsEdit(false);
    setIsShow(true);
  };

  /**
   * @description: 删除文章
   * @param {number} ids 文章 id 数组
   * @return {*}
   */
  const deleteArticles = async (ids: number[] | null) => {
    Modal.confirm({
      title: '系统提示',
      content: '您确定要删除该文章吗?',
      okText: '确认',
      cancelText: '取消',
      async onOk() {
        const params = { ids: ids ? ids : (selectedRowKeys as number[]) };
        const res = await api.articleApi.deleteArticles(params);
        message.success(res.message);
        // 清空已选择的文章
        setSelectedRowKeys([]);
        // 重新获取文章列表
        getArticles({ pageNum: 1, pageSize: pagination.pageSize });
      },
      onCancel() {}
    });
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
    const res = await api.articleApi.getAllArticles(params);
    const { list, total } = res.data;
    if (total > 0 && !list.length) {
      getArticles({
        keyword,
        categoryId,
        tagId,
        author,
        publishTimeRange,
        pageNum: 1,
        pageSize
      });
      return;
    }
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

  /**
   * @description: 关闭文章发布/编辑界面
   * @return {*}
   */
  const closeBuilder = (isRefresh?: boolean) => {
    setIsShow(false);
    if (isRefresh) {
      searchFormRef.current?.validateForm().then((values) => {
        getArticles({ ...values, pageNum: pagination.pageNum, pageSize: pagination.pageSize });
      });
    }
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
            onClick={publishArticle}
          >
            文章发布
          </Button>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => exportArticle('all', null)}
          >
            全部导出
          </Button>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            disabled={selectedRowKeys.length ? false : true}
            onClick={() => exportArticle('batch', null)}
          >
            批量导出
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={selectedRowKeys.length ? false : true}
            onClick={() => deleteArticles(null)}
          >
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

      {isShow && (
        <ArticleBuilder
          isEdit={isEdit}
          rowData={selectedRowData}
          cancel={(isRefresh) => closeBuilder(isRefresh)}
        />
      )}

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
