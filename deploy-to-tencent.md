# 苍穹外卖管理后台 - 腾讯云服务器部署指南

## 已完成的工作
✅ 本地 Docker 构建成功
✅ 本地测试通过 (http://localhost:8080 可访问)

## 第一步：镜像推送方案

### 方案一：使用 Docker Hub（推荐国际网络）
```bash
# 1. 登录 Docker Hub
docker login

# 2. 标记镜像
docker tag sky-admin yourusername/sky-admin:latest

# 3. 推送镜像
docker push yourusername/sky-admin:latest
```

### 方案二：使用阿里云容器镜像服务（推荐国内网络）
```bash
# 1. 登录阿里云容器镜像服务
docker login --username=yourname registry.cn-hangzhou.aliyuncs.com

# 2. 标记镜像
docker tag sky-admin registry.cn-hangzhou.aliyuncs.com/yournamespace/sky-admin:latest

# 3. 推送镜像
docker push registry.cn-hangzhou.aliyuncs.com/yournamespace/sky-admin:latest
```

### 方案三：直接导出/导入镜像（无需镜像仓库）
```bash
# 1. 本地导出镜像
docker save -o sky-admin.tar sky-admin

# 2. 将 sky-admin.tar 上传到服务器
scp sky-admin.tar user@your-server-ip:/path/to/

# 3. 在服务器上加载镜像
docker load -i /path/to/sky-admin.tar
```

## 第二步：服务器端部署

### 在腾讯云服务器上执行以下命令：

```bash
# 1. 如果使用方案一或二，先拉取镜像
docker pull yourusername/sky-admin:latest
# 或
docker pull registry.cn-hangzhou.aliyuncs.com/yournamespace/sky-admin:latest

# 2. 创建 docker-compose.yml 文件
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  sky-admin:
    image: yourusername/sky-admin:latest
    # 或使用阿里云镜像：registry.cn-hangzhou.aliyuncs.com/yournamespace/sky-admin:latest
    container_name: sky-admin
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    environment:
      - TZ=Asia/Shanghai
    volumes:
      - ./logs:/var/log/nginx
    networks:
      - sky-network

networks:
  sky-network:
    driver: bridge
EOF

# 3. 启动服务
docker-compose up -d

# 4. 查看服务状态
docker-compose ps

# 5. 查看日志
docker-compose logs -f
```

### 或者直接使用 docker run 命令：
```bash
docker run -d \
  --name sky-admin \
  -p 80:80 \
  -p 443:443 \
  -e TZ=Asia/Shanghai \
  -v $(pwd)/logs:/var/log/nginx \
  --restart unless-stopped \
  yourusername/sky-admin:latest
```

## 第三步：环境配置

### 1. 服务器环境检查
```bash
# 检查 Docker 版本
docker --version

# 检查 Docker Compose 版本
docker-compose --version

# 检查防火墙设置
sudo ufw status
```

### 2. 域名配置（如果需要）
```nginx
# Nginx 反向代理配置示例
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 第四步：监控与维护

### 1. 健康检查
```bash
# 检查容器状态
docker ps

# 检查容器日志
docker logs sky-admin

# 进入容器调试
docker exec -it sky-admin sh
```

### 2. 备份与恢复
```bash
# 备份镜像
docker save -o sky-admin-backup-$(date +%Y%m%d).tar sky-admin

# 恢复镜像
docker load -i sky-admin-backup-YYYYMMDD.tar
```

## 故障排除

### 1. 端口冲突
```bash
# 检查端口占用
sudo netstat -tlnp | grep :80

# 如果端口被占用，修改 docker-compose.yml 中的端口映射
# 例如将 80:80 改为 8080:80
```

### 2. 权限问题
```bash
# 创建日志目录并设置权限
mkdir -p logs
chmod 755 logs
```

### 3. 网络问题
```bash
# 检查容器网络
docker network ls
docker network inspect sky-network

# 重启容器
docker-compose restart sky-admin
```

## 后续优化建议

1. **使用 Nginx 反向代理**：配置 SSL/TLS 证书实现 HTTPS
2. **配置监控**：使用 Prometheus + Grafana 监控容器状态
3. **日志收集**：使用 ELK 或 Loki 收集和分析日志
4. **自动构建部署**：配置 GitLab CI/CD 或 GitHub Actions 实现自动化部署

## 联系支持

如遇到问题，请提供以下信息：
- 操作系统版本
- Docker 版本
- 错误日志 (`docker logs sky-admin`)
- 部署方式（直接运行还是 docker-compose）

---
*最后更新: 2025-12-23*
