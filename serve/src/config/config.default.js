const path = require('path');

const dotenv = require('dotenv');

// 仅在非生产环境且未通过 Docker 注入变量时加载 .env 文件
/* docker run -d \
  -e DOCKER_INJECTED=true \
  -e NODE_ENV=production \
  -e DB_HOST=prod-db.example.com \
  -e DB_USER=admin \
  -e DB_PASSWORD=your_secure_password \
  -p 3000:8000 \
  Blog */

if (process.env.NODE_ENV !== 'production' && !process.env.DOCKER_INJECTED) {
  const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
  dotenv.config({ path: path.resolve(__dirname, '../../' + envFile) });
}
