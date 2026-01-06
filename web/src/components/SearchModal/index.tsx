/*
 * @Author: yolo
 * @Date: 2025-09-12 10:09:39
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-05 06:25:31
 * @FilePath: /web/src/components/SearchModal/index.tsx
 * @Description: 文章搜索弹窗
 */

import { memo, useState, useMemo, useRef } from 'react';
import { Modal, Input, Empty, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Utils } from '@/utils';
import api from '@/api';
import type { ArticleSearchParams, ArticleSearchResult } from '@/types/app/common';
import PreviewArticle from '@/components/PreviewArticle';
import { useArticleInfiniteList } from '@/hooks/useArticleInfiniteList';
import { useLocalLoading } from '@/hooks/useLocalLoading';

interface ModalProps {
  open: boolean;
  handleCancel: () => void;
}

const SearchModal = ({ open, handleCancel }: ModalProps) => {
  console.log('文章检索页面');
  // 局部loading
  const [loading, withLoading] = useLocalLoading();

  // 标识当前是否处于输入法组合输入阶段（如中文拼音输入），从而避免在用户还没选字完成时触发搜索或业务逻辑。
  const isComposingRef = useRef(false);

  const [printTxt, setPrintTxt] = useState<string>(''); // 查询输入框输入文本内容
  const [keyword, setKeyword] = useState<string>(''); // 文章关键字查询内容

  const [queryKeySuffix, setQueryKeySuffix] = useState<number>(0);
  // queryKey：唯一标识查询
  const queryKey = `article:keyword:${keyword}|refresh:${queryKeySuffix}`;

  /**
   * @description: 查询文章
   * @param {*} params 请求报文
   * @return {*}
   */
  const getArticles = async (params: ArticleSearchParams) => {
    if (keyword) {
      const res = await withLoading(api.articleApi.getArticleList(params));
      const { list, nextCursor, hasMore } = res.data;
      return {
        list,
        nextCursor,
        hasMore
      };
    } else {
      return {
        list: [],
        nextCursor: null,
        hasMore: true
      };
    }
  };

  // 使用 useInfiniteList 获取文章
  const { list, sentinelRef } = useArticleInfiniteList<
    ArticleSearchParams,
    ArticleSearchResult['list'][number]
  >({
    queryKey,
    query: keyword ? { keyword, limit: 10 } : { limit: 10 }, // 查询条件
    fetcher: getArticles // 使用关键字查询文章的 fetcher
  });

  /**
   * @description: 输入框内容变化回调
   * @param {React} e 事件对象
   * @return {*}
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrintTxt(value);

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
      Utils.debounce((value) => {
        setKeyword(value as string);
        setQueryKeySuffix((prev) => prev + 1); // 触发 queryKey 变化 -> Hook 自动重置列表重新按照新的输入关键字进行查询
      }, 800),
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
    setPrintTxt(value);

    // 输入法结束时，立即触发一次搜索
    if (value.trim()) debouncedSearch(value.trim());
  };

  return (
    <>
      <Modal
        title="搜索文章"
        width="70%"
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
          value={printTxt}
          prefix={<SearchOutlined />}
          onChange={handleChange}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          allowClear
        />

        <Spin spinning={loading} wrapperClassName="search-articles-container">
          <div className="article-preview-list" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {list.length ? (
              list.map((article) => <PreviewArticle article={article} key={article.id} />)
            ) : (
              <Empty description="未查询到结果" />
            )}

            <div ref={sentinelRef} style={{ height: 1 }} />
          </div>
        </Spin>
      </Modal>
    </>
  );
};

export default memo(SearchModal);
