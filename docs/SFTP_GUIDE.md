# CraneEyes SFTP 접속 가이드

CraneEyes 펌웨어 관리 시스템의 SFTP 서버 접속 및 사용 방법을 안내합니다.

---

## 📋 목차

1. [서버 정보](#서버-정보)
2. [사용자 계정 목록](#사용자-계정-목록)
3. [접속 방법](#접속-방법)
4. [사용 예시](#사용-예시)
5. [주의사항](#주의사항)
6. [문제 해결](#문제-해결)

---

## 🌐 서버 정보

### 기본 연결 정보

| 항목 | 값 |
|------|-----|
| **호스트** | `sftp.craneeyes.com` 또는 `54.180.29.96` |
| **포트** | `2222` |
| **프로토콜** | SFTP (SSH File Transfer Protocol) |
| **인증 방식** | 사용자명 + 비밀번호 |

### 접근 경로

접속하면 `/firmwares` 디렉토리로 자동 연결됩니다.
```
/firmwares/
  ├── SS1406/
  ├── SS1416/
  ├── SS1926/
  ├── ST2216/
  └── ... (기타 모델)
```

---

## 👥 사용자 계정 목록

### 관리자 계정 (읽기/쓰기/삭제 권한)

#### 1. crane_admin1
- **비밀번호**: `admin001`
- **허용 모델**: SS 시리즈 (11개)
  - SS1406, SS1416, SS1926
  - SS2036Ace, SS2037Ace, SS2037D
  - SS2725LB, SS3506, SS3506M
  - SS75065, SSN2200A-PRO

#### 2. crane_admin2
- **비밀번호**: `admin002`
- **허용 모델**: ST + SSN + SM 시리즈 (9개)
  - SSN2200III, SSN2800III, SSN3000
  - ST2216, ST2217, ST2217D
  - ST2507, ST7516, SM7016

### 다운로더 계정 (읽기 전용)

#### 3. crane_dl1
- **비밀번호**: `dl001`
- **허용 모델**: SS1406, SS1416

#### 4. crane_dl2
- **비밀번호**: `dl002`
- **허용 모델**: SS1926, SS2036Ace, SS2037Ace, SS2037D

#### 5. crane_dl3
- **비밀번호**: `dl003`
- **허용 모델**: SS2725LB, SS3506, SS3506M, SS75065

#### 6. crane_dl4
- **비밀번호**: `dl004`
- **허용 모델**: SSN2200A-PRO, SSN2200III, SSN2800III, SSN3000

#### 7. crane_dl5
- **비밀번호**: `dl005`
- **허용 모델**: ST2216, ST2217, ST2217D, ST2507, ST7516, SM7016

---

## 🔌 접속 방법

### 1. 명령줄 (Command Line)

#### macOS / Linux
```bash
sftp -P 2222 crane_admin1@sftp.craneeyes.com
```

#### Windows (PowerShell)
```powershell
sftp -P 2222 crane_admin1@sftp.craneeyes.com
```

> **참고**: Windows에서 `sftp` 명령이 없다면 [Git Bash](https://git-scm.com/downloads) 또는 [OpenSSH](https://docs.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse)를 설치하세요.

### 2. FileZilla (GUI 클라이언트)

1. **FileZilla 다운로드**: https://filezilla-project.org/
2. **연결 설정**:
   - **호스트**: `sftp://sftp.craneeyes.com`
   - **포트**: `2222`
   - **프로토콜**: `SFTP - SSH File Transfer Protocol`
   - **로그온 유형**: `일반`
   - **사용자**: `crane_admin1` (또는 다른 계정)
   - **비밀번호**: 해당 계정 비밀번호
3. **빠른 연결** 또는 **사이트 관리자**에 저장

### 3. WinSCP (Windows 전용)

1. **WinSCP 다운로드**: https://winscp.net/
2. **새 세션 설정**:
   - **파일 프로토콜**: `SFTP`
   - **호스트 이름**: `sftp.craneeyes.com`
   - **포트 번호**: `2222`
   - **사용자 이름**: `crane_admin1`
   - **비밀번호**: 해당 계정 비밀번호
3. **로그인** 클릭

### 4. Cyberduck (macOS / Windows)

1. **Cyberduck 다운로드**: https://cyberduck.io/
2. **새 연결**:
   - **프로토콜**: `SFTP (SSH File Transfer Protocol)`
   - **서버**: `sftp.craneeyes.com`
   - **포트**: `2222`
   - **사용자명**: `crane_admin1`
   - **비밀번호**: 해당 계정 비밀번호
3. **연결** 클릭

---

## 📖 사용 예시

### 명령줄 기본 명령어

#### 접속 후 사용 가능한 SFTP 명령어

```bash
# 현재 디렉토리 확인
pwd

# 파일/폴더 목록 보기
ls

# 특정 디렉토리로 이동
cd SS1406

# 파일 다운로드 (로컬로)
get firmware_v1.0.bin

# 폴더 전체 다운로드
get -r SS1406

# 파일 업로드 (관리자만 가능)
put /path/to/local/firmware_v1.1.bin

# 폴더 생성 (관리자만 가능)
mkdir NewModel

# 파일 삭제 (관리자만 가능)
rm old_firmware.bin

# 로컬 디렉토리 확인
lpwd

# 로컬 파일 목록 보기
lls

# 도움말
help

# 종료
exit
# 또는
quit
```

### 실제 사용 예시

#### 예시 1: crane_admin1으로 접속 및 펌웨어 업로드

```bash
# 1. 접속
$ sftp -P 2222 crane_admin1@sftp.craneeyes.com
crane_admin1@sftp.craneeyes.com's password: admin001

# 2. 현재 위치 확인
sftp> pwd
Remote working directory: /firmwares

# 3. 사용 가능한 모델 확인
sftp> ls
SS1406         SS1416         SS1926         SS2036Ace      
SS2037Ace      SS2037D        SS2725LB       SS3506         
SS3506M        SS75065        SSN2200A-PRO   

# 4. SS1406 폴더로 이동
sftp> cd SS1406

# 5. 기존 펌웨어 확인
sftp> ls
firmware_v1.0.bin    firmware_v1.1.bin

# 6. 새 펌웨어 업로드
sftp> put ~/Downloads/firmware_v1.2.bin
Uploading firmware_v1.2.bin to /firmwares/SS1406/firmware_v1.2.bin
firmware_v1.2.bin                     100%   15MB   5.2MB/s   00:03

# 7. 업로드 확인
sftp> ls
firmware_v1.0.bin    firmware_v1.1.bin    firmware_v1.2.bin

# 8. 종료
sftp> exit
```

#### 예시 2: crane_dl1으로 접속 및 펌웨어 다운로드 (읽기 전용)

```bash
# 1. 접속
$ sftp -P 2222 crane_dl1@sftp.craneeyes.com
crane_dl1@sftp.craneeyes.com's password: dl001

# 2. 사용 가능한 모델 확인 (SS1406, SS1416만 보임)
sftp> ls
SS1406    SS1416

# 3. SS1416 펌웨어 다운로드
sftp> cd SS1416
sftp> get firmware_v2.0.bin
Fetching /firmwares/SS1416/firmware_v2.0.bin to firmware_v2.0.bin
firmware_v2.0.bin                     100%   12MB   4.8MB/s   00:02

# 4. 업로드 시도 (권한 없음)
sftp> put test.bin
Uploading test.bin to /firmwares/SS1416/test.bin
remote open("/firmwares/SS1416/test.bin"): Permission denied

# 5. 종료
sftp> exit
```

#### 예시 3: FileZilla로 전체 모델 폴더 다운로드

1. FileZilla 접속 (crane_admin1)
2. 원격 사이트에서 `/firmwares` 확인
3. 다운로드할 모델 폴더(예: `SS1406`) 우클릭
4. **다운로드** 선택
5. 로컬 경로 선택 후 다운로드 시작

---

## ⚠️ 주의사항

### 권한

- **관리자 계정**: 읽기, 쓰기, 삭제 가능
- **다운로더 계정**: 읽기만 가능 (업로드/삭제 불가)

### 모델 접근 제한

- 각 사용자는 **허용된 모델만** 볼 수 있습니다.
- 허용되지 않은 모델은 디렉토리 목록에 표시되지 않습니다.
- 예: `crane_dl1`은 `SS1406`, `SS1416`만 접근 가능

### 보안

- **비밀번호 공유 금지**: 각 계정은 개인/팀별로 할당됩니다.
- **정기적인 비밀번호 변경** 권장
- 의심스러운 활동 발견 시 즉시 관리자에게 보고

### 파일 관리

- 펌웨어 파일은 **해당 모델 폴더**에만 업로드
- 파일명은 버전 정보 포함 권장 (예: `firmware_v1.2.3.bin`)
- 오래된 펌웨어는 삭제하지 말고 관리자에게 문의

---

## 🔧 문제 해결

### 1. "Connection refused" 오류

**증상**:
```
ssh: connect to host sftp.craneeyes.com port 2222: Connection refused
```

**해결 방법**:
- 포트 번호가 `2222`인지 확인 (`-P 2222`)
- 방화벽에서 2222 포트가 차단되지 않았는지 확인
- IP 주소로 직접 접속: `sftp -P 2222 crane_admin1@54.180.29.96`

### 2. "Permission denied" 오류 (인증 실패)

**증상**:
```
Permission denied, please try again.
```

**해결 방법**:
- 사용자명이 정확한지 확인 (`crane_admin1` 등)
- 비밀번호가 정확한지 확인 (대소문자 구분)
- 계정이 활성화되어 있는지 웹 관리자 페이지에서 확인

### 3. "Permission denied" 오류 (파일 작업)

**증상**:
```
remote open("test.bin"): Permission denied
```

**해결 방법**:
- 다운로더 계정은 읽기 전용입니다.
- 업로드가 필요하면 관리자 계정 사용
- 관리자 계정인데도 오류 발생 시 시스템 관리자에게 문의

### 4. 특정 모델이 보이지 않음

**증상**:
- `ls` 명령 시 일부 모델만 표시됨

**원인**:
- 각 계정은 **할당된 모델만** 접근 가능합니다.

**해결 방법**:
- [사용자 계정 목록](#사용자-계정-목록)에서 계정별 허용 모델 확인
- 다른 모델 접근이 필요하면 관리자에게 권한 요청
- 웹 관리자 페이지에서 사용자 권한 수정 가능

### 5. DNS 해석 실패

**증상**:
```
Could not resolve hostname sftp.craneeyes.com
```

**해결 방법**:
- DNS가 아직 전파되지 않았을 수 있습니다.
- IP 주소로 직접 접속:
  ```bash
  sftp -P 2222 crane_admin1@54.180.29.96
  ```

### 6. Windows에서 sftp 명령이 없음

**증상**:
```
'sftp' is not recognized as an internal or external command
```

**해결 방법**:
1. **Git Bash 설치** (권장):
   - https://git-scm.com/downloads
   - 설치 후 Git Bash에서 sftp 명령 사용
   
2. **OpenSSH 설치**:
   - Windows 10/11: 설정 → 앱 → 선택적 기능 → "OpenSSH 클라이언트" 추가
   
3. **GUI 클라이언트 사용**:
   - FileZilla: https://filezilla-project.org/
   - WinSCP: https://winscp.net/

---

## 📞 지원

### 웹 관리자 페이지

- **URL**: https://firmware.craneeyes.com/admin/sftp-users
- **기능**:
  - SFTP 사용자 목록 확인
  - 사용자 추가/수정/삭제
  - 모델 접근 권한 설정
  - 계정 활성화/비활성화

### 연락처

문제가 지속되거나 추가 지원이 필요한 경우:
- 시스템 관리자에게 문의
- 웹 관리자 페이지에서 티켓 생성

---

## 📚 참고 자료

- [SFTP Wikipedia](https://en.wikipedia.org/wiki/SSH_File_Transfer_Protocol)
- [FileZilla 사용 가이드](https://wiki.filezilla-project.org/Using)
- [WinSCP 문서](https://winscp.net/eng/docs/start)
- [OpenSSH SFTP Manual](https://man.openbsd.org/sftp)

---

**최종 업데이트**: 2025-10-30
**버전**: 1.0.0
