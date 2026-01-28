/*
 * @Author: yolo
 * @Date: 2026-01-12 03:27:46
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-29 05:14:34
 * @FilePath: /web/src/pages/admin/Categories/index.tsx
 * @Description: 分类管理页面
 */

import { useState, useRef, useEffect } from 'react';
import { Table, Tooltip, Button, Modal, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableColumnsType, TableProps, TablePaginationConfig } from 'antd';
import AdvancedForm from '@/components/DynamicForm/AdvancedForm';
import type { DynamicFormItem, DynamicFormRef } from '@/components/DynamicForm/types';
import BaseForm from '@/components/DynamicForm/BaseForm';
import api from '@/api';
import { setPhase } from '@/store/modules/user';
import { useAppDispatch } from '@/store/hooks';

type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];

interface DataType {
  id: number;
  name: string;
  slug: string;
  icon: string;
  createdAt: string;
}

interface SearchFormValues {
  name?: string;
  createDate?: string[];
}

interface FnParams {
  pageNum: number;
  pageSize: number;
  name?: string;
  createDate?: string[];
}

interface FormValues {
  name: string;
  slug: string;
  icon: string;
}

const Categories = () => {
  const dispatch = useAppDispatch();
  // 是否对分类进行了操作
  const isOptCategoty = useRef<boolean>(false);
  // 分类查询表单对象
  const searchFormRef = useRef<DynamicFormRef<SearchFormValues>>(null);
  // 分类列表数据
  const [tableDatas, setTableDatas] = useState<DataType[]>([]);
  // 表格数据加载状态
  const [loading, setLoading] = useState<boolean>(false);
  // 分类查询表单
  const [searchOptions] = useState<DynamicFormItem[]>([
    {
      label: '分类名',
      name: 'name',
      type: 'input' as const,
      labelCol: 6,
      wrapperCol: 18
    },
    {
      label: '创建时间',
      name: 'createDate',
      type: 'rangePicker' as const,
      labelCol: 7,
      wrapperCol: 17
    }
  ]);
  // 表格列配置
  const [columns, setColumns] = useState<TableColumnsType<DataType>>([
    { title: '分类名', dataIndex: 'name', align: 'center' },
    { title: '路由标识', dataIndex: 'slug', align: 'center' },
    { title: '分类图标', dataIndex: 'icon', align: 'center' },
    { title: '创建时间', dataIndex: 'createdAt', align: 'center' }
  ]);
  // 分类分页参数
  const [pagination, setPagination] = useState({
    pageNum: 1, // 当前页
    pageSize: 10, // 每页条数
    total: 0 // 总条数（后端返回）
  });
  // 分类批量处理key
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  // 新增/修改分类对话框状态
  const [open, setOpen] = useState<boolean>(false);
  // 当前操作数据
  const [rowData, setRowData] = useState<DataType | null>(null);
  // 分类新增/修改表单对象
  const [formItems] = useState<DynamicFormItem[]>([
    {
      label: '分类名',
      name: 'name',
      type: 'input' as const,
      required: true
    },
    {
      label: '路由标识',
      name: 'slug',
      type: 'input' as const,
      required: true
    },
    {
      label: '分类图标',
      name: 'icon',
      type: 'input' as const,
      required: false
    }
  ]);
  // 分类新增/修改表单ref
  const formRef = useRef<DynamicFormRef<FormValues>>(null);

  useEffect(() => {
    setColumns([
      ...columns,
      {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        fixed: 'right',
        width: 160,
        render: (_, record) => (
          <>
            <Tooltip placement="bottom" title="修改">
              <Button
                shape="circle"
                onClick={() => openEditModal(record)}
                color="primary"
                variant="outlined"
                icon={<EditOutlined />}
                style={{ marginRight: '0.75rem' }}
              />
            </Tooltip>

            <Tooltip placement="bottom" title="删除">
              <Button
                shape="circle"
                onClick={() => deleteCategories([record.id])}
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </>
        )
      }
    ]);

    getCategories({ pageNum: 1, pageSize: 10 });

    return () => {
      if (isOptCategoty.current) dispatch(setPhase({ phase: 'initializing' }));
    };
  }, []);

  /**
   * @description: 调取分类列表查询接口
   * @param {*} params 参数报文
   * @return {*}
   */
  const getCategories = async (values: FnParams) => {
    const { name, createDate, pageNum = 1, pageSize = 10 } = values;
    const params = {
      name,
      createDate: createDate ? createDate.join() : createDate,
      pageNum,
      pageSize
    };
    setLoading(true);
    const res = await api.categoryApi.getCategories(params);
    const { list, total } = res.data;
    if (total > 0 && !list.length) {
      getCategories({ name, createDate, pageNum: 1, pageSize });
      return;
    }
    setPagination({ pageNum, pageSize, total });
    setTableDatas(list);
    setLoading(false);
  };

  /**
   * @description: 分类列表查询
   * @param {SearchFormValues} values
   * @return {*}
   */
  const handleSearch = (values: SearchFormValues) => {
    getCategories({ ...values, pageNum: pagination.pageNum, pageSize: pagination.pageSize });
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
      getCategories({ ...values, pageNum, pageSize });
    });
  };

  /**
   * @description: 删除分类
   * @param {number} id 分类id
   * @return {*}
   */
  const deleteCategories = (ids: number[] | null) => {
    Modal.confirm({
      title: '系统提示',
      content: '您确定要删除该分类吗?',
      okText: '确认',
      cancelText: '取消',
      async onOk() {
        const params = { ids: ids ? ids : (selectedRowKeys as number[]) };
        const res = await api.categoryApi.deleteCategory(params);
        message.success(res.message);
        isOptCategoty.current = true;
        // 清空已选择的用户
        setSelectedRowKeys([]);
        // 重新获取分类列表
        getCategories({ pageNum: 1, pageSize: pagination.pageSize });
      },
      onCancel() {}
    });
  };

  /**
   * @description: 打开编辑模态框
   * @param {DataType} row 当前行数据
   * @return {*}
   */
  const openEditModal = (row: DataType | null) => {
    setRowData(row);
    setOpen(true);
  };

  /**
   * @description: 关闭模态框
   * @return {*}
   */
  const closeModal = () => {
    setOpen(false);
  };

  /**
   * @description: 创建/修改分类
   * @return {*}
   */
  const createOrUpdateCategory = () => {
    formRef.current?.validateForm().then(async (values) => {
      const { name = '', slug = '', icon = '' } = values;
      if (rowData) {
        if (rowData.name === name && rowData.slug === slug && rowData.icon === icon)
          return message.warning('无修改项！！！');
        // 修改分类
        const res = await api.categoryApi.updateCategory({ id: rowData.id, name, slug, icon });
        setOpen(false);
        message.success(res.message);
      } else {
        // 新增分类
        const res = await api.categoryApi.createCategory({ name, slug, icon });
        setOpen(false);
        message.success(res.message);
      }

      isOptCategoty.current = true;
      // 重新查询分类列表
      getCategories({ pageNum: 1, pageSize: pagination.pageSize });
    });
  };

  return (
    <div className="category-manage-container">
      {/* 查询表单 */}
      <AdvancedForm<SearchFormValues>
        formItems={searchOptions}
        handleSubmit={handleSearch}
        showFooter
        ref={searchFormRef}
      />

      <div className="category-management-main">
        <div className="category-function-buttons">
          <Button
            icon={<PlusOutlined />}
            color="primary"
            variant="solid"
            style={{ marginRight: '0.75rem' }}
            onClick={() => openEditModal(null)}
          >
            新增分类
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={selectedRowKeys.length ? false : true}
            onClick={() => deleteCategories(null)}
          >
            批量删除
          </Button>
        </div>

        <Table<DataType>
          rowKey="id"
          rowSelection={rowSelection}
          columns={columns}
          dataSource={tableDatas}
          scroll={{ x: 'max-content' }}
          loading={loading}
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
        title={rowData ? '修改分类' : '新增分类'}
        width={400}
        classNames={{
          content: 'categories-modal',
          header: 'categories-modal-header',
          body: 'categories-modal-body'
        }}
        closable={{ 'aria-label': '新增/修改分类对话框按钮' }}
        maskClosable={false}
        open={open}
        onCancel={closeModal}
        afterOpenChange={() => {
          // 修改时，设置表单默认值
          if (open && rowData && formRef.current) {
            const { name, slug, icon } = rowData;
            formRef.current?.setFields({ name, slug, icon });
          }
        }}
        onOk={createOrUpdateCategory}
        destroyOnHidden
      >
        {/* 分类新增/修改表单 */}
        <BaseForm
          layout={'horizontal'}
          formItems={formItems}
          labelCol={6}
          wrapperCol={18}
          showFooter={false}
          ref={formRef}
        />
      </Modal>
    </div>
  );
};

export default Categories;
