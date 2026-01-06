/*
 * @Author: yolo
 * @Date: 2025-12-25 01:42:46
 * @LastEditors: yolo
 * @LastEditTime: 2026-01-05 05:53:28
 * @FilePath: /web/src/pages/client/Favorites/index.tsx
 * @Description: 我的收藏页
 */

import { useState, useEffect } from 'react';
import { Spin, Checkbox, Button, Select, Empty, Modal, message } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useLocalLoading } from '@/hooks/useLocalLoading';
import { useArticleInfiniteList } from '@/hooks/useArticleInfiniteList';
import PreviewArticle from '@/components/PreviewArticle';
import type { ArticleSearchParams, ArticleSearchResult } from '@/types/app/common';
import api from '@/api';

const Favorites = () => {
  // 局部loading
  const [loading, withLoading] = useLocalLoading();

  // 收藏文章对应的文章分类
  const [categoryId, setCategoryId] = useState(0);
  // 存储勾选的文章ID
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [queryKeySuffix, setQueryKeySuffix] = useState<number>(0);

  // queryKey：唯一标识查询
  const queryKey = `favorites:category:${categoryId}|refresh:${queryKeySuffix}`;

  /**
   * @description: 查询文章
   * @param {*} params 请求报文
   * @return {*}
   */
  const getArticles = async (params: ArticleSearchParams) => {
    const res = await api.favoriteApi.getFavoriteArticles(params);
    const { list, nextCursor, hasMore } = res.data;
    return {
      list,
      nextCursor,
      hasMore
    };
  };

  // 使用 useInfiniteList 获取收藏文章
  const { list, sentinelRef } = useArticleInfiniteList<
    ArticleSearchParams,
    { article: ArticleSearchResult['list'][number] }
  >({
    queryKey,
    query: categoryId ? { categoryId, limit: 20 } : { limit: 20 }, // 查询条件：categoryId
    fetcher: getArticles // 使用获取收藏文章的 fetcher
  });

  // 文章下拉选择配置
  const [options, setOptions] = useState<{ value: number; label: string }[]>([
    {
      label: '全部',
      value: 0
    }
  ]);

  // 初次滚动加载文章默认查所有分类下的文章
  useEffect(() => {
    api.favoriteApi.getCategoriesByFavorite().then((res) => {
      const list = res.data || [];
      setOptions([...options, ...list.map((item) => ({ label: item.name, value: item.id }))]);
    });
  }, []);

  /**
   * @description: 最新文章分类id
   * @param {number} id 分类id
   * @return {*}
   */
  const handleCategoryChange = (id: number) => {
    setCategoryId(id);
  };

  /**
   * @description: 处理单个文章复选框变化
   * @param {number} id 文章id
   * @return {*}
   */
  const handleCheckboxChange = (id: number) => {
    setSelectedIds((prevSelected) => {
      if (prevSelected.includes(id)) {
        // 如果已勾选，取消勾选
        return prevSelected.filter((item) => item !== id);
      } else {
        // 否则勾选
        return [...prevSelected, id];
      }
    });
  };

  /**
   * @description: 批量取消收藏
   * @return {*}
   */
  const batchCancel = () => {
    Modal.confirm({
      title: '系统提示',
      content: '确认取消收藏选中文章吗?',
      okText: '确认',
      cancelText: '取消',
      async onOk() {
        const res = await withLoading(
          api.articleApi.toggleArticleFavorite({
            articleIds: selectedIds,
            action: 'remove'
          })
        );
        message.success(res.message);
        setQueryKeySuffix((prev) => prev + 1); // 触发 queryKey 变化 -> Hook 自动重置列表
      },
      onCancel() {}
    });
  };

  return (
    <Spin spinning={loading} wrapperClassName="favorites-container">
      <div className="favorites-operate">
        <Select
          showSearch
          defaultValue={0}
          value={categoryId}
          optionFilterProp="label"
          onChange={handleCategoryChange}
          options={options}
        />
        <div>我的收藏</div>
        <Button
          danger
          icon={<CloseCircleOutlined />}
          disabled={selectedIds.length ? false : true}
          onClick={batchCancel}
        >
          批量取消
        </Button>
      </div>

      {list.length ? (
        <div className="favorites-main">
          {list.map((favorite) => (
            <div className="article-preview-list" key={favorite.article.id}>
              <Checkbox
                checked={selectedIds.includes(favorite.article.id)}
                onChange={() => handleCheckboxChange(favorite.article.id)}
              />
              <PreviewArticle article={favorite.article} />
            </div>
          ))}
        </div>
      ) : (
        <Empty
          description="暂无收藏内容"
          className="no-article-empty"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      <div ref={sentinelRef} style={{ height: 1 }} />
    </Spin>
  );
};

export default Favorites;
