/*
 * @Author: yolo
 * @Date: 2025-09-13 19:10:35
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-15 10:01:16
 * @FilePath: /Blog/web/src/layout/client/Header/Middle.tsx
 * @Description: Header 子组件（检索栏）
 */

import React, { useState, memo } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const Middle = () => {
  console.log('header 中子组件渲染');
  const [keyword, setKeyword] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const handleSubmit = () => {
    console.log('检索文章');
  };

  const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  return (
    <div className="header-middle">
      <SearchOutlined className="search-icon" />
      <Input
        className="search-input"
        type="text"
        name="search"
        value={keyword}
        onChange={handleChange}
        onBlur={handleSubmit}
        onPressEnter={handlePressEnter}
        placeholder="搜索文章"
      />
    </div>
  );
};

export default memo(Middle);
