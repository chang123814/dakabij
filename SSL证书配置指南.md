# SSL证书配置指南

## 概述
本指南介绍如何为习惯日记小程序配置SSL证书，启用HTTPS加密连接。微信小程序要求所有API请求必须使用HTTPS协议。

## 前置要求
- 已配置Nginx反向代理
- 已有域名（如：your-domain.com）
- 服务器有公网IP
- 域名DNS已解析到服务器IP

## 方案选择

### 方案1：使用Let's Encrypt免费证书（推荐）
**优点**：
- 完全免费
- 自动续期
- 受所有主流浏览器信任
- 配置简单

**适用场景**：
- 个人项目
- 测试环境
- 小型商业项目

### 方案2：购买商业SSL证书
**优点**：
- 更高的信任级别
- 提供保险保障
- 技术支持

**适用场景**：
- 大型商业项目
- 对安全性要求较高的场景

## 方案1：使用Let's Encrypt免费证书

### 1. 安装Certbot

#### Ubuntu/Debian系统
```bash
# 更新包管理器
sudo apt update

# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y
```

#### CentOS/RHEL系统
```bash
# 安装EPEL仓库
sudo yum install epel-release -y

# 安装Certbot
sudo yum install certbot python3-certbot-nginx -y
```

### 2. 获取SSL证书

#### 自动配置（推荐）
```bash
# 自动获取证书并配置Nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 如果只使用IP地址
sudo certbot --nginx -d 129.211.62.76
```

**注意事项**：
- 将`your-domain.com`替换为您的实际域名
- 如果使用IP地址，Let's Encrypt可能无法签发证书，需要使用方案2
- Certbot会自动修改Nginx配置文件

#### 手动配置
```bash
# 只获取证书，不自动配置Nginx
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com
```

### 3. 配置Nginx使用SSL证书

如果使用手动配置，需要编辑Nginx配置文件：

```bash
sudo nano /etc/nginx/sites-available/habit-diary
```

启用HTTPS配置部分（取消注释）：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # ... 其他配置保持不变
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 4. 测试并重启Nginx

```bash
# 测试Nginx配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 5. 验证SSL证书

```bash
# 检查证书状态
sudo certbot certificates

# 测试HTTPS访问
curl https://your-domain.com/health
```

### 6. 设置自动续期

Let's Encrypt证书有效期为90天，需要设置自动续期：

```bash
# 测试自动续期
sudo certbot renew --dry-run

# 设置定时任务自动续期
sudo crontab -e
```

添加以下内容（每天凌晨2点检查并续期）：

```
0 2 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

## 方案2：使用自签名证书（仅用于测试）

**注意**：自签名证书不受浏览器信任，仅用于开发和测试环境。

### 1. 生成自签名证书

```bash
# 创建证书目录
sudo mkdir -p /etc/ssl/self-signed

# 生成自签名证书（有效期1年）
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/self-signed/self-signed.key \
  -out /etc/ssl/self-signed/self-signed.crt
```

### 2. 配置Nginx

编辑Nginx配置文件：

```bash
sudo nano /etc/nginx/sites-available/habit-diary
```

修改SSL证书路径：

```nginx
ssl_certificate /etc/ssl/self-signed/self-signed.crt;
ssl_certificate_key /etc/ssl/self-signed/self-signed.key;
```

### 3. 重启Nginx

```bash
sudo systemctl restart nginx
```

## 方案3：购买商业SSL证书

### 1. 购买证书
从以下证书颁发机构（CA）购买SSL证书：
- DigiCert
- GlobalSign
- Comodo
- Let's Encrypt（免费）
- 阿里云SSL证书
- 腾讯云SSL证书

### 2. 生成CSR（证书签名请求）

```bash
# 生成私钥
sudo openssl genrsa -out your-domain.com.key 2048

# 生成CSR
sudo openssl req -new -key your-domain.com.key -out your-domain.com.csr
```

### 3. 提交CSR到CA
将CSR文件提交给证书颁发机构，完成验证流程。

### 4. 下载并安装证书
下载CA签发的证书文件，并配置到Nginx。

## 微信小程序HTTPS要求

### 1. 域名要求
- 必须使用HTTPS协议
- 域名必须在微信公众平台配置服务器域名白名单
- 证书必须由受信任的CA签发

### 2. 证书要求
- 证书必须有效
- 证书链必须完整
- 证书必须包含域名

### 3. 配置服务器域名

登录微信公众平台（https://mp.weixin.qq.com/）：
1. 进入"开发" → "开发管理" → "开发设置"
2. 在"服务器域名"中配置：
   - request合法域名：https://your-domain.com
   - uploadFile合法域名：https://your-domain.com
   - downloadFile合法域名：https://your-domain.com

## 验证HTTPS配置

### 1. 浏览器测试
在浏览器中访问：`https://your-domain.com/health`
- 检查地址栏是否显示锁形图标
- 点击锁形图标查看证书详情

### 2. 在线SSL测试
使用以下工具测试SSL配置：
- SSL Labs: https://www.ssllabs.com/ssltest/
- Qualys SSL Test: https://www.qualys.com/ssl-test/

### 3. 命令行测试

```bash
# 测试HTTPS连接
curl -I https://your-domain.com/health

# 查看证书详情
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# 测试SSL配置
nmap --script ssl-enum-ciphers -p 443 your-domain.com
```

## 常见问题排查

### 1. 证书过期
**解决方案**：
```bash
# 续期证书
sudo certbot renew

# 重启Nginx
sudo systemctl restart nginx
```

### 2. 证书链不完整
**解决方案**：
确保使用`fullchain.pem`而不是`cert.pem`：
```nginx
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
```

### 3. 域名不匹配
**解决方案**：
确保证书包含的域名与访问的域名一致。

### 4. 混合内容警告
**解决方案**：
确保所有资源都使用HTTPS协议。

### 5. 微信小程序请求失败
**解决方案**：
1. 检查证书是否由受信任的CA签发
2. 确认域名已在微信公众平台配置
3. 检查证书有效期
4. 确保使用TLS 1.2或更高版本

## 性能优化

### 1. 启用HTTP/2
Nginx默认已启用HTTP/2，确保配置正确：
```nginx
listen 443 ssl http2;
```

### 2. 优化SSL会话
```nginx
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;
```

### 3. 使用强加密套件
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers on;
```

## 安全建议

1. **定期更新证书**：使用Let's Encrypt自动续期
2. **使用强加密**：禁用弱加密套件
3. **启用HSTS**：强制使用HTTPS
4. **监控证书过期**：设置提醒
5. **定期检查SSL配置**：使用SSL Labs测试

## 下一步
SSL证书配置完成后，您的习惯日记小程序已经可以安全运行了。接下来可以进行：
- 小程序真机测试
- 性能优化
- 功能扩展

## 参考资料
- Let's Encrypt官方文档: https://letsencrypt.org/docs/
- Nginx SSL配置: https://nginx.org/en/docs/http/configuring_https_servers.html
- 微信小程序服务器域名配置: https://developers.weixin.qq.com/miniprogram/dev/framework/server-communication.html
