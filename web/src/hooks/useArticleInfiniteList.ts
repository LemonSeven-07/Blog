import { useCallback, useEffect, useRef, useState } from 'react';
import type { ArticleSearchResult } from '@/types/app/common';

/**
 * 无限列表接口的统一返回结构
 */
interface InfiniteResult<T> {
  list: T[]; // 本次返回的数据列表
  hasMore: ArticleSearchResult['hasMore']; // 是否还有更多
  nextCursor?: ArticleSearchResult['nextCursor']; // 下一次查询的游标
}

/**
 * useInfiniteArticleList
 * ----------------------
 * 无限滚动文章列表 Hook
 *
 * 设计目标：
 * 1. 初次加载时，若文章列表不足一屏，自动继续加载数据，直到填满或无更多数据
 * 2. 使用 IntersectionObserver 监听哨兵元素（列表底部），当进入视口时自动加载下一段数据
 * 3. 整个生命周期只创建一个 Observer（避免内存泄漏、性能浪费）
 * 4. 初始化时不会重复请求数据，且支持查询条件变更时自动重新加载
 * 5. 支持多种查询场景：关键字查询、按分类 + 标签查询、按收藏 + 标签查询
 * 6. 高性能，最小化 state 使用，避免无意义渲染
 *
 * @param {Object} options
 * @param {string} options.queryKey - 唯一标识查询条件，变化时会重置数据
 * @param {Function} options.fetcher - 用于获取数据的请求函数（带游标和分页信息）
 * @param {number} options.pageSize - 每次查询返回的数据量（默认为 10）
 *
 * @returns {Object} 返回包含 list, loading, hasMore, sentinelRef 等数据
 */
export function useArticleInfiniteList<
  Q extends { lastId?: number; lastSortValue?: number },
  T
>(params: {
  queryKey: string; // 查询语义唯一标识（变化即重置）
  query: Q; // 查询条件（不包含游标）
  fetcher: (params: Q) => Promise<InfiniteResult<T>>;
  root?: Element | null;
  rootMargin?: string;
}) {
  const { queryKey, query, fetcher, root = null, rootMargin = '200px' } = params;

  /** 已加载的数据列表 */
  const [list, setList] = useState<T[]>([]);

  /** 是否正在加载 */
  const [loading, setLoading] = useState<boolean>(false);

  /** 是否还有更多数据 */
  const [hasMore, setHasMore] = useState<boolean>(true);

  /** 游标，仅 Hook 内部维护 */
  const cursorRef = useRef<ArticleSearchResult['nextCursor']>(null);

  /** 防止并发和乱序响应的版本号 */
  const requestVersionRef = useRef<number>(0);

  /** 哨兵 DOM 引用 */
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  /** IntersectionObserver 实例 */
  const observerRef = useRef<IntersectionObserver | null>(null);

  /**
   * 加载下一页数据（核心）
   */
  const loadMore = useCallback(async () => {
    // 如果正在加载或已经没有更多数据，直接返回
    if (loading || !hasMore) return;

    // 标记为加载中
    setLoading(true);

    // 生成当前请求的版本号
    const currentVersion = ++requestVersionRef.current;

    try {
      // 调用 fetcher，请求数据
      const result = await fetcher({
        ...query, // 业务查询条件
        ...cursorRef.current // 首次为 undefined
      });

      // 如果请求版本不是最新的，丢弃结果
      if (currentVersion !== requestVersionRef.current) return;

      // 追加数据到列表
      setList((prev) => [...prev, ...result.list]);

      // 更新是否还有更多
      setHasMore(result.hasMore);

      // 更新游标
      cursorRef.current = result.nextCursor ?? null;
    } finally {
      // 无论成功失败，都结束 loading
      setLoading(false);
    }
  }, [fetcher, query, loading, hasMore]);

  /**
   * 当 queryKey 变化时，重置整个列表状态
   */
  useEffect(() => {
    // 清空数据
    setList([]);

    // 重置游标
    cursorRef.current = null;

    // 重置是否还有更多
    setHasMore(true);

    // 重置请求版本
    requestVersionRef.current = 0;
  }, [queryKey]);

  /**
   * 初始化 + 监听哨兵
   */
  useEffect(() => {
    // 如果哨兵不存在，直接返回
    if (!sentinelRef.current) return;

    // 如果 observer 已存在，不重复创建
    if (observerRef.current) return;

    // 创建 IntersectionObserver
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        // 当哨兵进入视图
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { root, rootMargin }
    );

    // 开始监听哨兵
    observerRef.current.observe(sentinelRef.current);

    // 卸载时清理 observer
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [root, rootMargin, loadMore]);

  /**
   * 首屏补齐逻辑：
   * 如果数据不足一屏，哨兵会立即进入视图，从而自动触发 loadMore
   * 不需要额外逻辑
   */

  return {
    list, // 已加载的数据
    loading, // 是否加载中
    hasMore, // 是否还有更多
    sentinelRef // 哨兵 ref，给组件使用
  };
}
