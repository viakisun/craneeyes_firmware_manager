# 🚀 Final Deployment Checklist

CraneEyes Firmware Manager - 최종 배포 체크리스트

## ✅ 완료된 작업

### 1. SFTP Integration
- ✅ SFTP 서버 구현 (sftp-server.js)
- ✅ S3 브리지 서비스
- ✅ 역할 기반 접근 제어 (Admin/Downloader)
- ✅ 관리자 UI (FTP 계정 관리)
- ✅ 데이터베이스 스키마 (sftp_users 테이블)

### 2. CI/CD Pipeline
- ✅ GitHub Actions CI workflow (Pull Request 검증)
- ✅ GitHub Actions CD workflow (자동 배포)
- ✅ GitHub Secrets 설정 완료 (14개)
- ✅ EC2 자동 배포 구성

### 3. Domain & SSL
- ✅ 도메인: firmware.craneeyes.com
- ✅ Cloudflare Flexible SSL (EC2 SSL 설정 불필요)
- ✅ Nginx 설정 (HTTP only on EC2)
- ✅ DNS A 레코드 설정

### 4. Documentation
- ✅ CI/CD Guide
- ✅ SFTP Guide
- ✅ SSL Setup Guide
- ✅ Domain Configuration Summary
- ✅ Deployment Checklist (이 문서)

## 📋 배포 전 확인사항

### Cloudflare 설정

1. **DNS 레코드**
   ```
   Type: A
   Name: firmware
   IPv4: 54.180.29.96
   Proxy: Proxied (☁️ 주황색)
   ```

2. **SSL/TLS 모드**
   ```
   SSL/TLS → Overview → Flexible
   ```

3. **DNS 전파 확인**
   ```bash
   nslookup firmware.craneeyes.com
   # Expected: 54.180.29.96
   ```

### EC2 Security Group

포트가 열려있는지 확인:
- ✅ Port 22 (SSH)
- ✅ Port 80 (HTTP)
- ✅ Port 2222 (SFTP)
- ✅ Port 3001 (API - internal only, 외부 접근 불필요)

### GitHub Secrets

모두 설정되었는지 확인:
https://github.com/viakisun/craneeyes_firmware_manager/settings/secrets/actions

- ✅ EC2_HOST
- ✅ EC2_USER
- ✅ EC2_SSH_KEY
- ✅ AWS_REGION
- ✅ AWS_ACCESS_KEY_ID
- ✅ AWS_SECRET_ACCESS_KEY
- ✅ AWS_BUCKET_NAME
- ✅ DB_HOST
- ✅ DB_PORT
- ✅ DB_USER
- ✅ DB_PASSWORD
- ✅ DB_NAME
- ✅ API_PORT
- ✅ SFTP_PORT

## 🚀 배포 실행

### 1. Git Commit & Push

```bash
# 모든 변경사항 확인
git status

# Staging
git add .

# Commit
git commit -m "Complete SFTP integration and CI/CD setup with Cloudflare SSL

- Add SFTP server with S3 backend
- Implement role-based access control (admin/downloader)
- Setup GitHub Actions CI/CD pipeline
- Configure domain: firmware.craneeyes.com
- Update Nginx for Cloudflare Flexible SSL
- Add comprehensive documentation"

# Push to main (triggers auto-deployment)
git push origin main
```

### 2. 배포 모니터링

GitHub Actions에서 배포 진행상황 확인:
https://github.com/viakisun/craneeyes_firmware_manager/actions

**예상 시간**: 3-5분

**단계**:
1. ✅ Code checkout
2. ✅ Build frontend
3. ✅ Create deployment package
4. ✅ SSH to EC2
5. ✅ Deploy on EC2
6. ✅ Restart services (API + SFTP)
7. ✅ Health check

### 3. 배포 완료 확인

#### Frontend
```bash
curl -I https://firmware.craneeyes.com
# Expected: HTTP/2 200
```

#### API
```bash
curl https://firmware.craneeyes.com/api/health
# Expected: {"status":"OK","message":"CraneEyes API Server is running"}
```

#### Browser Test
- https://firmware.craneeyes.com
- https://firmware.craneeyes.com/admin
- 🔒 Padlock icon visible

## 📊 배포 후 작업

### 1. EC2 서버 확인

```bash
# SSH 접속
ssh -i key.pem ec2_user@54.180.29.96

# PM2 상태 확인
pm2 list
# Expected: craneeyes-api (online), craneeyes-sftp (online)

# PM2 로그 확인
pm2 logs --lines 50

# Nginx 상태
sudo systemctl status nginx
```

### 2. SFTP 테스트

```bash
# SFTP 접속 테스트
sftp -P 2222 sftpadmin@firmware.craneeyes.com

# 명령어 테스트
sftp> ls /firmwares
sftp> quit
```

### 3. Admin Panel 접속

1. https://firmware.craneeyes.com/admin
2. Login: crane@dy.co.kr / 1234
3. FTP 계정 메뉴 확인
4. 기본 사용자 2개 확인:
   - sftpadmin (admin)
   - downloader (downloader)

### 4. 기본 비밀번호 변경

```bash
# EC2에서
npm run create-sftp-users
```

생성된 기본 계정 비밀번호를 Admin Panel에서 변경:
- sftpadmin: admin123 → 새 비밀번호
- downloader: download123 → 새 비밀번호

## 🔧 Troubleshooting

### 배포 실패

**GitHub Actions 로그 확인**:
1. Actions 탭에서 실패한 workflow 클릭
2. 빨간색 X 표시된 단계 확인
3. 로그 상세 내용 확인

**일반적인 문제**:
- SSH 연결 실패 → EC2 SSH 키 확인
- 빌드 실패 → TypeScript 에러 확인
- 배포 실패 → EC2 디스크 공간 확인

### Health Check 실패

```bash
# EC2에서 직접 확인
curl http://localhost:3001/api/health

# PM2 재시작
pm2 restart all

# Nginx 재시작
sudo systemctl restart nginx
```

### SFTP 연결 안됨

```bash
# EC2에서 SFTP 서버 상태 확인
pm2 logs craneeyes-sftp

# SFTP 포트 확인
sudo netstat -tulpn | grep 2222

# 재시작
pm2 restart craneeyes-sftp
```

## 📈 모니터링

### 정기 확인 사항

**Daily**:
- PM2 프로세스 상태
- API health check
- Nginx access/error 로그

**Weekly**:
- 디스크 사용량
- 데이터베이스 연결
- SFTP 사용자 활동

**Monthly**:
- 보안 업데이트
- 의존성 업데이트
- 백업 확인

### 로그 위치

```bash
# PM2 로그
~/.pm2/logs/

# Nginx 로그
/var/log/nginx/craneeyes_access.log
/var/log/nginx/craneeyes_error.log

# Application 로그
pm2 logs
```

## 🎯 Next Steps

### 선택적 개선 사항

1. **모니터링 도구**
   - PM2 Plus (프로세스 모니터링)
   - CloudWatch (AWS 모니터링)
   - Sentry (에러 트래킹)

2. **백업 자동화**
   - 데이터베이스 자동 백업
   - S3 버전 관리
   - 설정 파일 백업

3. **성능 최적화**
   - Redis 캐싱
   - CDN 최적화
   - 데이터베이스 인덱스

4. **보안 강화**
   - Fail2Ban 설치
   - 방화벽 규칙 강화
   - 정기 보안 감사

## 📞 Support

문제 발생 시:
1. GitHub Actions 로그 확인
2. EC2 PM2 로그 확인
3. Nginx 로그 확인
4. 이 체크리스트 다시 확인

## 🎉 Deployment Complete!

모든 체크리스트를 완료했다면:

✅ **Frontend**: https://firmware.craneeyes.com
✅ **API**: https://firmware.craneeyes.com/api
✅ **Admin**: https://firmware.craneeyes.com/admin
✅ **SFTP**: sftp -P 2222 user@firmware.craneeyes.com
✅ **CI/CD**: Automated via GitHub Actions
✅ **SSL**: Cloudflare Flexible (Automatic)

---

**Deployed**: $(date +%Y-%m-%d)
**Version**: 0.1.0 with SFTP Support
**Platform**: Amazon Linux EC2
**Domain**: firmware.craneeyes.com
**SSL Provider**: Cloudflare

