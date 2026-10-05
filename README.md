# 🍠 GOGUMA (고구마)

> **도메인 전문가를 위한 토큰 최적화 청사진 및 즉시 구동 프로토타입 빌더**  
> 공식 도메인: [https://goguma.app](https://goguma.app)

고구마(Goguma)는 개발 경험이 없는 현장 실무자가 일상어로 업무 프로세스를 작성하면, AI 코딩 에이전트(Cursor, Claude Code 등) 주입용 표준 사양서 11종과 브라우저에서 즉시 실행되는 단일 파일 인터랙티브 프로토타입(`prototype.html`)을 동시에 산출하는 Local-First 웹 애플리케이션입니다.

---

## 🏛️ 프로젝트 아키텍처 개요
- **프론트엔드 본체**: React (Vite, TypeScript) + Tailwind CSS
- **프로토타입 엔진**: 무빌드 단일 파일 HTML5 + Vanilla JS + Tailwind Play CDN
- **스토리지**: IndexedDB 기반 로컬 영속성 (Zero-Server, 100% 데이터 주권)
- **AI 연동 계층**: 
  1. `Tier 1`: WebLLM (인브라우저 WebGPU, ~300MB 초경량 모델)
  2. `Tier 2`: Ollama (`http://localhost:11434`, 로컬 엔진)
  3. `Tier 3`: Gemini API (BYOK 선택 연동)

---

## 📁 사양서 문서 체계 (`/docs`)
모든 시스템 규약과 명세는 `docs/` 디렉터리에 엄격히 정의되어 있습니다:
- `01_proposal.md`: 제품 비전 및 비즈니스 가치 정의
- `02_roadmap.md`: 도메인 지식의 UI/UX 체계화 로드맵
- `03_DESIGN.md`: 클래식 북 & 웜 도화지 스타일 디자인 헌법
- `04_SPEC.md`: 시스템 상세 기능 및 프로토타입 생성기 사양
- `05_ARCH_CONSTITUTION.md`: 영구 불변 아키텍처 및 패키지 설치 금지 규약
- `06_DATA_SCHEMA.md`: IndexedDB 로컬 스키마 및 타깃 데이터 추출 규약
- `07_SECURITY.md`: 데이터 주권, 사설망 통신 및 샌드박스 보안 규약
- `08_TEST_CHECKLIST.md`: 비전문가 검수용 기능/예외 테스트 체크리스트
- `09_ENV_SETUP.md`: 초보자용 실행 및 문제 해결 가이드
- `10_agent.md`: AI 코딩 에이전트 페르소나 및 행동 지침
- `11_system-instructions.md`: 에이전트 주입용 골든 시스템 프롬프트

---

## 🚀 빠른 시작 (Local Development)
```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행
npm run dev