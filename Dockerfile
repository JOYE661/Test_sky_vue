# 多阶段构建
# 第一阶段：使用 Node.js 14 进行依赖安装和构建
FROM node:14-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装编译工具（用于编译 fibers 等原生扩展）
# 使用阿里云 Alpine 镜像源加速
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
    && apk update \
    && apk add --no-cache python3 make g++ \
    && python3 -m ensurepip

# 使用国内镜像加速安装依赖
RUN npm config set registry https://registry.npmmirror.com \
    && npm config set disturl https://npmmirror.com/dist \
    && npm install --verbose \
    && npm install core-js@3 --save \
    && npm install @babel/runtime-corejs3 --save-dev

# 升级关键依赖以解决 TypeScript 类型兼容性问题
RUN npm install --save-dev --registry=https://registry.npmmirror.com \
    typescript@3.9.10 \
    @types/node@14.18.0 \
    vue-template-compiler@2.7.16

# 升级 Vue 生态相关依赖到兼容版本
RUN npm install --save --registry=https://registry.npmmirror.com \
    vue@2.7.16 \
    vue-router@3.6.5 \
    vuex@3.6.2 \
    vue-class-component@7.2.6 \
    vue-property-decorator@9.1.2

# 升级 Vue CLI 相关依赖到兼容版本（保持与现有配置兼容）
RUN npm install --save-dev --registry=https://registry.npmmirror.com \
    @vue/cli-service@4.5.19 \
    @vue/cli-plugin-typescript@4.5.19 \
    @vue/cli-plugin-babel@4.5.19 \
    @vue/cli-plugin-eslint@4.5.19 \
    sass@1.32.13 \
    sass-loader@10.2.0

# 复制源代码
COPY . .

# 设置 TypeScript 跳过库检查（解决 @types/node 版本兼容性问题）
ENV TS_SKIP_LIB_CHECK true

# 构建生产版本（跳过 TypeScript 库检查，解决 @types/node 版本兼容性问题）
RUN TS_SKIP_LIB_CHECK=true npm run build -- --skipLibCheck

# 第二阶段：使用 nginx 部署
FROM nginx:1.25-alpine

# 复制nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物到 nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 设置权限
RUN chmod -R 755 /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
