import api from '@/api';
function App() {
  const login = async () => {
    const params = {
      username: 'yolo',
      password: '123456'
    };
    const res = await api.userApi.login(params);
    console.log('登录', res);
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
  return (
    <>
      <h1>Vite + React</h1>
      <button onClick={login}>登录</button>
      <button onClick={getUsers}>查询用户列表</button>
      <button onClick={output}>导出文章</button>
    </>
  );
}

export default App;
