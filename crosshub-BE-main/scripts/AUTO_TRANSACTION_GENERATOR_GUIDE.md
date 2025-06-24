# 🔄 자동 트랜잭션 생성기 가이드

## 개요

하루에 100~200개의 트랜잭션을 불규칙적인 시간대에 자동으로 생성하는 백그라운드 서비스입니다.

## 📋 특징

- **자동 실행**: 24시간 데몬으로 실행
- **불규칙 분산**: 시간대별 가중치 기반 분산 생성
- **현실적 패턴**: 업무시간(9-18시)에 더 많은 트랜잭션 생성
- **API_SCOPE**: TRANSACTION 환경변수로 제어
- **로깅**: 상세한 실행 로그 파일 생성
- **헬스체크**: 컨테이너 상태 모니터링

## 🛠️ 설치 및 실행

### 1. 환경 설정

`.env` 파일에 필수 환경변수 설정:

```env
# 데이터베이스 연결
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# API 스코프 (필수)
API_SCOPE=TRANSACTION

# 시간대 설정 (선택사항)
TZ=Asia/Seoul
```

### 2. 로컬 실행 (개발용)

```bash
# 스크립트 권한 부여
chmod +x scripts/auto-transaction-generator.ts

# 직접 실행
pnpm run auto-transaction-generator

# 또는 npm/yarn
npm run auto-transaction-generator
yarn auto-transaction-generator
```

### 3. 도커 컨테이너 실행 (권장)

```bash
# 이미지 빌드
docker build -f dockerfile.transaction-generator -t crosshub/transaction-generator:latest .

# 컨테이너 실행
docker run -d \
  --name transaction-generator \
  --restart unless-stopped \
  -e API_SCOPE=TRANSACTION \
  -e DATABASE_URL="postgresql://username:password@host:5432/database" \
  -e TZ=Asia/Seoul \
  -v $(pwd)/logs:/app/logs:rw \
  crosshub/transaction-generator:latest

# 로그 확인
docker logs -f transaction-generator
```

### 4. Docker Compose 실행 (가장 권장)

```bash
# 서비스 시작 (백그라운드)
docker-compose up -d transaction-generator

# 로그 실시간 확인
docker-compose logs -f transaction-generator

# 서비스 중지
docker-compose stop transaction-generator

# 완전 제거
docker-compose down transaction-generator
```

## 📊 생성 패턴

### 시간대별 가중치

- **새벽 (0-5시)**: 가중치 0.2-0.5 (최소 활동)
- **오전 (6-11시)**: 가중치 0.8-3.0 (활동 증가)
- **점심/오후 (12-17시)**: 가중치 2.2-3.5 (최대 활동)
- **저녁 (18-23시)**: 가중치 0.5-1.8 (활동 감소)

### 트랜잭션 특성

- **일반 전송**: 60% (ETH 전송)
- **컨트랙트 호출**: 40% (스마트 컨트랙트 상호작용)
- **에러율**: 1% (실패한 트랜잭션)
- **가스비**: 20-70 Gwei
- **전송량**: 0.001-10 ETH

### 블록 생성 규칙

- **블록당 트랜잭션**: 평균 20개
- **블록 간격**: 1-3분
- **가스 한도**: 3-8M
- **블록 크기**: 20-70KB

## 🔍 모니터링

### 로그 파일 위치

```
logs/transaction-generator-YYYY-MM-DD.log
```

### 로그 예시

```
[2024-12-19T10:30:15.123Z] 🚀 자동 트랜잭션 생성기 시작
[2024-12-19T10:30:15.125Z] 📊 설정: 하루 100-200개 트랜잭션
[2024-12-19T10:30:15.126Z] 🔧 API_SCOPE: TRANSACTION
[2024-12-19T10:30:15.127Z] 📅 오늘 생성 예정: 156개 트랜잭션
[2024-12-19T10:30:15.128Z] ⏰ 시간별 분포: 1,0,0,1,1,2,4,6,8,12,15,18,16,14,12,10,8,6,4,3,2,1,1,0
[2024-12-19T10:30:15.129Z] 🕐 10시: 12개 트랜잭션 생성 시작
[2024-12-19T10:35:42.456Z] ✅ 3개 트랜잭션 생성 완료 (블록: 1개)
[2024-12-19T10:42:18.789Z] ✅ 2개 트랜잭션 생성 완료 (블록: 1개)
```

### 컨테이너 헬스체크

```bash
# 컨테이너 상태 확인
docker ps | grep transaction-generator

# 헬스체크 결과 확인
docker inspect transaction-generator | grep -A 10 Health
```

## ⚙️ 설정 옵션

### 환경변수

| 변수명         | 필수 | 기본값      | 설명                      |
| -------------- | ---- | ----------- | ------------------------- |
| `API_SCOPE`    | ✅   | -           | TRANSACTION으로 설정 필수 |
| `DATABASE_URL` | ✅   | -           | PostgreSQL 연결 문자열    |
| `TZ`           | ❌   | UTC         | 시간대 설정               |
| `NODE_ENV`     | ❌   | development | 실행 환경                 |

### 스크립트 내부 설정

```typescript
// scripts/auto-transaction-generator.ts 상단에서 수정 가능
const MIN_TRANSACTIONS_PER_DAY = 100; // 최소 트랜잭션 수
const MAX_TRANSACTIONS_PER_DAY = 200; // 최대 트랜잭션 수
const TRANSACTIONS_PER_BLOCK = 20; // 블록당 트랜잭션 수
```

## 🚨 문제 해결

### 일반적인 문제

1. **API_SCOPE 오류**

   ```
   ❌ API_SCOPE가 TRANSACTION이 아닙니다. 종료합니다.
   ```

   - 해결: `API_SCOPE=TRANSACTION` 환경변수 설정

2. **데이터베이스 연결 실패**

   ```
   DATABASE_URL is not defined
   ```

   - 해결: `.env` 파일 또는 환경변수에 `DATABASE_URL` 설정

3. **권한 문제**
   ```
   로그 파일 쓰기 실패
   ```
   - 해결: `logs` 디렉토리 권한 확인 또는 볼륨 마운트 설정

### 로그 확인 명령어

```bash
# 실시간 로그 확인
tail -f logs/transaction-generator-$(date +%Y-%m-%d).log

# 오늘의 모든 로그
cat logs/transaction-generator-$(date +%Y-%m-%d).log

# 에러 로그만 확인
grep "❌" logs/transaction-generator-*.log

# 완료된 트랜잭션 수 확인
grep "✅.*트랜잭션 생성 완료" logs/transaction-generator-*.log | wc -l
```

## 📈 성능 및 리소스

### 예상 리소스 사용량

- **CPU**: 1-5% (생성 시점에만 증가)
- **메모리**: 50-100MB
- **디스크**: 일일 로그 약 1-5MB
- **네트워크**: 데이터베이스 연결만 사용

### 데이터베이스 영향

- **일일 삽입**: 100-200개 트랜잭션 + 5-10개 블록
- **테이블 크기 증가**: 약 10-50KB/일
- **인덱스 영향**: 최소 (온충돌 무시 설정)

## 🔄 업데이트 및 재시작

### 코드 업데이트 후 재시작

```bash
# Docker Compose 사용시
docker-compose build transaction-generator
docker-compose up -d transaction-generator

# Docker 직접 사용시
docker stop transaction-generator
docker rm transaction-generator
docker build -f dockerfile.transaction-generator -t crosshub/transaction-generator:latest .
docker run -d --name transaction-generator [환경변수들] crosshub/transaction-generator:latest
```

### 설정 변경 시

환경변수 변경 후 컨테이너 재시작이 필요합니다.

## 📝 주의사항

1. **프로덕션 환경**: 실제 서비스에서 사용 시 데이터베이스 부하 모니터링 필요
2. **중복 실행 방지**: 같은 데이터베이스에 여러 인스턴스 실행 금지
3. **로그 관리**: 오래된 로그 파일 정기적 정리 권장
4. **백업**: 중요한 데이터 생성 전 데이터베이스 백업 권장
5. **모니터링**: 장기 실행 시 메모리 누수 및 오류 로그 정기 확인

## 🛑 중지 방법

### 안전한 중지

```bash
# Docker Compose
docker-compose stop transaction-generator

# Docker 직접
docker stop transaction-generator

# 로컬 실행시
Ctrl+C 또는 프로세스 종료
```

### 완전 제거

```bash
# 컨테이너 및 이미지 제거
docker-compose down --rmi all
docker rmi crosshub/transaction-generator:latest

# 로그 파일 제거
rm -rf logs/transaction-generator-*.log
```
