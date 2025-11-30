/*
 * @Author: yolo
 * @Date: 2025-09-12 10:02:24
 * @LastEditors: yolo
 * @LastEditTime: 2025-11-17 23:00:23
 * @FilePath: /web/src/pages/admin/Articles/index.tsx
 * @Description: 文章管理页面
 */

import { useEffect, useState } from 'react';
import { Button, Table, Tooltip, Modal, Upload, Form, Select, Input, Image } from 'antd';
import type { TableColumnsType, TableProps, UploadProps, UploadFile, GetProp } from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  SendOutlined,
  EyeOutlined,
  EditOutlined,
  UploadOutlined,
  InboxOutlined,
  PlusOutlined
} from '@ant-design/icons';
import SearchForm from '@/components/SearchForm';
import api from '@/api';
import { useAppSelector } from '@/store/hooks';
import type { tagItem } from '@/types/app/common';

const { TextArea } = Input;

type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

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

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const Articles = () => {
  const { categoryRoutes } = useAppSelector((state) => state.navigation);
  const [searchOptions, setSearchOptions] = useState([
    {
      label: '关键词',
      name: 'keyword',
      type: 'input',
      labelCol: 6,
      wrapperCol: 18
    },
    {
      label: '分类',
      name: 'category',
      type: 'select',
      width: 230,
      labelCol: 7,
      wrapperCol: 17,
      options: categoryRoutes.map((item) => ({
        label: item.meta?.title || '未命名',
        value: item.id
      }))
    },
    {
      label: '标签',
      name: 'tag',
      type: 'select',
      disabled: true,
      labelCol: 6,
      wrapperCol: 18,
      options: []
    },
    {
      label: '起止时间',
      name: 'dateRange',
      type: 'rangePicker',
      labelCol: 6,
      wrapperCol: 18
    },
    {
      label: '作者',
      name: 'author',
      type: 'input',
      width: 250,
      labelCol: 6,
      wrapperCol: 18
    }
  ]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [tableDatas, setTableDatas] = useState<DataType[]>([]);
  const [allTags, setAllTags] = useState<tagItem[]>([]);
  const [tags, setTags] = useState<tagItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imgList, setImgList] = useState<UploadFile[]>([]);
  const [columns] = useState<TableColumnsType<DataType>>([
    { title: '作者', dataIndex: 'author', align: 'center' },
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
  const [form] = Form.useForm();

  useEffect(() => {
    getTags();
  }, []);

  const getTags = async (params: { articleId?: number; categoryId?: number } = {}) => {
    const res = await api.tagApi.getTags(params);
    if (JSON.stringify(params) === '{}') {
      // 获取全部标签
      setAllTags(res.data || []);
    } else {
      // 根据分类获取对应的标签
      setTags(res.data || []);
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const viewArticle = (id: number) => {
    console.log('查看文章', id);
  };

  const exportArticle = (id: number) => {
    console.log('导出文章', id);
  };

  const editArticle = (id: number) => {
    console.log('编辑文章', id);
  };

  const deleteArticle = (id: number) => {
    console.log('删除文章', id);
  };

  const startUpload = () => {
    console.log('开始导入文章');
    form.validateFields().then((values) => {
      console.log('表单值：', values);
      setIsModalOpen(false);
    });
  };

  /**
   * @description: // 处理上传文章封面前的逻辑
   * @param {FileType} file 文章封面文件
   * @return {*}
   */
  const beforeUploadImg = (img: FileType & { url?: string }) => {
    // 为文件生成一个预览 URL，供预览使用
    img.url = URL.createObjectURL(img);

    // 限制只上传一个文件，清除文件列表，覆盖旧文件
    setImgList([img]);

    // 阻止默认上传行为，手动上传
    return false;
  };
  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );
  const handlePreview = async (img: UploadFile) => {
    console.log('预览图片文件', img);
    if (!img.url && !img.preview) {
      img.preview = await getBase64(img.originFileObj as FileType);
    }

    setPreviewImage(img.url || (img.preview as string));
    setPreviewOpen(true);
  };

  return (
    <div className="article-manage-container">
      <SearchForm searchOptions={searchOptions} />

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
        onOk={startUpload}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form
          form={form}
          style={{
            width: '100%',
            margin: '0 auto',
            padding: '1rem',
            background: '#fff',
            borderRadius: '0.5rem'
          }}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          colon={false}
        >
          <Form.Item
            label="文章上传"
            name="file"
            valuePropName="fileList"
            getValueFromEvent={({ fileList }) => fileList}
            rules={[{ required: false, message: '请选择一个文件!' }]}
          >
            <Upload.Dragger
              multiple
              accept=".md"
              fileList={fileList}
              beforeUpload={() => false} // 阻止自动上传
              onChange={({ fileList }) => setFileList(fileList)}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖动文件至此区域上传</p>
              <p className="ant-upload-hint">
                支持单个或批量上传，但仅支持Markdown文件（.md）。严禁上传违禁文件。
              </p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item
            label="文章标题"
            name="title"
            rules={[
              {
                required: false,
                message: '请输入文章标题!'
              },
              {
                min: 4,
                max: 25,
                message: '文章标题长度应在4-25个字符之间!'
              }
            ]}
          >
            <Input allowClear placeholder="请输入文章标题" />
          </Form.Item>

          <Form.Item
            label="文章摘要"
            name="summary"
            rules={[
              {
                required: false,
                message: '请选输入文章摘要!'
              },
              {
                min: 16,
                message: '文章摘要最少16个字符!'
              }
            ]}
          >
            <TextArea
              className="text-area-with-count"
              placeholder="请输入文章摘要"
              autoSize={{ minRows: 2 }}
              showCount
              maxLength={150}
            />
          </Form.Item>

          <Form.Item
            label="文章分类"
            name="category"
            rules={[
              {
                required: false,
                message: '请选择文章分类!'
              }
            ]}
          >
            <Select allowClear options={[]} placeholder="请选择文章分类" />
          </Form.Item>

          <Form.Item
            label="文章标签"
            name="category"
            rules={[
              {
                required: false,
                message: '请选择文章标签!'
              }
            ]}
          >
            <Select allowClear options={[]} placeholder="请选择文章标签" />
          </Form.Item>

          <Form.Item label="文章封面" name="coverImage">
            <Upload
              accept="image/png,image/jpeg,image/jpg"
              listType="picture-card"
              fileList={imgList}
              showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
              onPreview={handlePreview}
              beforeUpload={beforeUploadImg}
            >
              {uploadButton}
            </Upload>
          </Form.Item>
        </Form>

        {previewImage && (
          <Image
            wrapperStyle={{ display: 'none' }}
            preview={{
              visible: previewOpen,
              onVisibleChange: (visible) => setPreviewOpen(visible),
              afterOpenChange: (visible) => !visible && setPreviewImage('')
            }}
            src={previewImage}
          />
        )}
      </Modal>
    </div>
  );
};

export default Articles;
