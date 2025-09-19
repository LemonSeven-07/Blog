/*
 * @Author: yolo
 * @Date: 2025-09-12 10:00:57
 * @LastEditors: yolo
 * @LastEditTime: 2025-09-12 17:01:26
 * @FilePath: /Blog/web/src/components/ErrorPage/index.tsx
 * @Description: 路由错误页面
 */

import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="500"
      title="页面出错啦！"
      subTitle="抱歉，页面出现错误，请尝试刷新或返回首页。"
      extra={[
        <Button key="refresh" onClick={() => window.location.reload()}>
          刷新页面
        </Button>,
        <Button key="home" type="primary" onClick={() => navigate('/')}>
          返回首页
        </Button>
      ]}
    />
  );
};

export default ErrorPage;
