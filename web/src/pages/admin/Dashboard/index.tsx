/*
 * @Author: yolo
 * @Date: 2025-09-12 10:01:46
 * @LastEditors: yolo
 * @LastEditTime: 2026-02-28 18:42:56
 * @FilePath: /web/src/pages/admin/Dashboard/index.tsx
 * @Description:首页
 */

import { memo, useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts'; // 引入 EChartsOption 类型
import categorySvg from '@/assets/svg/category.svg';
import tagSvg from '@/assets/svg/tag.svg';
import viewsSvg from '@/assets/svg/views.svg';
import favoriteSvg from '@/assets/svg/favorite.svg';
import articleSvg from '@/assets/svg/article.svg';
import articleStatisticsSvg from '@/assets/svg/article-statistics.svg';
import tagStatisticsSvg from '@/assets/svg/tag-statistics.svg';
import api from '@/api';

interface ChartData {
  id: number;
  name: string;
  articleCount: number;
}

const Dashboard = () => {
  // 当前用户文章发布数量
  const [totalArticles, setTotalArticles] = useState(0);
  // 文章分类可用总量
  const [totalCategories, setTotalCategories] = useState(0);
  // 文章标签可用总量
  const [totalTags, setTotalTags] = useState(0);
  // 当前用户文章发布收藏总量
  const [totalFavorites, setTotalFavorites] = useState(0);
  // 当前用户文章发布浏览总量
  const [totalViews, setTotalViews] = useState(0);
  // 文章分类统计数据
  const [articleCategoryStats, setArticleCategoryStats] = useState<ChartData[]>([]);
  // 文章标签统计数据
  const [articleTagStats, setArticleTagStats] = useState<ChartData[]>([]);

  useEffect(() => {
    // 获取仪表盘统计数据
    api.dashboardApi.getDashboardStats().then((res) => {
      if (res.code === '200') {
        const {
          articleGroupInfo = [],
          tagGroupInfo = [],
          tagCount = 0,
          categoryCount = 0
        } = res.data || {};

        setTotalTags(tagCount);
        setTotalCategories(categoryCount);
        setTotalArticles(articleGroupInfo.reduce((sum, item) => sum + (item.articleCount || 0), 0));
        setTotalFavorites(
          articleGroupInfo.reduce((sum, item) => sum + (item.totalFavorites || 0), 0)
        );
        setTotalViews(articleGroupInfo.reduce((sum, item) => sum + (item.totalViews || 0), 0));
        setArticleCategoryStats(
          articleGroupInfo.map((item) => ({
            id: item.category.id,
            name: item.category?.name || '未知分类',
            articleCount: item.articleCount || 0
          }))
        );
        setArticleTagStats(tagGroupInfo);
      }
    });
  }, []);

  // 动态生成 ECharts 配置
  const getCategoryStatsOption = (data: ChartData[]): EChartsOption => {
    return {
      tooltip: {
        trigger: 'item'
      },
      grid: {
        left: '3%',
        right: '3%',
        top: '3%',
        bottom: '3%',
        containLabel: true
      },
      legend: {
        orient: 'horizontal',
        left: 'center'
      },
      series: [
        {
          name: '文章数',
          type: 'pie',
          radius: ['0%', '60%'],
          data: data.map((item) => ({ value: item.articleCount, name: item.name })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  };

  // 动态生成 ECharts 配置
  const getTagStatsOption = (data: ChartData[]): EChartsOption => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '3%',
        top: '3%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: data.map((item) => item.name),
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: '文章数',
          type: 'bar',
          data: data.map((item) => item.articleCount)
        }
      ]
    };
  };

  return (
    <div className="dashboard-container">
      <div className="blog-statistics">
        <div className="statistics-item">
          <img src={articleSvg} title="文章" />
          <div>
            <div>文章</div>
            <div>{totalArticles}</div>
          </div>
        </div>

        <div className="statistics-item">
          <img src={categorySvg} title="分类" />
          <div>
            <div>分类</div>
            <div>{totalCategories}</div>
          </div>
        </div>

        <div className="statistics-item">
          <img src={tagSvg} title="标签" />
          <div>
            <div>标签</div>
            <div>{totalTags}</div>
          </div>
        </div>

        <div className="statistics-item">
          <img src={favoriteSvg} title="收藏" />
          <div>
            <div>收藏</div>
            <div>{totalFavorites}</div>
          </div>
        </div>

        <div className="statistics-item">
          <img src={viewsSvg} title="浏览" />
          <div>
            <div>浏览</div>
            <div>{totalViews}</div>
          </div>
        </div>
      </div>

      <div className="blog-chart">
        <div className="category-chart">
          <div className="chart-name">
            <img src={articleStatisticsSvg} title="文章分类统计" />
            <span>文章分类统计</span>
          </div>

          <ReactECharts
            option={getCategoryStatsOption(articleCategoryStats)}
            style={{ width: '100%' }}
          />
        </div>

        <div className="tag-chart">
          <div className="chart-name">
            <img src={tagStatisticsSvg} title="文章标签统计" />
            <span>文章标签统计</span>
          </div>

          <ReactECharts option={getTagStatsOption(articleTagStats)} style={{ width: '100%' }} />
        </div>
      </div>
    </div>
  );
};

export default memo(Dashboard);
