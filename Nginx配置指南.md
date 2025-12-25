# Nginx反向代理配置指南

## 概述
本指南介绍如何在服务器上安装和配置Nginx反向代理，将HTTP请求转发到后端Node.js服务。

## 前置要求
- 已部署后端Node.js服务（运行在3000端口）
- 有服务器root权限或sudo权限
- 已配置域名（可选，也可以使用IP地址）

## 安装Nginx

### Ubuntu/Debian系统
```bash
# 更新包管理器
sudo apt update

# 安装Nginx
sudo apt install nginx -y

# 启动Nginx
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx

# 检查Nginx状态
sudo systemctl status nginx
```

### CentOS/RHEL系统
```bash
# 安装EPEL仓库
sudo yum install epel-release -y

# 安装Nginx
sudo yum install nginx -y

# 启动Nginx
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx

# 检查Nginx状态
sudo systemctl status nginx
```

## 配置Nginx

### 1. 上传配置文件
将项目根目录的`nginx.conf`文件上传到服务器：

```bash
# 在本地执行
scp nginx.conf root@129.211.62.76:/etc/nginx/sites-available/habit-diary
```

### 2. 创建符号链接
```bash
# 在服务器上执行
sudo ln -s /etc/nginx/sites-available/habit-diary /etc/nginx/sites-enabled/
```

### 3. 修改配置文件
```bash
# 编辑配置文件
sudo nano /etc/nginx/sites-available/habit-diary

# 将 your-domain.com 替换为您的实际域名或服务器IP
# 例如：server_name 129.211.62.76;
```

### 4. 测试配置
```bash
# 测试Nginx配置是否正确
sudo nginx -t
```

### 5. 重启Nginx
```bash
# 重启Nginx使配置生效
sudo systemctl restart nginx

# 或者重新加载配置（不中断服务）
sudo systemctl reload nginx
```

## 验证配置

### 1. 检查Nginx状态
```bash
sudo systemctl status nginx
```

### 2. 测试API访问
```bash
# 测试健康检查端点
curl http://your-domain.com/health

# 测试API端点
curl http://your-domain.com/api/users/login
```

### 3. 查看日志
```bash
# 查看访问日志
sudo tail -f /var/log/nginx/habit-diary-access.log

# 查看错误日志
sudo tail -f /var/log/nginx/habit-diary-error.log
```

## 常用Nginx命令

```bash
# 启动Nginx
sudo systemctl start nginx

# 停止Nginx
sudo systemctl stop nginx

# 重启Nginx
sudo systemctl restart nginx

# 重新加载配置
sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx

# 测试配置
sudo nginx -t

# 查看版本
nginx -v
```

## 防火墙配置

### Ubuntu/Debian (UFW)
```bash
# 允许HTTP
sudo ufw allow 'Nginx HTTP'

# 允许HTTPS
sudo ufw allow 'Nginx HTTPS'

# 查看防火墙状态
sudo ufw status
```

### CentOS/RHEL (firewalld)
```bash
# 允许HTTP
sudo firewall-cmd --permanent --add-service=http

# 允许HTTPS
sudo firewall-cmd --permanent --add-service=https

# 重新加载防火墙
sudo firewall-cmd --reload

# 查看防火墙状态
sudo firewall-cmd --list-all
```

## 常见问题排查

### 1. 502 Bad Gateway
**原因**: 后端服务未运行或端口不正确

**解决方案**:
```bash
# 检查后端服务状态
pm2 list

# 检查端口是否被占用
netstat -tlnp | grep 3000

# 重启后端服务
pm2 restart habit-diary-backend
```

### 2. 504 Gateway Timeout
**原因**: 后端服务响应超时

**解决方案**:
```bash
# 编辑Nginx配置，增加超时时间
sudo nano /etc/nginx/sites-available/habit-diary

# 修改以下参数
proxy_connect_timeout 120s;
proxy_send_timeout 120s;
proxy_read_timeout 120s;

# 重启Nginx
sudo systemctl restart nginx
```

### 3. 403 Forbidden
**原因**: 权限问题或配置错误

**解决方案**:
```bash
# 检查Nginx配置
sudo nginx -t

# 检查文件权限
ls -la /etc/nginx/sites-available/

# 重启Nginx
sudo systemctl restart nginx
```

### 4. 端口被占用
**原因**: 80或443端口被其他服务占用

**解决方案**:
```bash
# 查看端口占用情况
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# 停止占用端口的服务
sudo systemctl stop apache2  # 如果是Apache占用
```

## 性能优化

### 1. 启用Gzip压缩
在`nginx.conf`中添加：
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### 2. 配置缓存
在`nginx.conf`中添加：
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
```

### 3. 调整工作进程数
在`nginx.conf`中修改：
```nginx
worker_processes auto;
worker_connections 1024;
```

## 下一步
配置完成后，下一步是配置SSL证书以启用HTTPS。请参考《SSL证书配置指南》。

## 参考资料
- Nginx官方文档: https://nginx.org/en/docs/
- Nginx反向代理配置: https://nginx.org/en/docs/http/ngx_http_proxy_module.html
