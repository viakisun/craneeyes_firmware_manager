# Domain Configuration Summary

## 변경 완료: firmware.craneeyes.com

CraneEyes Firmware Manager가 `firmware.craneeyes.com` 도메인으로 설정되었습니다.

## 📋 변경된 파일들

### 1. Nginx 설정
**파일**: `nginx.conf`

```nginx
# HTTP (Port 80)
server_name firmware.craneeyes.com;

# HTTPS (Port 443) - SSL 설정 후
server_name firmware.craneeyes.com;
ssl_certificate /etc/letsencrypt/live/firmware.craneeyes.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/firmware.craneeyes.com/privkey.pem;
```

### 2. GitHub Actions Workflow
**파일**: `.github/workflows/deploy.yml`

```yaml
# Build with HTTPS API URL
VITE_API_BASE_URL: https://firmware.craneeyes.com/api

# Health check with domain
curl -f https://firmware.craneeyes.com/api/health
```

### 3. Production Environment
**파일**: `env.production.example`

```bash
# API URL updated
VITE_API_BASE_URL=/api  # or https://firmware.craneeyes.com/api
```

### 4. 새로운 문서
**파일**: `docs/SSL_SETUP_GUIDE.md`
- Let's Encrypt SSL 인증서 설정 가이드
- Certbot 설치 및 사용법
- 자동 갱신 설정
- 트러블슈팅

## 🚀 배포 전 필수 작업

### 1. DNS 설정

**A 레코드 추가** (Cloudflare):

```
# Landing page (루트 도메인)
Type: A
Host: @  (또는 craneeyes.com)
Value: 54.180.29.96
Proxy: Proxied (☁️ 주황색)
TTL: Auto

# Firmware manager (서브도메인)
Type: A
Host: firmware
Value: 54.180.29.96
Proxy: Proxied (☁️ 주황색)
TTL: Auto
```

**확인**:
```bash
nslookup craneeyes.com
# Expected: Cloudflare IP (proxied)

nslookup firmware.craneeyes.com
# Expected: Cloudflare IP (proxied)
```

### 2. EC2 보안 그룹

다음 포트가 열려있는지 확인:

| Port | Protocol | Purpose |
|------|----------|---------|
| 22   | TCP      | SSH     |
| 80   | HTTP     | HTTP    |
| 443  | HTTPS    | HTTPS   |
| 2222 | TCP      | SFTP    |

### 3. SSL 인증서 설치

```bash
# EC2에 접속
ssh -i key.pem ec2_user@54.180.29.96

# Certbot 설치 (Amazon Linux 2023)
sudo dnf install -y certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d firmware.craneeyes.com

# 자동으로 HTTPS 설정됨!
```

자세한 내용: [SSL Setup Guide](docs/SSL_SETUP_GUIDE.md)

## 📊 배포 후 접속 URL

### Landing Page
- **URL**: https://craneeyes.com
- **Description**: 회사 소개 및 제품 소개 페이지

### Firmware Manager (Public)
- **HTTP**: http://firmware.craneeyes.com
- **HTTPS**: https://firmware.craneeyes.com ← 최종 사용

### API
- **Endpoint**: https://firmware.craneeyes.com/api
- **Health Check**: https://firmware.craneeyes.com/api/health

### SFTP
```bash
sftp -P 2222 username@firmware.craneeyes.com
```

### Admin Panel
- **URL**: https://firmware.craneeyes.com/admin
- **Login**: crane@dy.co.kr / 1234

## 🔄 CI/CD 자동 배포

### main 브랜치에 push하면:

1. ✅ 코드 빌드 (HTTPS URL 포함)
2. ✅ EC2에 배포
3. ✅ PM2 재시작 (API + SFTP)
4. ✅ Nginx 재로드
5. ✅ 헬스 체크 (https://firmware.craneeyes.com/api/health)

### 배포 모니터링

GitHub Actions: https://github.com/viakisun/craneeyes_firmware_manager/actions

## 🔧 EC2 서버 설정 체크리스트

### 1. DNS 확인
```bash
ping firmware.craneeyes.com
# Should resolve to 54.180.29.96
```

### 2. Nginx 설정 적용
```bash
cd /home/ec2-user/craneeyes-firmware-manager

# 최신 nginx.conf 복사
sudo cp nginx.conf /etc/nginx/conf.d/craneeyes.conf

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

### 3. SSL 인증서 설치
```bash
# Certbot으로 SSL 설치
sudo certbot --nginx -d firmware.craneeyes.com

# 자동으로:
# - SSL 인증서 발급
# - Nginx 설정 업데이트
# - HTTP → HTTPS 리다이렉트 설정
# - 자동 갱신 스케줄 등록
```

### 4. 환경 변수 업데이트
```bash
# .env 파일 업데이트
nano /home/ec2-user/craneeyes-firmware-manager/.env

# VITE_API_BASE_URL 확인
VITE_API_BASE_URL=/api  # Nginx proxy 사용 시
# or
VITE_API_BASE_URL=https://firmware.craneeyes.com/api
```

### 5. 재배포
```bash
cd /home/ec2-user/craneeyes-firmware-manager

# Git pull
git pull origin main

# Rebuild with new domain
npm run build

# Copy to web directory
sudo cp -r dist/* /var/www/html/craneeyes/

# Restart services
pm2 restart ecosystem.config.cjs
```

## ✅ 테스트 체크리스트

### Landing Page
- [ ] https://craneeyes.com (Landing page loads)
- [ ] https://www.craneeyes.com (www redirect works)
- [ ] Language toggle (KO/EN) works
- [ ] Contact form works
- [ ] SSL certificate valid (🔒 padlock in browser)

### Firmware Manager
- [ ] http://firmware.craneeyes.com (HTTP to HTTPS redirect)
- [ ] https://firmware.craneeyes.com (Main page loads)
- [ ] https://firmware.craneeyes.com/admin (Admin login works)
- [ ] SSL certificate valid (🔒 padlock in browser)

### API
- [ ] https://firmware.craneeyes.com/api/health (Returns OK)
- [ ] https://firmware.craneeyes.com/api/models (Returns model list)
- [ ] https://firmware.craneeyes.com/api/firmwares (Returns firmwares)

### SFTP
- [ ] `sftp -P 2222 username@firmware.craneeyes.com` (Connects successfully)
- [ ] Can list files: `ls /firmwares`
- [ ] Can download files: `get firmware.bin`

### SSL Certificates (Cloudflare)
- [ ] https://craneeyes.com - Valid certificate
- [ ] https://firmware.craneeyes.com - Valid certificate
- [ ] No browser warnings
- [ ] Grade A on SSL Labs test

## 🔍 Troubleshooting

### DNS not resolving
```bash
# Check DNS propagation
nslookup firmware.craneeyes.com

# Wait 5-10 minutes for DNS propagation
# Or flush DNS cache:
# Mac: sudo dscacheutil -flushcache
# Windows: ipconfig /flushdns
```

### SSL certificate not working
```bash
# Check certbot status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Check nginx config
sudo nginx -t
```

### Site not loading
```bash
# Check nginx status
sudo systemctl status nginx

# Check nginx logs
sudo tail -f /var/log/nginx/craneeyes_error.log

# Restart nginx
sudo systemctl restart nginx
```

### API not responding
```bash
# Check PM2 status
pm2 list

# Check API logs
pm2 logs craneeyes-api

# Restart API
pm2 restart craneeyes-api
```

## 📚 관련 문서

- **[SSL Setup Guide](docs/SSL_SETUP_GUIDE.md)** - SSL 인증서 상세 설정
- **[CI/CD Guide](docs/CI_CD_GUIDE.md)** - 자동 배포 파이프라인
- **[Deployment Guide](docs/deployment/README.md)** - 수동 배포 가이드
- **[SFTP Guide](docs/SFTP_GUIDE.md)** - SFTP 서버 설정

## 🎯 Next Steps

1. **DNS 설정** - A 레코드 추가
2. **보안 그룹 확인** - 포트 80, 443 오픈
3. **SSL 인증서 설치** - Certbot 실행
4. **테스트** - 모든 URL 접속 확인
5. **모니터링** - GitHub Actions & PM2 로그 확인

## 🔐 보안 강화 (선택사항)

### Fail2Ban 설치
```bash
# Brute force 공격 방어
sudo yum install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Firewall 설정
```bash
# Firewalld 활성화
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 📝 변경 이력

- **2025-10-29**: 도메인을 `firmware.craneeyes.com`으로 설정
- Nginx, CI/CD, 문서 모두 업데이트 완료
- SSL 설정 가이드 추가
- Amazon Linux EC2 최적화 완료

---

**Domain**: firmware.craneeyes.com
**IP**: 54.180.29.96
**Platform**: Amazon Linux 2 / 2023
**SSL**: Let's Encrypt (Auto-renewal enabled)

