# DID (Decentralized Identity) 시스템

이 모듈은 W3C DID 표준을 따르는 분산신원 시스템을 구현합니다.

## 🎯 주요 기능

- **DID 생성**: Ed25519 키 쌍과 DID Document 생성
- **DID 해결**: DID 식별자로부터 DID Document 조회
- **VC 발행**: Verifiable Credential 발행
- **VC 검증**: Verifiable Credential 유효성 검증
- **데모 워크플로우**: 전체 시스템 동작 예시

## 🏗️ 아키텍처

### DID 형식

```
did:idblock:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
```

- **Method**: `idblock` (자체 DID 메서드)
- **Identifier**: multibase 인코딩된 공개키 해시

### 핵심 컴포넌트

1. **DID Document**: 신원 정보와 검증 방법 포함
2. **Verifiable Credential**: 검증 가능한 자격증명
3. **Cryptographic Proof**: Ed25519 디지털 서명 기반 증명

## 🚀 사용법

### 1. DID 생성

```bash
POST /did/create
Content-Type: application/json

{
  "name": "임요한",
  "email": "user@example.com",
  "serviceEndpoint": "https://example.com/profile"
}
```

**응답:**

```json
{
  "success": true, // API 호출 성공 여부
  "data": {
    // 생성된 DID 식별자 (전 세계적으로 고유한 분산 신원 식별자)
    "did": "did:idblock:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",

    // W3C DID Document 표준을 따르는 신원 정보 문서
    "didDocument": {
      // JSON-LD 컨텍스트: 스키마와 네임스페이스 정의
      "@context": [
        "https://www.w3.org/ns/did/v1", // W3C DID 표준 기본 컨텍스트
        "https://w3id.org/security/suites/ed25519-2020/v1" // Ed25519 서명 스위트 컨텍스트
      ],

      // DID 주체의 식별자 (이 문서가 설명하는 대상의 DID)
      "id": "did:idblock:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",

      // 검증 방법: 디지털 서명 검증에 사용할 공개키 정보
      "verificationMethod": [
        {
          // 이 검증 방법의 고유 식별자 (DID + 프래그먼트)
          "id": "did:idblock:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#key-1",
          // 키 타입 (Ed25519 타원곡선 디지털 서명 키)
          "type": "Ed25519VerificationKey2020",
          // 이 키를 제어하는 주체 (키 소유자)
          "controller": "did:idblock:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
          // multibase 인코딩된 공개키 (실제 서명 검증에 사용)
          "publicKeyMultibase": "z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
        }
      ],

      // 인증: 이 DID 주체임을 인증할 때 사용할 수 있는 검증 방법 (로그인 등)
      "authentication": [
        "did:idblock:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#key-1"
      ],

      // 어설션 방법: 주장/진술에 서명할 때 사용 (Verifiable Credential 발행 시 사용)
      "assertionMethod": [
        "did:idblock:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#key-1"
      ],

      // 능력 호출: DID Document 업데이트 등의 제어 작업에 사용할 수 있는 검증 방법
      "capabilityInvocation": [
        "did:idblock:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#key-1"
      ]
    },

    // ⚠️ 개인키 (Base64 인코딩) - 절대 외부 노출 금지, 클라이언트에서만 안전 보관
    "privateKey": "base64-encoded-private-key"
  }
}
```

### 2. DID 해결

```bash
GET /did/resolve/did:idblock:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
```

**응답:**

```json
{
  // DID Document: 해결된 신원 정보 문서 (위의 DID 생성 응답과 동일한 구조)
  "didDocument": {
    /* DID Document 전체 내용 */
  },

  // DID Document 메타데이터: 문서 자체에 대한 정보
  "didDocumentMetadata": {
    "created": "2024-01-01T00:00:00.000Z", // DID Document 생성 시간
    "updated": "2024-01-01T00:00:00.000Z" // DID Document 마지막 업데이트 시간
  },

  // DID 해결 메타데이터: 해결 과정에 대한 정보
  "didResolutionMetadata": {
    "contentType": "application/did+ld+json" // 응답 데이터 형식 (JSON-LD)
  }
}
```

### 3. Verifiable Credential 발행

```bash
POST /did/credentials/issue
Content-Type: application/json

{
  "issuerDid": "did:idblock:issuer-did",                    // 발행기관의 DID (자격증명을 발행하는 주체)
  "issuerPrivateKey": "base64-encoded-private-key",         // 발행기관의 개인키 (서명용)
  "credentialData": {
    "subjectDid": "did:idblock:subject-did",               // 자격증명 주체의 DID (증명서를 받는 사람)
    "credentialType": "IdentityCredential",                // 자격증명 타입 (신원증명서)
    "credentialSubject": {                                 // 자격증명 내용 (실제 증명할 데이터)
      "id": "did:idblock:subject-did",                     // 주체 식별자
      "name": "김철수",                                     // 이름
      "birthDate": "1990-01-01",                           // 생년월일
      "nationality": "KR",                                 // 국적
      "verified": true                                     // 검증 완료 여부
    }
  }
}
```

**응답:**

```json
{
  "success": true, // API 호출 성공 여부
  "data": {
    "credential": {
      // 발행된 Verifiable Credential
      "@context": ["https://www.w3.org/2018/credentials/v1"], // VC 표준 컨텍스트
      "type": ["VerifiableCredential", "IdentityCredential"], // VC 타입
      "issuer": "did:idblock:issuer-did", // 발행기관 DID
      "issuanceDate": "2024-01-01T00:00:00.000Z", // 발행 날짜
      "expirationDate": "2025-01-01T00:00:00.000Z", // 만료 날짜
      "credentialSubject": {
        /* 자격증명 데이터 */
      }, // 증명 내용
      "proof": {
        // 디지털 서명 증명
        "type": "Ed25519Signature2020", // 서명 타입
        "created": "2024-01-01T00:00:00.000Z", // 서명 생성 시간
        "verificationMethod": "did:idblock:issuer-did#key-1", // 서명 검증 방법
        "proofPurpose": "assertionMethod", // 증명 목적
        "proofValue": "base64-encoded-signature" // 실제 서명 값
      }
    }
  },
  "message": "Verifiable Credential이 성공적으로 발행되었습니다."
}
```

### 4. Verifiable Credential 검증

```bash
POST /did/credentials/verify
Content-Type: application/json

{
  "credential": {                                            // 검증할 Verifiable Credential
    "@context": ["https://www.w3.org/2018/credentials/v1"], // VC 표준 컨텍스트
    "type": ["VerifiableCredential", "IdentityCredential"],  // VC 타입 (기본 + 신원증명)
    "issuer": "did:idblock:issuer-did",                     // 발행기관 DID
    "issuanceDate": "2024-01-01T00:00:00.000Z",             // 발행 날짜
    "credentialSubject": { /* 증명 데이터 */ },              // 자격증명 내용
    "proof": { /* 디지털 서명 */ }                           // 암호학적 증명 (무결성 보장)
  }
}
```

**응답:**

```json
{
  "success": true, // API 호출 성공 여부
  "data": {
    "isValid": true, // 검증 결과 (true: 유효, false: 무효)
    "credential": {
      /* 검증한 VC 전체 내용 */
    }, // 검증 대상 Verifiable Credential
    "verifiedAt": "2024-01-01T00:00:00.000Z" // 검증 수행 시간
  },
  "message": "Verifiable Credential이 유효합니다." // 검증 결과 메시지
}
```

### 5. 전체 워크플로우 데모

```bash
GET /did/demo/example
```

이 엔드포인트는 다음을 실행합니다:

1. 발행기관 DID 생성
2. 사용자 DID 생성
3. 신원인증 VC 발행
4. VC 유효성 검증

## 🔐 보안 고려사항

### 개인키 관리

⚠️ **중요**: 개인키는 안전하게 보관해야 합니다.

- 클라이언트 사이드에서 생성 및 저장 권장
- 서버에서는 절대 개인키 저장 금지
- Hardware Security Module (HSM) 사용 권장

### 암호화 알고리즘

- **키 생성**: Ed25519 (타원곡선 디지털 서명 알고리즘)
- **해싱**: SHA-256
- **인코딩**: Base58 + Multibase

## 🏛️ DID vs 기존 시스템 비교

| 특징            | 전통적인 시스템   | DID 시스템    |
| --------------- | ----------------- | ------------- |
| **신원 제어**   | 중앙기관          | 사용자        |
| **데이터 저장** | 중앙 데이터베이스 | 분산 네트워크 |
| **검증 방식**   | 서버 의존         | 암호학적 증명 |
| **상호 운용성** | 제한적            | W3C 표준      |
| **프라이버시**  | 제한적            | 선택적 공개   |

## 🌐 실제 운영 고려사항

### 분산 저장소 연동

현재는 메모리 저장소를 사용하지만, 실제 운영에서는:

- **IPFS**: DID Document 저장
- **블록체인**: DID 등록 및 상태 관리
- **분산 데이터베이스**: 고성능 조회

### 확장성

- DID 메서드 다양화 (did:web, did:key 등)
- 다양한 VC 타입 지원
- VP (Verifiable Presentation) 구현
- DID 통신 프로토콜 구현

## 📚 참고 자료

- [W3C DID Core Specification](https://www.w3.org/TR/did-core/)
- [W3C Verifiable Credentials Data Model](https://www.w3.org/TR/vc-data-model/)
- [DID Method Registry](https://w3c.github.io/did-spec-registries/#did-methods)
- [Ed25519 Signature Suite](https://w3c-ccg.github.io/lds-ed25519-2020/)

## 📖 주요 용어 설명

### DID 관련 용어

- **DID (Decentralized Identifier)**: 분산 식별자, 중앙기관 없이 전 세계적으로 고유한 식별자
- **DID Document**: DID에 대한 메타데이터를 포함하는 JSON-LD 문서
- **DID Method**: DID 생성, 해결, 업데이트, 비활성화 방법을 정의하는 명세
- **DID Resolution**: DID 식별자로부터 DID Document를 조회하는 과정

### 검증 관련 용어

- **Verification Method**: 디지털 서명 검증에 사용되는 암호학적 재료 (공개키 등)
- **Authentication**: DID 주체임을 인증하는 데 사용할 수 있는 검증 방법
- **Assertion Method**: 주장이나 진술에 서명하는 데 사용할 수 있는 검증 방법
- **Capability Invocation**: 권한 호출에 사용할 수 있는 검증 방법

### VC 관련 용어

- **Verifiable Credential (VC)**: 검증 가능한 자격증명, 디지털 서명으로 무결성이 보장됨
- **Credential Subject**: 자격증명의 주체 (자격증명을 받는 사람/기관)
- **Issuer**: 자격증명을 발행하는 기관
- **Holder**: 자격증명을 소유하고 있는 주체
- **Verifier**: 자격증명을 검증하는 주체
- **Proof**: 자격증명의 진위를 보장하는 디지털 서명

### 암호학 용어

- **Ed25519**: 타원곡선 디지털 서명 알고리즘, 높은 보안성과 성능을 제공
- **Multibase**: 다양한 base 인코딩을 식별할 수 있는 접두사 표준
- **JSON-LD**: JSON 기반의 연결된 데이터 표준

## 🔧 개발 팁

### TypeScript 타입 안정성

모든 DID 관련 데이터는 강타입으로 정의되어 있습니다:

```typescript
import { DidDocument, VerifiableCredential } from './did.types';
```

### 오류 처리

표준화된 DID 해결 오류 코드를 사용합니다:

- `invalidDid`: 잘못된 DID 형식
- `notFound`: DID Document 없음
- `internalError`: 내부 시스템 오류

### 테스트

```bash
# 데모 실행
curl -X GET http://localhost:3000/did/demo/example

# DID 생성 테스트
curl -X POST http://localhost:3000/did/create \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트","email":"test@example.com"}'
```
