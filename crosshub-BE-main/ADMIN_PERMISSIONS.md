# 관리자 권한별 기능 정리

## 권한 체계

- **1 (루트 관리자)**: 모든 기능에 접근 가능한 최고 권한
- **2 (중간 관리자)**: 일반적인 관리 업무 수행 가능
- **3 (일반 관리자)**: 기본적인 조회 기능 위주

---

## 🔐 관리자 관리 기능 (`/admin-management`)

### 루트 관리자 (권한 1) 전용

- `POST /admin-management/create` - 새 관리자 생성
- `PATCH /admin-management/:id/permission` - 관리자 권한 변경
- `DELETE /admin-management/:id` - 관리자 삭제

### 중간 관리자 이상 (권한 2 이상)

- `GET /admin-management/list` - 관리자 목록 조회

### 모든 관리자

- `GET /admin-management/profile` - 내 프로필 조회

---

## 👥 회원 관리 기능 (`/user`)

### 루트 관리자 (권한 1) 전용

- `DELETE /user/:documentId` - 회원 삭제

### 중간 관리자 이상 (권한 2 이상)

- `POST /user/argos-id-liveness` - Argos ID Liveness 검증
- `POST /user/argos-recognition` - Argos Recognition 수행
- `POST /user/approve` - 회원 승인
- `PATCH /user/reject` - 회원 거부

### 일반 관리자 이상 (권한 3 이상)

- `GET /user` - 회원 목록 조회
- `GET /user/:documentId` - 회원 상세 조회

---

## 🏞️ 관광지 관리 기능 (`/site`)

### 루트 관리자 (권한 1) 전용

- `DELETE /site/:id` - 관광지 삭제

### 중간 관리자 이상 (권한 2 이상)

- `POST /site` - 관광지 생성
- `PUT /site/:id` - 관광지 수정
- `POST /site/thumbnail` - 관광지 썸네일 업로드

### 일반 관리자 이상 (권한 3 이상)

- `GET /site` - 관광지 목록 조회
- `GET /site/:id` - 관광지 상세 조회

---

## 📊 시스템 통계 기능 (`/admin-statistics`)

### 루트 관리자 (권한 1) 전용

- `GET /admin-statistics/dashboard` - 대시보드 통계
- `GET /admin-statistics/user-stats` - 사용자 통계
- `GET /admin-statistics/site-stats` - 관광지 통계
- `GET /admin-statistics/admin-activity` - 관리자 활동 로그

---

## 🔑 인증 기능 (`/admin-auth`)

### 공개 접근

- `POST /admin-auth/login` - 관리자 로그인
- `POST /admin-auth/test-signup` - 테스트용 회원가입

### 인증된 관리자

- `DELETE /admin-auth/logout` - 로그아웃
- `GET /admin-auth/protected` - 보호된 라우트 테스트

---

## 🎯 권한별 주요 역할

### 루트 관리자 (1)

- **시스템 관리**: 다른 관리자 생성/삭제/권한 변경
- **데이터 삭제**: 회원, 관광지 등 중요 데이터 삭제
- **통계 조회**: 전체 시스템 통계 및 분석 데이터 접근
- **최종 승인**: 중요한 의사결정 권한

### 중간 관리자 (2)

- **일상 운영**: 회원 승인/거부, 관광지 생성/수정
- **콘텐츠 관리**: 썸네일 업로드, 관광지 정보 관리
- **검증 작업**: Argos 시스템을 통한 신원 확인
- **운영 지원**: 관리자 목록 조회 등 중간 관리 업무

### 일반 관리자 (3)

- **정보 조회**: 회원, 관광지 목록/상세 정보 조회
- **기본 업무**: 단순 조회 및 확인 업무
- **제한된 권한**: 수정/삭제/승인 등의 중요 작업 불가

---

## 🛡️ 보안 고려사항

1. **권한 상속**: 낮은 숫자가 더 높은 권한을 의미 (1 > 2 > 3)
2. **마지막 루트 관리자 보호**: 시스템에 루트 관리자가 1명뿐일 때 삭제 방지
3. **JWT 토큰 기반 인증**: Bearer 토큰으로 API 접근 제어
4. **권한 체크**: 각 엔드포인트마다 적절한 권한 레벨 요구

---

## 🚀 Swagger 테스트 방법

1. **로그인**: `/admin-auth/login`으로 관리자 로그인
2. **토큰 설정**: 응답받은 `accessToken`을 Bearer 토큰으로 설정
3. **권한 테스트**: 각 권한 레벨에 맞는 API 엔드포인트 테스트
4. **오류 확인**: 권한 부족 시 `403 Forbidden` 응답 확인

각 API는 권한에 따라 접근이 제한되므로, 테스트 시 적절한 권한을 가진 관리자 계정으로 로그인해야 합니다.
