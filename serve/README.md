启动 mysql
启动 redis

```
# 启动 Redis（系统启动时自动运行）
brew services start redis

# 停止 Redis
brew services stop redis

# 重启 Redis
brew services restart redis

# 查看运行状态
brew services list
```

验证 Redis 是否正常运行

```
# 连接测试
redis-cli ping
# 正常应返回 "PONG"

# 如果Redis 服务端启用了密码认证，则通过 -a 参数指定密码
redis-cli -a yourpassword ping

# 查看运行进程
ps aux | grep redis-server

# 查看监听端口
lsof -i :6379
```

配置文件位置

```
/usr/local/etc/redis.conf
```

端口 6379 被占用

```
# 查找占用进程
lsof -i :6379

# 终止占用进程
kill -9 <PID>
```
