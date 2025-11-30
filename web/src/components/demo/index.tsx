// import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import api from '@/api';
import { useAppSelector } from '@/store/hooks';
import { useLocalLoading } from '@/hooks/useLocalLoading';
import { useAutoCancelRequests } from '@/api/http';
// import { useWebSocket } from '@/api/websocket';

function App() {
  useAutoCancelRequests();
  const globalLoading = useAppSelector((state) => state.loading.globalLoading);
  const [loading, withLoading] = useLocalLoading();

  // const ws = useWebSocket('2', localStorage.getItem('token') || '');
  // useEffect(() => {
  //   if (!ws) return;
  //   const unsubscribeComment = ws.subscribe<{ user: string; content: string }>(
  //     'article:123',
  //     (msg) => console.log('📩 新评论:', msg)
  //   );
  //   return () => unsubscribeComment();
  // }, [ws]);
  // ws?.send({ type: 'INIT_USER' });

  const navigate = useNavigate();

  const login = async () => {
    const params = {
      username: 'yolo',
      password: '123456'
    };
    withLoading(api.userApi.login(params)).then((res) => {
      if (res.code === '200') {
        console.log('登录', res);
      } else {
        console.log('报错了', res);
      }
    });
  };

  const getUsers = async () => {
    const res = await api.userApi.getUsers({
      pageNum: 1,
      pageSize: 10,
      username: 'yolo',
      rangeDate: '2025-05-05,2025-09-03'
    });
    console.log('获取用户列表', res);
  };
  const output = async () => {
    try {
      const res = await api.articleApi.outputArticle({ ids: '1' }, { responseType: 'blob' });
      const disposition = res.headers['content-disposition'];
      let filename = 'articles_${Date.now()}.zip';
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) {
          // 防止中文乱码
          filename = decodeURIComponent(match[1]);
        }
      }

      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log('导出文章失败', err);
    }
  };
  const toPage = () => {
    navigate('/login');
  };
  return (
    <>
      <Outlet />
      <div>{globalLoading ? '全局加载中...' : '全局内容已加载'}</div>
      <div>{loading ? '局部加载中...' : '局部内容已加载'}</div>
      <h1>Vite + React</h1>
      <button onClick={login}>登录</button>
      <button onClick={getUsers}>查询用户列表</button>
      <button onClick={output}>导出文章</button>
      <button onClick={toPage}>路由跳转</button>
    </>
  );
}

export default App;
