/*
 * @Author: yolo
 * @Date: 2025-09-12 10:09:39
 * @LastEditors: yolo
 * @LastEditTime: 2025-10-10 00:25:35
 * @FilePath: /Blog/web/src/components/SearchModal/index.tsx
 * @Description: 文章搜索弹窗
 */

import { memo } from 'react';
import { Modal, Input, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface ModalProps {
  open: boolean;
  handleCancel: () => void;
}

const SearchModal = ({ open, handleCancel }: ModalProps) => {
  console.log('文章检索页面');

  return (
    <>
      <Modal
        title="搜索文章"
        classNames={{
          content: 'search-modal',
          header: 'search-modal-header',
          body: 'search-modal-body'
        }}
        closable={{ 'aria-label': '关闭搜索文章对话框按钮' }}
        open={open}
        footer={null}
        onCancel={handleCancel}
        destroyOnHidden
      >
        <Input
          size="large"
          placeholder="请输入文章关键词搜索..."
          prefix={<SearchOutlined />}
          allowClear
        />
        <Empty description="未查询到结果" />
      </Modal>
    </>
  );
};

export default memo(SearchModal);
