import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';

type ArticleCategoryNavProps = {
  direction?: 'horizontal' | 'vertical';
};

const CategoryNav: React.FC<ArticleCategoryNavProps> = ({ direction = 'vertical' }) => {
  const location = useLocation();
  console.log('分类导航栏渲染');
  return (
    <>
      <div
        className={direction === 'vertical' ? 'vertical-category-nav' : 'horizontal-category-nav'}
      >
        <Link to="/frontend" className={location.pathname === '/frontend' ? 'active-category' : ''}>
          {direction === 'vertical' && <i className="iconfont icon-frontend" />}
          <span>前端</span>
        </Link>
        <Link to="backend" className={location.pathname === '/backend' ? 'active-category' : ''}>
          {direction === 'vertical' && <i className="iconfont icon-backend" />}
          <span>后端</span>
        </Link>
        <Link
          to="cloud-ops"
          className={location.pathname === '/cloud-ops' ? 'active-category' : ''}
        >
          {direction === 'vertical' && <i className="iconfont icon-cloud-ops" />}
          <span>云计算与运维</span>
        </Link>
        <Link to="ai" className={location.pathname === '/ai' ? 'active-category' : ''}>
          {direction === 'vertical' && <i className="iconfont icon-ai" />}
          <span>人工智能</span>
        </Link>
        <Link
          to="cybersecurity"
          className={location.pathname === '/cybersecurity' ? 'active-category' : ''}
        >
          {direction === 'vertical' && <i className="iconfont icon-cybersecurity" />}
          <span>网络安全</span>
        </Link>
        <Link to="android" className={location.pathname === '/android' ? 'active-category' : ''}>
          {direction === 'vertical' && <i className="iconfont icon-android" />}
          <span>Android</span>
        </Link>
        <Link to="ios" className={location.pathname === '/ios' ? 'active-category' : ''}>
          {direction === 'vertical' && <i className="iconfont icon-ios" />}
          <span>iOS</span>
        </Link>
        <Link to="other" className={location.pathname === '/other' ? 'active-category' : ''}>
          {direction === 'vertical' && <i className="iconfont icon-other"></i>}
          <span>其他</span>
        </Link>
      </div>
    </>
  );
};

export default memo(CategoryNav);
