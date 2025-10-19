# AWS RDS PostgreSQL 최적화 설정

## 1. RDS 파라미터 그룹 설정

### 연결 관련 파라미터
- `tcp_keepalives_idle`: 600 (10분)
- `tcp_keepalives_interval`: 30
- `tcp_keepalives_count`: 3
- `statement_timeout`: 300000 (5분)
- `idle_in_transaction_session_timeout`: 300000 (5분)

### 메모리 및 성능 파라미터
- `shared_buffers`: 인스턴스 메모리의 25%
- `effective_cache_size`: 인스턴스 메모리의 75%
- `work_mem`: 4MB
- `maintenance_work_mem`: 64MB

## 2. 보안 그룹 설정 확인
- 포트 5432가 현재 IP에서 접근 가능한지 확인
- ICMP 프로토콜 허용 (ping 테스트용)

## 3. 연결 풀링 설정
- `max_connections`: 적절한 값으로 설정 (기본값: 100)
- `superuser_reserved_connections`: 3

## 4. 로그 설정 활성화
- `log_statement`: 'all'
- `log_min_duration_statement`: 1000
- `log_connections`: on
- `log_disconnections`: on
