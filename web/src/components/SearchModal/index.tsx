/*
 * @Author: yolo
 * @Date: 2025-09-12 10:09:39
 * @LastEditors: yolo
 * @LastEditTime: 2025-12-17 16:12:29
 * @FilePath: /web/src/components/SearchModal/index.tsx
 * @Description: 文章搜索弹窗
 */

import { memo, useState, useMemo, useRef } from 'react';
import { Modal, Input, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Utils } from '@/utils';
import api from '@/api';
import type { ArticleSearchResult } from '@/types/app/common';
import PreviewArticle from '@/components/PreviewArticle';

interface ModalProps {
  open: boolean;
  handleCancel: () => void;
}

const SearchModal = ({ open, handleCancel }: ModalProps) => {
  console.log('文章检索页面');
  // 标识当前是否处于输入法组合输入阶段（如中文拼音输入），从而避免在用户还没选字完成时触发搜索或业务逻辑。
  const isComposingRef = useRef(false);
  const [nextCursor, setNextCursor] = useState<ArticleSearchResult['nextCursor']>(null); // 文章滚动加载下一次请求的游标
  const [hasMore, setHasMore] = useState<ArticleSearchResult['hasMore']>(false); // 文章滚动加载是否还有更多数据
  const [articleList, setArticleList] = useState<ArticleSearchResult['list']>([]); // 文章预览列表
  const [keyword, setKeyword] = useState<string>(''); // 文章关键字查询内容

  /**
   * @description: 输入框内容变化回调
   * @param {React} e 事件对象
   * @return {*}
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);

    // 中文输入中，不触发搜索
    if (isComposingRef.current) return;
    if (value.trim()) debouncedSearch(value.trim());
  };

  /**
   * @description: 关键字查询防抖
   * @return {*}
   */
  const debouncedSearch = useMemo(
    () =>
      Utils.debounce(
        (value) => {
          api.articleApi.getArticleList({ keyword: value as string }).then((res) => {
            if (res.data) {
              const { list, nextCursor, hasMore } = res.data;
              setArticleList(list);
              setHasMore(hasMore);
              setNextCursor(nextCursor);
            }
          });
        },
        800,
        false
      ),
    []
  );

  /**
   * @description: 中文输入中事件回调
   * @return {*}
   */
  const onCompositionStart = () => {
    isComposingRef.current = true;
  };

  /**
   * @description: 中文输入结束事件回调
   * @param {React} e 事件对象
   * @return {*}
   */
  const onCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;

    const value = e.currentTarget.value;
    setKeyword(value);

    // 输入法结束时，立即触发一次搜索
    if (value.trim()) debouncedSearch(value.trim());
  };

  return (
    <>
      <Modal
        title="搜索文章"
        width="60%"
        classNames={{
          content: 'search-modal',
          header: 'search-modal-header',
          body: 'search-modal-body'
        }}
        closable={{ 'aria-label': '关闭搜索文章对话框按钮' }}
        open={open}
        footer={null}
        onCancel={handleCancel}
        maskClosable={false}
        destroyOnHidden
      >
        <Input
          size="large"
          placeholder="请输入文章关键词搜索..."
          value={keyword}
          prefix={<SearchOutlined />}
          onChange={handleChange}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          allowClear
        />

        <div className="article-preview-list">
          {articleList.length ? (
            articleList.map((article) => <PreviewArticle article={article} key={article.id} />)
          ) : (
            <Empty description="未查询到结果" />
          )}
        </div>
      </Modal>
    </>
  );
};

export default memo(SearchModal);
