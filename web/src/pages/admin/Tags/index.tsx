/*
 * @Author: yolo
 * @Date: 2025-09-12 10:04:30
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-27 05:27:42
 * @FilePath: /web/src/pages/admin/Tags/index.tsx
 * @Description: 标签管理页面
 */

import { useState, useRef, useEffect } from 'react';
import { Table, Tooltip, Button, Modal, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableColumnsType, TableProps, TablePaginationConfig } from 'antd';
import AdvancedForm from '@/components/DynamicForm/AdvancedForm';
import type { DynamicFormItem, DynamicFormRef } from '@/components/DynamicForm/types';
import BaseForm from '@/components/DynamicForm/BaseForm';
import api from '@/api';
import { useAppSelector } from '@/store/hooks';

type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];

interface DataType {
  id: number;
  name: string;
  isBuiltin: boolean;
  createdAt: string;
}

interface SearchFormValues {
  name?: string;
  createDate?: string[];
  isBuiltin?: boolean;
}

interface FnParams {
  pageNum: number;
  pageSize: number;
  name?: string;
  createDate?: string[];
  isBuiltin?: boolean;
}

interface FormValues {
  name: string;
}

const Tags = () => {
  const { role } = useAppSelector((state) => state.userInfo);
  // 标签查询表单对象
  const searchFormRef = useRef<DynamicFormRef<SearchFormValues>>(null);
  // 标签列表数据
  const [tableDatas, setTableDatas] = useState<DataType[]>([]);
  // 表格数据加载状态
  const [loading, setLoading] = useState<boolean>(false);
  // 标签查询表单
  const [searchOptions] = useState<DynamicFormItem[]>([
    {
      label: '标签名',
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
    },
    {
      label: '是否内置',
      name: 'isBuiltin',
      type: 'select' as const,
      options: [
        {
          label: '是',
          value: 1
        },
        {
          label: '否',
          value: 0
        }
      ],
      labelCol: 8,
      wrapperCol: 16
    }
  ]);
  // 表格列配置
  const [columns] = useState<TableColumnsType<DataType>>([
    { title: '标签名', dataIndex: 'name', align: 'center' },
    { title: '创建时间', dataIndex: 'createdAt', align: 'center' },
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
              disabled={role === 1 ? false : record.isBuiltin ? true : false}
              style={{ marginRight: '0.75rem' }}
            />
          </Tooltip>

          <Tooltip placement="bottom" title="删除">
            <Button
              shape="circle"
              onClick={() => deleteTags([record.id])}
              danger
              disabled={role === 1 ? false : record.isBuiltin ? true : false}
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        </>
      )
    }
  ]);
  // 标签分页参数
  const [pagination, setPagination] = useState({
    pageNum: 1, // 当前页
    pageSize: 10, // 每页条数
    total: 0 // 总条数（后端返回）
  });
  // 标签批量处理key
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  // 新增/修改标签对话框状态
  const [open, setOpen] = useState<boolean>(false);
  // 当前操作数据
  const [rowData, setRowData] = useState<DataType | null>(null);
  // 标签新增/修改表单对象
  const [formItems] = useState<DynamicFormItem[]>([
    {
      label: '标签名',
      name: 'name',
      type: 'input' as const,
      required: true
    }
  ]);
  // 标签新增/修改表单ref
  const formRef = useRef<DynamicFormRef<FormValues>>(null);

  useEffect(() => {
    getTags({ pageNum: 1, pageSize: 10 });
  }, []);

  /**
   * @description: 调取标签列表查询接口
   * @param {*} params 参数报文
   * @return {*}
   */
  const getTags = async (values: FnParams) => {
    const { name, createDate, pageNum = 1, pageSize = 10, isBuiltin } = values;
    const params = {
      name,
      createDate: createDate ? createDate.join() : createDate,
      isBuiltin,
      pageNum,
      pageSize
    };
    setLoading(true);
    const res = await api.tagApi.getTags(params);
    const { list, total } = res.data;
    if (total > 0 && !list.length) {
      getTags({ name, createDate, pageNum: 1, pageSize, isBuiltin });
      return;
    }
    setPagination({ pageNum, pageSize, total });
    setTableDatas(list);
    setLoading(false);
  };

  /**
   * @description: 标签列表查询
   * @param {SearchFormValues} values
   * @return {*}
   */
  const handleSearch = (values: SearchFormValues) => {
    setPagination({ ...pagination, pageNum: 1 });
    getTags({ ...values, pageNum: 1, pageSize: pagination.pageSize });
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
    onChange: onSelectChange,
    getCheckboxProps: (record) => ({
      disabled: role === 1 ? false : record.isBuiltin ? true : false
    })
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
      getTags({ ...values, pageNum, pageSize });
    });
  };

  /**
   * @description: 删除标签
   * @param {number} ids 标签 id 数组
   * @return {*}
   */
  const deleteTags = (ids: number[] | null) => {
    Modal.confirm({
      title: '系统提示',
      content: '您确定要删除该标签吗?',
      okText: '确认',
      cancelText: '取消',
      async onOk() {
        const params = { ids: ids ? ids : (selectedRowKeys as number[]) };
        const res = await api.tagApi.deleteTag(params);
        message.success(res.message);
        // 清空已选择的用户
        setSelectedRowKeys([]);
        // 重新获取标签列表
        getTags({ pageNum: 1, pageSize: pagination.pageSize });
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
   * @description: 创建/修改标签
   * @return {*}
   */
  const createOrUpdateTag = async () => {
    if (rowData) {
      // 修改标签
      const name = formRef.current?.getField('name') || '';
      if (name.trim() === rowData.name) return message.warning('无修改项！！！');
      const res = await api.tagApi.updateTag({ id: rowData.id, name: name.trim() });
      setOpen(false);
      message.success(res.message);
    } else {
      // 新增标签
      const name = formRef.current?.getField('name') || '';
      const res = await api.tagApi.createTag({ name: name.trim() });
      setOpen(false);
      message.success(res.message);
    }

    // 重新查询标签列表
    getTags({ pageNum: 1, pageSize: pagination.pageSize });
  };

  return (
    <div className="tag-manage-container">
      {/* 查询表单 */}
      <AdvancedForm<SearchFormValues>
        formItems={searchOptions}
        handleSubmit={handleSearch}
        showFooter
        ref={searchFormRef}
      />

      <div className="tag-management-main">
        <div className="tag-function-buttons">
          <Button
            icon={<PlusOutlined />}
            color="primary"
            variant="solid"
            style={{ marginRight: '0.75rem' }}
            onClick={() => openEditModal(null)}
          >
            新增标签
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={selectedRowKeys.length ? false : true}
            onClick={() => deleteTags(null)}
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
        title={rowData ? '修改标签' : '新增标签'}
        width={400}
        classNames={{
          content: 'tags-modal',
          header: 'tags-modal-header',
          body: 'tags-modal-body'
        }}
        closable={{ 'aria-label': '新增/修改标签对话框按钮' }}
        maskClosable={false}
        open={open}
        onCancel={closeModal}
        afterOpenChange={() => {
          // 修改时，设置表单默认值
          if (open && rowData && formRef.current) {
            formRef.current?.setField('name', rowData.name);
          }
        }}
        onOk={createOrUpdateTag}
        destroyOnHidden
      >
        {/* 标签新增/修改表单 */}
        <BaseForm
          layout={'horizontal'}
          formItems={formItems}
          labelCol={5}
          wrapperCol={19}
          showFooter={false}
          ref={formRef}
        />
      </Modal>
    </div>
  );
};

export default Tags;
