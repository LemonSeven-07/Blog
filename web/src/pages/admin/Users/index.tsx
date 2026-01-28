/*
 * @Author: yolo
 * @Date: 2025-09-12 10:04:30
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-27 04:52:54
 * @FilePath: /web/src/pages/admin/Users/index.tsx
 * @Description: 用户管理页面
 */

import { useState, useRef, useEffect } from 'react';
import { Table, Tooltip, Button, Switch, Radio, message, Modal } from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableColumnsType, TableProps, TablePaginationConfig, RadioChangeEvent } from 'antd';
import AdvancedForm from '@/components/DynamicForm/AdvancedForm';
import type { DynamicFormItem, DynamicFormRef } from '@/components/DynamicForm/types';
import api from '@/api';

type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];

interface DataType {
  id: number;
  username: string;
  avatar: string;
  email: string;
  role: number;
  banned: boolean;
  createdAt: string;
  deletedAt: string | null;
}

interface SearchFormValues {
  username?: string;
  role?: number;
  registerDate?: string[];
  isDeleted?: number;
}

interface FnParams {
  pageNum: number;
  pageSize: number;
  username?: string;
  registerDate?: string[];
  role?: number;
  banned?: boolean;
  isDeleted?: number;
}

const roleOptions = [
  { label: '普通管理员', value: 2 },
  { label: '普通用户', value: 3 }
];

const Users = () => {
  // 用户查询表单对象
  const searchFormRef = useRef<DynamicFormRef<SearchFormValues>>(null);
  // 用户列表数据
  const [tableDatas, setTableDatas] = useState<DataType[]>([]);
  // 表格数据加载状态
  const [loading, setLoading] = useState<boolean>(false);
  // 用户查询表单
  const [searchOptions] = useState<DynamicFormItem[]>([
    {
      label: '用户名',
      name: 'username',
      type: 'input' as const,
      labelCol: 6,
      wrapperCol: 18
    },
    {
      label: '角色',
      name: 'role',
      type: 'select' as const,
      options: [
        { label: '普通管理员', value: 2 },
        { label: '普通用户', value: 3 }
      ],
      labelCol: 6,
      wrapperCol: 18
    },
    {
      label: '注册时间',
      name: 'registerDate',
      type: 'rangePicker' as const,
      labelCol: 7,
      wrapperCol: 17
    },
    {
      label: '是否注销',
      name: 'isDeleted',
      type: 'select' as const,
      options: [
        { label: '否', value: 0 },
        { label: '是', value: 1 }
      ],
      labelCol: 7,
      wrapperCol: 17
    }
  ]);
  // 表格列配置
  const [columns] = useState<TableColumnsType<DataType>>([
    {
      title: '用户头像',
      dataIndex: 'avatar',
      align: 'center',
      render: (value) =>
        value ? (
          <img
            src={value}
            alt=""
            style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '50%' }}
          />
        ) : (
          ''
        )
    },
    {
      title: '用户名',
      dataIndex: 'username',
      align: 'center',
      render: (value, record) => (
        <>
          <span style={record.deletedAt ? { color: 'red' } : {}}>{value}</span>
        </>
      )
    },
    { title: '邮箱', dataIndex: 'email', align: 'center' },
    {
      title: '角色',
      dataIndex: 'role',
      align: 'center',
      render: (value, record) => (
        <Radio.Group
          options={roleOptions}
          onChange={(e) => handleRoleChange(e, record.id)}
          defaultValue={value}
        />
      )
    },
    {
      title: '是否禁言',
      dataIndex: 'banned',
      align: 'center',
      render: (value, record) => (
        <Switch
          checkedChildren="是"
          unCheckedChildren="否"
          defaultChecked={value}
          onChange={(checked) => handleBannedChange(checked, record.id)}
        />
      )
    },
    { title: '注册时间', dataIndex: 'createdAt', align: 'center' },
    { title: '注销时间', dataIndex: 'deletedAt', align: 'center' },
    {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <>
          {record.deletedAt ? (
            <Tooltip placement="bottom" title="恢复用户">
              <Button
                shape="circle"
                onClick={() => restoreUsers([record.id])}
                color="primary"
                variant="outlined"
                icon={<ReloadOutlined />}
              />
            </Tooltip>
          ) : (
            <Tooltip placement="bottom" title="删除用户">
              <Button
                shape="circle"
                onClick={() => deleteUsers([record.id])}
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          )}
        </>
      )
    }
  ]);
  // 用户分页参数
  const [pagination, setPagination] = useState({
    pageNum: 1, // 当前页
    pageSize: 10, // 每页条数
    total: 0 // 总条数（后端返回）
  });
  // 用户批量处理key
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    getUsers({ pageNum: 1, pageSize: 10 });
  }, []);

  /**
   * @description: 调取用户分页查询接口
   * @param {*} params 参数报文
   * @return {*}
   */
  const getUsers = async (values: FnParams) => {
    const { username, role, banned, registerDate, pageNum = 1, pageSize = 10, isDeleted } = values;
    const params = {
      username,
      role,
      banned,
      registerDate: registerDate ? registerDate.join() : registerDate,
      isDeleted,
      pageNum,
      pageSize
    };
    setLoading(true);
    const res = await api.userApi.getUsers(params);
    const { list, total } = res.data;
    if (total > 0 && !list.length) {
      getUsers({ username, role, banned, registerDate, pageNum: 1, pageSize, isDeleted });
      return;
    }
    setPagination({ pageNum, pageSize, total });
    setTableDatas(list);
    setLoading(false);
  };

  /**
   * @description: 用户查询
   * @param {SearchFormValues} values
   * @return {*}
   */
  const handleSearch = (values: SearchFormValues) => {
    getUsers({ ...values, pageNum: 1, pageSize: pagination.pageSize });
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
      getUsers({ ...values, pageNum, pageSize });
    });
  };

  /**
   * @description: 修改用户角色
   * @param {RadioChangeEvent} e 单选框事件对象
   * @param {number} id 用户id
   * @return {*}
   */
  const handleRoleChange = async (e: RadioChangeEvent, id: number) => {
    const res = await api.userApi.updateUser({ userId: id, role: e.target.value });
    message.success(res.message);

    getUsers({ pageNum: pagination.pageNum, pageSize: pagination.pageSize });
  };

  /**
   * @description: 修改用户禁言状态
   * @param {boolean} checked 开关状态
   * @param {number} id 用户id
   * @return {*}
   */
  const handleBannedChange = async (checked: boolean, id: number) => {
    const res = await api.userApi.updateUser({ userId: id, banned: checked });
    message.success(res.message);

    getUsers({ pageNum: pagination.pageNum, pageSize: pagination.pageSize });
  };

  /**
   * @description: 用户删除或恢复操作
   * @param {object} params 参数对象
   * @param {'delete' | 'restore'} type 操作类型 delete 删除用户 restore 恢复用户
   * @return {*}
   */
  const operateUsers = async (params: { ids: number[] }, type: 'delete' | 'restore') => {
    let fn = api.userApi.deleteUser;
    if (type === 'restore') fn = api.userApi.restoreUser;

    const res = await fn(params);
    message.success(res.message);

    // 清空已选择的用户
    setSelectedRowKeys([]);
    // 重新获取用户列表
    getUsers({ pageNum: pagination.pageNum, pageSize: pagination.pageSize });
  };

  /**
   * @description: 删除用户
   * @param {number} ids 用户id数组
   * @return {*}
   */
  const deleteUsers = (ids: number[] | null) => {
    Modal.confirm({
      title: '系统提示',
      content: '您确定要删除该用户吗?',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        const params = {
          ids: ids ? ids : (selectedRowKeys as number[])
        };

        operateUsers(params, 'delete');
      },
      onCancel() {}
    });
  };

  /**
   * @description: 恢复用户
   * @param {number[]} ids 用户id数组
   * @return {*}
   */
  const restoreUsers = (ids: number[] | null) => {
    Modal.confirm({
      title: '系统提示',
      content: '您确定要恢复该用户吗?',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        const params = {
          ids: ids ? ids : (selectedRowKeys as number[])
        };

        operateUsers(params, 'restore');
      },
      onCancel() {}
    });
  };

  return (
    <div className="user-manage-container">
      {/* 查询表单 */}
      <AdvancedForm<SearchFormValues>
        formItems={searchOptions}
        handleSubmit={handleSearch}
        showFooter
        ref={searchFormRef}
      />

      <div className="user-management-main">
        <div className="user-function-buttons">
          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={selectedRowKeys.length ? false : true}
            onClick={() => deleteUsers(null)}
            style={{ marginRight: '0.75rem' }}
          >
            批量删除
          </Button>

          <Button
            color="primary"
            variant="outlined"
            icon={<ReloadOutlined />}
            disabled={selectedRowKeys.length ? false : true}
            onClick={() => restoreUsers(null)}
          >
            批量恢复
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
    </div>
  );
};

export default Users;
