# IDBlock Crosshub 관리자 패널

IDBlock 생태계의 통합 관리 시스템을 위한 React 기반 프론트엔드 애플리케이션입니다.

## 📖 프로젝트 개요

이 프로젝트는 IDBlock 플랫폼의 관리자 패널로, 다음과 같은 주요 기능을 제공합니다:

- **관리자 대시보드**: 사용자, 사이트, 공지사항 등의 전반적인 관리
- **매니저 대시보드**: QR 코드 스캔, 방문자 관리, 리뷰 관리
- **스캔 시스템**: 블록체인 트랜잭션 및 블록 정보 조회

## 🎯 주요 기능

### 1. 관리자 모드 (ADMIN)
- **사용자 관리**: 사용자 승인/거부, 계정 상세 정보 관리
- **사이트 관리**: 등록된 사이트 관리 및 편집
- **공지사항 관리**: 공지사항 작성, 수정, 삭제
- **FAQ 관리**: 자주 묻는 질문 관리
- **관리자 계정 관리**: 관리자 계정 추가/삭제

### 2. 매니저 모드 (MANAGER)
- **QR 코드 스캔**: QR 코드 스캔 기능
- **방문자 관리**: 방문자 정보 조회 및 관리
- **리뷰 관리**: 사이트 리뷰 확인 및 관리

### 3. 스캔 모드 (SCAN)
- **트랜잭션 조회**: 블록체인 트랜잭션 상세 정보
- **블록 정보**: 블록 상세 정보 조회

## 🏗️ 기술 스택

### 프론트엔드 프레임워크
- **React 18**: 메인 UI 라이브러리
- **TypeScript**: 타입 안전성을 위한 언어
- **Vite**: 빌드 도구 및 개발 서버

### 라우팅 및 상태 관리
- **React Router DOM**: 클라이언트 사이드 라우팅
- **TanStack Query (React Query)**: 서버 상태 관리 및 데이터 페칭

### UI/UX
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **Radix UI**: 접근성이 뛰어난 UI 컴포넌트
- **Lucide React**: 아이콘 라이브러리
- **React Colorful**: 색상 선택기

### 에디터 및 폼
- **Lexical**: 리치 텍스트 에디터
- **React Hook Form**: 폼 상태 관리

### 기타 라이브러리
- **Ky**: HTTP 클라이언트
- **html5-qrcode**: QR 코드 스캔 기능
- **react-places-autocomplete**: 구글 지도 장소 자동완성
- **Day.js**: 날짜 처리

## 🚀 시작하기

### 필수 요구사항
- Node.js 20
- pnpm (권장 패키지 매니저)

### 설치 및 실행

1. **의존성 설치**
```bash
pnpm install
```

2. **환경 변수 설정**
`.env` 파일을 생성하고 다음 환경 변수를 설정하세요:
```env
VITE_SCOPE=ADMIN          # ADMIN, MANAGER, SCAN 중 선택
VITE_GOOGLE_MAPS_API_KEY= # 구글 지도 API 키
```

3. **개발 서버 실행**
```bash
pnpm dev
```

4. **빌드**
```bash
pnpm build
```

## 📁 프로젝트 구조

```
src/
├── api/                    # API 통신 관련 파일들
│   ├── auth.api.ts        # 인증 관련 API
│   ├── users.api.ts       # 사용자 관리 API
│   ├── sites.api.ts       # 사이트 관리 API
│   └── ...
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   ├── tables/           # 테이블 컴포넌트들
│   ├── dialogs/          # 모달/다이얼로그 컴포넌트들
│   └── editor/           # 리치 텍스트 에디터
├── pages/                # 페이지 컴포넌트들
│   ├── main/             # 관리자 페이지들
│   ├── manager/          # 매니저 페이지들
│   └── ...
├── queries/              # React Query 관련 파일들
├── hooks/                # 커스텀 훅들
├── lib/                  # 유틸리티 함수들
└── router.tsx            # 라우팅 설정
```

## 🔧 환경별 설정

### VITE_SCOPE 환경 변수

프로젝트는 `VITE_SCOPE` 환경 변수에 따라 다른 모드로 동작합니다:

- **ADMIN**: 관리자 대시보드 (기본)
- **MANAGER**: 매니저 대시보드  
- **SCAN**: 스캔 시스템

### API 엔드포인트

개발 환경에서는 Vite 프록시를 통해 `/api` 요청을 `http://localhost:8989`로 프록시합니다.

## 🎨 UI/UX 특징

- **반응형 디자인**: 다양한 화면 크기에 대응
- **다크/라이트 모드 지원**: 사용자 선호에 맞는 테마
- **접근성**: Radix UI를 통한 웹 접근성 준수
- **모던한 디자인**: Tailwind CSS 기반의 깔끔한 인터페이스

## 📋 주요 테이블 및 관리 기능

### 관리 대상 엔터티
- **Users**: 사용자 계정 관리
- **Sites**: 등록된 사이트 관리
- **Announcements**: 공지사항 관리
- **FAQ**: 자주 묻는 질문 관리
- **News**: 뉴스 관리
- **Coins**: 코인 정보 관리
- **Visitors**: 방문자 정보 관리
- **Visit Reviews**: 방문 리뷰 관리
- **Transactions**: 블록체인 트랜잭션 정보

## 🔐 인증 시스템

- **세션 기반 인증**: 쿠키를 통한 인증 관리
- **권한별 라우팅**: 인증 상태에 따른 페이지 접근 제어
- **자동 로그아웃**: 401 응답 시 자동 로그아웃 처리

## 🛠️ 개발 가이드

### 새로운 페이지 추가
1. `src/pages/` 디렉토리에 새 페이지 컴포넌트 생성
2. `src/router.tsx`에 라우트 추가
3. 필요한 경우 API 함수를 `src/api/`에 추가
4. React Query 쿼리를 `src/queries/`에 추가

### 새로운 테이블 추가
1. `src/components/tables/`에 테이블 컴포넌트 생성
2. `src/components/table-columns/`에 컬럼 정의 추가
3. 관련 API 및 쿼리 함수 추가

### 스타일링 가이드
- Tailwind CSS 클래스 사용
- 컴포넌트별 스타일은 className prop으로 전달
- 공통 스타일은 `src/components/ui/`의 기본 컴포넌트 활용


