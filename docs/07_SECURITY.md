# 🛡️ GOGUMA SECURITY CONSTITUTION (07_SECURITY.md)

> **문서 목적**: 사용자의 기획 데이터 주권 보호, 로컬 AI 통신 보안, 무서버(Zero-Server) 아키텍처 및 클라이언트 샌드박스 실행 안전 규약
> **불변 원칙**: "사용자의 비즈니스 아이디어와 데이터는 사용자의 기기 밖으로 단 1바이트도 무단 유출되어서는 안 된다."

---

## 제1조: 데이터 주권 및 제로 서버 규약 (Zero-Server Sovereignty)

1. **원격 중앙 데이터베이스 영구 부재 (No Remote Database)**
* 고구마 앱은 사용자가 작성한 기획 원문, 비즈니스 로직, 데이터 스키마, 파생 사양서(`*.md`)를 수집·저장하는 중앙 백엔드 서버를 일절 운영하지 않는다.
* 모든 데이터는 사용자의 로컬 브라우저 `IndexedDB`에만 저장되며, 브라우저 저장소를 비우거나 사용자가 직접 삭제할 경우 물리적으로 즉시 소멸한다.


2. **원격 추적 및 텔레메트리 차단 (Zero Telemetry)**
* Google Analytics, Mixpanel, Hotjar, Sentry 등 서드파티 사용자 행동 추적 스크립트 및 외부 에러 로깅 도구의 삽입을 영구 금지한다.
* 시스템 동작 로그 및 에러는 브라우저 콘솔(`console.error`)과 인메모리 버퍼에만 제한적으로 기록되며 네트워크 외부로 전송되지 않는다.

---

## 제2조: 로컬 AI 통신 및 사설망 접근 보안 (Local AI & Private Network)

1. **로컬 루프백 한정 통신 (Loopback Isolation)**
* Ollama 로컬 통신은 반드시 로컬 루프백 IP(`[http://127.0.0.1:11434](http://127.0.0.1:11434)` 또는 `http://localhost:11434`)로만 직접 요청한다.
* 로컬 트래픽을 외부 프록시 서버나 클라우드 중계 게이트웨이로 우회시키는 설계를 엄격히 금지한다.


2. **PNA(Private Network Access) 및 CORS 통제**
* 브라우저의 최신 보안 정책에 따라 공용 웹(HTTPS)에서 로컬 사설망(`localhost`)으로의 직접 통신 시 사전 요청(Preflight)이 발생한다.
* 고구마 앱은 사용자가 Ollama 데몬을 안전하게 구동할 수 있도록 명확한 도메인 화이트리스트 명령어를 안내하며, 임의의 와일드카드 오남용을 방지한다:
```bash
# 권장 안전 실행 가이드 (고구마 로컬 웹 도메인만 허용)
OLLAMA_ORIGINS="https://goguma.app,http://localhost:*" ollama serve

```

3. **인-브라우저 WebLLM 메모리 격리**
* WebLLM으로 로드되는 모델 가중치(Weights, ~300MB)는 브라우저 표준 `CacheStorage`에만 저장되며, WebGPU 버퍼 연산은 다른 브라우저 탭이나 외부 스크립트가 훔쳐볼 수 없도록 완전히 프로세스 격리된다.


4. **선택적 클라우드 BYOK 보안 (Bring Your Own Key)**
* 사용자가 Gemini API 등 클라우드 모델을 명시적으로 선택한 경우에만 해당 프로바이더의 공식 엔드포인트로 통신한다.
* 사용자가 입력한 API Key는 `Web Crypto API`를 통해 브라우저 로컬 암호화 저장소에 보관하거나 세션 메모리에만 유지하며, 평문(Plaintext)으로 노출하거나 로그에 남기지 않는다.

---

## 제3조: 프로토타입 실행 샌드박스 규약 (Prototype Sandbox Security)

1. **독립된 `iframe` 격리 실행 (Strict Sandboxing)**
* 자동 생성된 `prototype.html` 코드를 미리보기 창에서 렌더링할 때, 메인 고구마 앱의 DOM과 로컬 스토리지를 침범하지 못하도록 엄격한 샌드박스 속성을 의무화한다:
```html
<iframe
  sandbox="allow-scripts allow-forms"
  srcdoc="<!-- 생성된 프로토타입 코드 -->"
  title="Interactive Prototype"
></iframe>

```

* **`allow-same-origin` 부여 절대 금지**: 프로토타입 코드가 고구마 앱 자체의 `IndexedDB`나 `localStorage`에 무단 접근하여 다른 프로젝트 기획안을 오염시키거나 탈취하는 행위를 원천 차단한다.

2. **외부 리소스 호출 제한 (CDN Whitelist)**
* 프로토타입 내부에서 허용되는 외부 CDN은 공인된 `Tailwind CSS Play CDN` 1종으로 한정하며, 검증되지 않은 외부 스크립트(`.js`)의 임의 주입을 차단한다.

---

## 제4조: 입력 검증 및 프롬프트 인젝션 방어 (Sanitization & Hardening)

1. **클라이언트 측 DOM XSS 살균 (DOMPurify)**
* 마크다운 미리보기 컴포넌트는 사용자의 입력 텍스트나 컴파일된 마크다운을 렌더링할 때 반드시 `DOMPurify`를 거쳐 살균(Sanitize)한 후 React 요소로 변환한다.
* `dangerouslySetInnerHTML`의 직접적인 바인딩을 금지한다.

2. **간접 프롬프트 인젝션(Indirect Prompt Injection) 차단**
* 벤치마크 URL 입력이나 외부 텍스트 붙여넣기 기능 사용 시, 시스템 프롬프트 경계를 무너뜨리는 특수 토큰(`<|im_start|>`, `system:`, `[INST]`, `"""` 등)을 필터링 및 이스케이프 처리하여 로컬/클라우드 LLM의 탈옥(Jailbreak)을 방지한다.

---

## 제5조: 백업 파일 및 산출물 패키지 무결성 (Artifact Integrity)

1. **가져오기(Import) 스키마 무결성 검증**
* 사용자가 외부에서 `.goguma` 또는 JSON 백업 파일을 업로드할 때, 즉시 실행하거나 메모리에 얹지 않고 `Zod` 스키마 유효성 검사기를 통해 데이터 구조를 철저히 검증한다.
* 구조가 손상되었거나 비정상적인 대용량 파일(JSON Bomb) 감지 시 파싱을 중단하고 안전하게 거절한다.

2. **내보내기(Export) 파일 안전성**
* `goguma-blueprint.zip` 패키징 시 오직 텍스트 파일(`.md`, `.html`, `.json`, `.cursorrules`, `.clinerules`)만 압축 대상에 포함하며, 악성 실행 바이너리(`.exe`, `.sh`, `.bat` 등)가 끼어들지 않도록 MIME 타입을 엄격히 필터링한다.

---

## 제6조: 보안 사고 대응 및 취약점 보고 (Responsible Disclosure)

* 고구마는 클라우드 서버가 없는 Local-First 제품이므로, 보안 취약점의 핵심 점검 대상은 **"샌드박스 탈출(Sandbox Escape)"**, **"CORS 정책 우회를 통한 로컬 데이터 접근"**, "XSS를 통한 로컬 스토리지 탈취"이다.
* 취약점 제보 시 원격 패치가 아닌 클라이언트 오픈소스 저장소의 보안 릴리즈 및 서비스 워커(Service Worker) 업데이트를 통해 신속히 배포한다.

---