import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface Translations {
  [key: string]: {
    en: string;
    ko: string;
    id?: string;
  };
}

export const translations: Translations = {
  // Common
  'save': { en: 'Save', ko: '저장', id: 'Simpan' },
  'saving': { en: 'Saving...', ko: '저장 중...', id: 'Menyimpan...' },
  'load_content': { en: 'Load from URL', ko: 'URL에서 불러오기' },
  'paste_script_url': { en: 'Paste script or HTML URL here...', ko: '스크립트 또는 HTML URL을 여기에 붙여넣으세요...' },
  'fetch_error': { en: 'Failed to fetch content from URL.', ko: 'URL에서 콘텐츠를 가져오지 못했습니다.' },
  'invalid_url': { en: 'Please enter a valid URL.', ko: '유효한 URL을 입력하세요.' },
  'print': { en: 'Print/Preview', ko: '인쇄/미리보기' },
  'back_to_workspace': { en: 'Back to Workspace', ko: '워크스페이스로 돌아가기', id: 'Kembali ke Ruang Kerja' },
  'back_to_admin': { en: 'Go to Admin Panel', ko: '관리자 패널로 이동', id: 'Kembali ke Panel Admin' },
  'terms_of_service': { en: 'Open Source License (MIT)', ko: '오픈소스 라이선스 (MIT)', id: 'Lisensi Open Source' },
  'open_source_license': { en: 'Open Source License (MIT)', ko: '오픈소스 라이선스 (MIT)', id: 'Lisensi Open Source (MIT)' },
  'community_terms': { en: 'Community Guidelines', ko: '커뮤니티 이용 규약', id: 'Pedoman Komunitas' },
  'community': { en: 'Community', ko: '커뮤니티', id: 'Komunitas' },
  'tos_intro': { 
    en: 'GOGUMA is free software distributed under the MIT License. Anyone can freely build, export, and manage system architectures.', 
    ko: 'GOGUMA는 MIT 라이선스로 배포되는 무료 오픈 소프트웨어입니다. 누구나 시스템 아키텍처를 자유롭게 설계하고 기획할 수 있습니다.' 
  },
  'tos_billing_title': { en: 'Zero Fee & Local-First Model', ko: '무과금 및 로컬 우선 정책' },
  'tos_billing_desc': { 
    en: 'GOGUMA requires no subscriptions or hidden charges. All architectural planning data is stored locally in your browser, and AI inference runs autonomously via BYOK or local models.', 
    ko: 'GOGUMA는 정기 구독이나 결제를 요구하지 않습니다. 모든 기획안 데이터는 브라우저 로컬에 안전하게 저장되며, AI 추론은 사용자 고유 API 키(BYOK)나 로컬 모델로 완전 자율 구동됩니다.' 
  },
  'tos_refund_title': { en: 'Data Ownership & Portability', ko: '데이터 소유권 및 자유로운 이전' },
  'tos_refund_desc': { 
    en: 'You retain 100% ownership of all diagrams, sitemaps, and specifications created. Export and backup your work anytime in standard JSON without vendor lock-in.', 
    ko: '생성된 모든 다이어그램, 사이트맵, 기획 명세서의 소유권은 온전히 사용자에게 있습니다. 종속(Lock-in) 없이 언제든 표준 JSON으로 백업 및 내보내기가 가능합니다.' 
  },
  'tos_termination_title': { en: 'Open Source Governance', ko: '오픈소스 거버넌스' },
  'tos_termination_desc': { 
    en: 'Community contributions and extensions are managed transparently under open-source licenses.', 
    ko: '커뮤니티 기여 및 기능 확장은 오픈소스 라이선스 규약에 따라 투명하게 관리됩니다.' 
  },
  'global_policy': { en: 'Global Policy', ko: '개인정보처리방침', id: 'Kebijakan Global' },
  'privacy_policy': { en: 'Global Policy', ko: '개인정보처리방침', id: 'Kebijakan Global' },
  'korean_privacy_policy_content': {
    en: '', // Only relevant for KO
    ko: `### 제1조 (개인정보의 처리 목적 및 항목)
당사는 무료 오픈소스 아키텍처 소프트웨어 제공을 위하여 최소한의 개인정보만을 처리합니다. 고구마(GOGUMA)는 100% 무료 소프트웨어로서, **수입 내역, 정산 기록, 신용카드 번호 등 일체의 결제 및 금융 정보를 수집하거나 처리하지 않습니다.**

| 구분 | 수집 항목 | 수집 및 이용 목적 |
| :--- | :--- | :--- |
| **회원 식별 및 워크스페이스 관리** | (선택) 닉네임, 이메일, 로컬 프로필 | 로컬 식별 및 워크스페이스 환경 설정 |
| **서비스 제공 및 아키텍처 기획** | 사용자가 로컬에서 작성한 프롬프트 및 다이어그램 | 아키텍처 시각화 및 명세서 산출 (브라우저 로컬 저장) |
| **AI 연동 (BYOK / 로컬 모델)** | 사용자가 직접 등록한 개인 API 키 (로컬 브라우저 암호화 보관) | 사용자의 직접 요청에 따른 AI 아키텍트 추론 |

*※ 당사는 유료 멤버십 결제나 정기 구독을 운영하지 않으며, 어떠한 형태의 대금결제 기록, 수입 내역, 카드 및 계좌 정보를 요구하거나 수집하지 않습니다.*

### 제2조 (개인정보의 처리 및 보유 기간)
① 당사는 사용자의 개인정보 및 작업 데이터를 외부 중앙 데이터베이스에 영구 보관하지 않으며, 사용자의 브라우저 로컬 저장소(IndexedDB / LocalStorage)에 보관됩니다.
② 사용자가 브라우저 캐시를 삭제하거나 로컬 데이터 초기화를 수행하는 즉시 모든 데이터는 완전히 파기됩니다.
③ 전자상거래 결제나 상업적 매출 발생이 일체 없으므로, 전자상거래법상의 대금결제·공급 기록 등 상거래 법정 보존 의무 대상 정보는 존재하지 않습니다.

### 제3조 (개인정보의 파기절차 및 파기방법)
① 당사는 처리 목적이 달성되었거나 이용자가 삭제를 요청한 경우 즉시 해당 정보를 파기합니다.
② 로컬 저장소 데이터는 브라우저 내 '데이터 초기화' 또는 브라우저 캐시 삭제 시 복원 불가능한 기술적 방법으로 즉시 삭제됩니다.

### 제4조 (결제 및 금융 정보 비수집 원칙)
당사는 일체의 유료 구독, 결제 대행사(PG사), 수입 정산 모듈을 탑재하지 않습니다. 따라서 결제 위탁 업체(Stripe 등)에 대한 정보 제공이나 금융 거래 기록의 보관은 전혀 발생하지 않습니다.

### 제5조 (개인정보처리의 위탁 및 제3자 제공)
당사는 사용자의 개인정보를 영리 목적으로 제3자에게 판매하거나 제공하지 않습니다. 다만, 이용자가 AI 추론 기능을 활성화할 경우에 한하여 아래와 같이 기술적 연동이 발생할 수 있습니다.
- **Google LLC (Gemini API 이용 시)**: 사용자가 등록한 BYOK(개인 API 키)를 통한 AI 추론 요청 처리 (Google Cloud AI 보안 지침에 따라 모델 학습에 사용되지 않음)
- **로컬 모델 (WebLLM / Ollama 이용 시)**: 외부 서버 전송 없이 사용자 기기 내에서 100% 로컬 처리

### 제6조 (개인정보의 국외 이전)
사용자가 Google Gemini 클라우드 AI 추론을 선택하여 사용하는 경우, 해당 추론 요청에 포함된 프롬프트 데이터는 공용 통신망(TLS 1.3 암호화)을 통해 Google Cloud 글로벌 AI 인프라로 전송될 수 있습니다. (결제 로그나 금융 정보는 전송 대상에 일체 포함되지 않습니다.)

### 제7조 (정보주체와 법정대리인의 권리·의무 및 행사방법)
정보주체는 언제든지 로컬 저장소의 프로젝트 데이터를 표준 JSON으로 백업·다운로드하거나 완전히 삭제할 수 있는 완전한 데이터 주권을 가집니다.

### 제8조 (개인정보의 안전성 확보 조치)
당사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
- **로컬 우선 보안**: 핵심 기획안과 다이어그램은 중앙 서버가 아닌 사용자 디바이스에 격리 보관.
- **전송 구간 암호화**: 외부 AI API 통신 시 TLS 1.3 보안 프로토콜 적용.
- **무결제 안전 설계**: 결제 및 카드 정보 유출 위험의 원천적 차단.

### 제9조 (개인정보 자동 수집 장치의 설치·운영 및 거부)
당사는 이용자에게 최적화된 서비스를 제공하기 위해 필수 기능용 저장소를 사용합니다. 이용자는 브라우저 설정을 통해 쿠키 및 로컬 저장소 저장을 언제든 거부하거나 제어할 수 있습니다.

### 제10조 (개인정보 보호책임자 및 안내)
개인정보 보호에 관한 문의 사항은 아래 전담 채널을 통해 신속하게 답변해 드립니다.
- **소속**: GOGUMA 오픈소스 아키텍처 프로젝트
- **책임자**: 개인정보 보호 담당팀
- **연락처**: master@goguma.app`
  },
  'cookie_banner_desc': { en: 'Do you agree to our use of cookies for a better experience?', ko: '더 나은 서비스 제공을 위한 쿠키 수집에 동의하십니까?', id: 'Apakah Anda menyetujui penggunaan cookie kami untuk pengalaman yang lebih baik?' },
  'accept_all': { en: 'Accept All', ko: '모두 동의', id: 'Terima Semua' },
  'manage_cookies': { en: 'Manage Cookies', ko: '쿠키 설정', id: 'Kelola Cookie' },
  'essential_cookies_title': { en: 'Essential Cookies', ko: '필수 쿠키' },
  'essential_cookies_desc': { en: 'Necessary for the website to function properly. These cannot be switched off.', ko: '웹사이트의 기본적인 기능을 위해 반드시 필요하며 비활성화할 수 없습니다.' },
  'analytics_cookies_title': { en: 'Analytics & Statistics', ko: '분석 및 통계 쿠키' },
  'analytics_cookies_desc': { en: 'Allow us to analyze site usage and improve service quality through tools like Google Analytics.', ko: 'Google Analytics 등을 통해 방문자의 서비스 이용 패턴을 분석하고 개선하는 데 사용됩니다.' },
  'marketing_cookies_title': { en: 'Marketing & Advertising', ko: '광고 및 마케팅 쿠키' },
  'marketing_cookies_desc': { en: 'GOGUMA does not collect or use cookies for third-party tracking advertisements.', ko: 'GOGUMA는 제3자 추적 광고를 위한 쿠키를 수집하거나 사용하지 않습니다.' },
  'not_collected': { en: 'Not Collected', ko: '수집하지 않음' },
  'save_preferences': { en: 'Save Preferences', ko: '설정 저장' },
  'always_on': { en: 'Always On', ko: '항상 활성화' },
  'company_name_en': { en: 'PT. KOREAN CENTER INDONESIA', ko: 'PT. KOREAN CENTER INDONESIA' }, // Keep these for internal refs if needed
  'company_name_ko': { en: '(주)인도네시아 한국센터', ko: '(주)인도네시아 한국센터' },
  'policy_intro': { 
    en: 'This Global Policy (the "Policy") defines how {company} collects, uses, and protects your data across our global services.', 
    ko: '본 글로벌 통합 약관은 {company}가 제공하는 글로벌 서비스 전반에서 귀하의 데이터를 수집, 사용 및 보호하는 방식을 정의합니다.' 
  },
  'payment_stripe_title': { en: 'Zero Payment & Financial Data Guarantee', ko: '결제 및 금융 데이터 비수집 원칙' },
  'payment_stripe_desc': { 
    en: 'GOGUMA is 100% free and open-source architecture software. We do not collect, process, or store credit card numbers, billing records, or revenue/income history.', 
    ko: 'GOGUMA는 100% 무료 오픈소스 소프트웨어입니다. 수입 내역, 정산 기록, 신용카드 번호 등 일체의 결제 및 금융 정보를 요구하거나 보관하지 않습니다.' 
  },
  'policy_google_ai_title': { en: 'Google AI & Data Processing', ko: 'Google AI 및 데이터 처리 방침' },
  'policy_google_ai_sharing_title': { en: 'Third-Party Data Sharing & Delegation', ko: '제3자 데이터 제공 및 위탁' },
  'policy_google_ai_sharing_desc': { 
    en: 'User-provided prompts and data are delegated to our technology partner, Google LLC (Google Cloud AI), for processing and service delivery.', 
    ko: '사용자가 입력한 프롬프트 및 데이터는 서비스 제공을 위해 기술 파트너인 Google LLC(Google Cloud AI)에 위탁/제공됩니다.' 
  },
  'policy_ai_training_title': { en: 'AI Model Training Exclusion', ko: 'AI 학습 배제 명시' },
  'policy_ai_training_desc': { 
    en: 'In accordance with Google Cloud AI terms, user input data and prompts are NOT used for training Google\'s AI models and are securely destroyed after the retention period.', 
    ko: 'Google Cloud API 지침에 따라 사용자의 입력 데이터 및 프롬프트는 Google의 AI 모델 학습에 활용되지 않으며, 규정된 보유 기간 후 안전하게 파기됩니다.' 
  },
  'policy_transfer_title': { en: 'Cross-Border Data Transfer', ko: '데이터 국외 이전' },
  'policy_transfer_desc': { 
    en: 'In compliance with Indonesia (UU PDP) and Korea (Personal Information Protection Act), data is transferred to Google data centers overseas (e.g., USA) for AI processing purposes.', 
    ko: '인도네시아(UU PDP) 및 한국(개인정보보호법) 규정에 따라, 서비스 이용 과정에서 데이터는 AI 처리를 목적으로 미국 등 Google 데이터 센터가 있는 위치로 국외 이전됩니다.' 
  },
  'europe_residents': { en: 'For residents of Europe (GDPR)', ko: '유럽 거주자 대상 (GDPR)' },
  'california_residents': { en: 'For residents of California (CCPA)', ko: '캘리포니아 거주자 대상 (CCPA)' },
  'gdpr_content': {
    en: 'We respect your rights under the General Data Protection Regulation (GDPR)...',
    ko: '당사는 유럽 일반 데이터 보호 규정(GDPR)에 따른 귀하의 권리를 존중하며...'
  },
  'ccpa_content': {
    en: 'California residents have specific rights under the California Consumer Privacy Act (CCPA)...',
    ko: '캘리포니아 거주자는 캘리포니아 소비자 개인정보 보호법(CCPA)에 따라 특정 권리를 가집니다...'
  },
  'cookie_policy': { en: 'Cookie Policy', ko: '쿠키 정책', id: 'Kebijakan Cookie' },
  'sla': { en: 'Service Level Agreement (SLA)', ko: '서비스 수준 합약 (SLA)', id: 'Service Level Agreement (SLA)' },
  'sla_uptime_title': { en: '1. Uptime Commitment', ko: '1. 가동률 보장' },
  'sla_uptime_desc': { 
    en: 'Based on our infrastructure partners (Google Cloud Platform) SLA, GOGUMA guarantees a 99.5% Monthly Uptime Percentage for B2B Enterprise customers.', 
    ko: '인프라 파트너(Google Cloud Platform)의 SLA를 바탕으로, GOGUMA는 B2B 엔터프라이즈 고객에게 월간 가동률 99.5%를 보장합니다.' 
  },
  'sla_exclusions_title': { en: '2. Uptime Exclusions', ko: '2. 가동률 제외 대상' },
  'sla_severity_title': { en: '3. Severity Levels & Response', ko: '3. 장애 등급 및 복구 목표' },
  'sla_credits_title': { en: '4. Service Credits', ko: '4. 서비스 크레딧 및 보상' },
  'sla_request_title': { en: '5. Credit Request Procedure', ko: '5. 크레딧 청구 절차' },
  'sla_request_desc': { 
    en: 'Credits are not automatic. Customers must submit a manual request with log records to the support center by the 14th day of the month following the occurrence. Rights expire after this deadline.', 
    ko: '장애 보상은 자동으로 이루어지지 않습니다. 고객은 반드시 장애가 발생한 달의 익월 14일 이내에 로그 기록을 첨부하여 고객센터로 직접 청구해야 하며, 기한이 지나면 청구권은 소멸됩니다.' 
  },
  'sla_eligibility_title': { en: 'Eligibility & Scope', ko: '적용 대상 및 범위' },
  'sla_eligibility_desc': { 
    en: 'This SLA applies exclusively to B2B Paid Enterprise accounts. Free and Personal tiers are excluded from uptime guarantees and service credits.', 
    ko: '본 SLA는 B2B 유료 엔터프라이즈 계정에만 독점적으로 적용됩니다. 무료(Free) 티어 및 개인용(Personal) 사용자는 가동률 보장 및 서비스 크레딧 대상에서 제외됩니다.' 
  },
  'about_us': { en: 'About GOGUMA', ko: 'GOGUMA 소개', id: 'Tentang GOGUMA' },
  'contact_us': { en: 'Contact Us', ko: '문의하기', id: 'Hubungi Kami' },
  'contact_subtitle': { en: "Got questions? We're here to help you scale your architecture.", ko: "궁금한 점이 있으신가요? 아키텍처 규모를 확장할 수 있도록 도와드리겠습니다." },
  'support_email': { en: 'Support Email', ko: '지원 이메일' },
  'consultation_hours': { en: 'Consultation Hours', ko: '상담 시간', id: 'Jam Konsultasi' },
  'consultation_hours_desc': { en: 'Mon - Fri, 09:00 - 18:00 (KST)', ko: '평일 09:00 - 18:00 (주말 및 공휴일 휴무)', id: 'Senin - Jumat, 09:00 - 18:00 (KST)' },
  'global_hq': { en: 'Global HQ', ko: '글로벌 본사' },
  'tell_us_about': { en: 'Tell us about your project...', ko: '프로젝트에 대해 설명해 주세요...' },
  'privacy_agreement_title': { en: 'Personal Information Collection and Usage Agreement', ko: '개인정보 수집·이용 동의서' },
  'privacy_agreement_purpose': { en: 'Purpose: Responding to customer inquiries and replying with outcomes', ko: '수집 및 이용 목적: 고객 문의 응대 및 처리 결과 회신' },
  'privacy_agreement_items': { en: 'Collected items: Minimum information required to process inquiries, such as name and email', ko: '수집 항목: 이름, 이메일 등 문의 처리에 필요한 최소한의 정보' },
  'privacy_agreement_period': { en: 'Retention period: Destroyed immediately after processing the inquiry is complete', ko: '보유 및 이용 기간: 문의 처리 완료 후 즉시 파기' },
  'privacy_agreement_rejection': { en: 'Right to object: You can decline consent, but doing so may limit your access to customer inquiry services.', ko: '동의 거부 권리: 동의를 거부할 수 있으며, 거부 시 고객문의 서비스 이용이 제한될 수 있습니다.' },
  'privacy_agreement_check_policy': { en: 'Please check the Privacy Policy for detailed terms.', ko: '자세한 내용은 개인정보처리방침을 확인해 주세요.' },
  'privacy_agreement_question': { en: 'Do you agree to the collection and use of personal information above?', ko: '위 개인정보 수집 및 이용에 동의하십니까?' },
  'privacy_agreement_agree': { en: 'Agree', ko: '동의함' },
  'privacy_agreement_disagree': { en: 'Disagree', ko: '동의하지 않음' },
  'customer_service': { en: 'Customer Service', ko: '고객 센터', id: 'Layanan Pelanggan' },
  'company': { en: 'Company', ko: '회사', id: 'Perusahaan' },
  'support': { en: 'Support', ko: '지원', id: 'Dukungan' },
  'send_message': { en: 'Send Message', ko: '메시지 보내기' },
  'name': { en: 'Name', ko: '이름' },
  'message': { en: 'Message', ko: '메시지' },
  'contact_support': { en: 'Contact Support', ko: '고객 지원' },
  'all_rights_reserved': { en: 'All rights reserved.', ko: '모든 권리 보유.', id: 'Seluruh hak cipta.' },
  'product': { en: 'Product', ko: '제품', id: 'Produk' },
  'resources': { en: 'Resources', ko: '리소스', id: 'Sumber Daya' },
  'legal': { en: 'Legal', ko: '법적 고지', id: 'Legal' },
  'social': { en: 'Social', ko: '소셜' },
  'blog': { en: 'Blog', ko: '블로그' },
  'help_center': { en: 'Help Center', ko: '헬프 센터' },
  'goguma_manual': { en: 'GOGUMA Manual', ko: 'GOGUMA 매뉴얼' },
  'features': { en: 'Features', ko: '주요 기능', id: 'Fitur' },
  'pricing': { en: 'Pricing', ko: '가격 정책', id: 'Harga' },
  'logout': { en: 'Logout', ko: '로그아웃', id: 'Keluar' },
  'logout_confirm': { en: 'Are you sure you want to log out?', ko: '로그아웃 하시겠습니까?' },
  'close': { en: 'Close', ko: '닫기', id: 'Tutup' },
  'select': { en: 'Select', ko: '선택', id: 'Pilih' },
  'delete': { en: 'Delete', ko: '삭제', id: 'Hapus' },
  'cancel': { en: 'Cancel', ko: '취소', id: 'Batal' },
  'confirm': { en: 'Confirm', ko: '확인', id: 'Konfirmasi' },
  'error': { en: 'Error', ko: '오류' },
  'success': { en: 'Success', ko: '성공' },
  'search': { en: 'Search...', ko: '검색...' },
  'common_error': { en: 'An error occurred. Please try again later.', ko: '오류가 발생했습니다. 나중에 다시 시도해 주세요.' },
  'not_specified': { en: 'Not Specified', ko: '지정되지 않음' },
  'no_analysis': { en: 'No analysis available', ko: '분석 결과 없음' },

  // Domain Configuration & Strategies
  'domain_strategy_title': { en: 'Domain Strategy & Target URL', ko: '도메인 획득 전략 및 타겟 URL', id: 'Strategi Domain & URL Target' },
  'domain_strategy_subtitle': { en: 'Domain Strategy & Target Base URL', ko: 'Domain Strategy & Target Base URL', id: 'Strategi Domain & URL Target Dasar' },
  'domain_goguma_intelligent': { en: 'GOGUMA Intelligent', ko: 'GOGUMA 지능형', id: 'GOGUMA Cerdas' },
  'domain_option_goguma_temp': { en: '📡 GOGUMA Temporary Subdomain', ko: '📡 고구마 임시 서브도메인', id: '📡 Subdomain Sementara GOGUMA' },
  'domain_7day_lease': { en: '7-Day Free Lease', ko: '7일 무상 대여', id: 'Sewa Gratis 7 Hari' },
  'domain_option_goguma_desc': {
    en: 'If you do not have a custom domain from Gabia yet or wish to do a test deployment, instantly issue and run on a .goguma.app domain with zero complex DNS server setup.',
    ko: '가비아 등 독자 도메인이 아직 없거나 테스트 배포용인 경우, 복잡한 네임서버 설정 없이 즉시 .goguma.app 도메인을 발급해 기동합니다.',
    id: 'Jika Anda belum memiliki domain khusus dari Gabia, dll. atau ingin melakukan uji coba, buat dan jalankan di domain .goguma.app dengan nol pengaturan DNS server yang rumit.'
  },
  'domain_option_own': { en: '🔒 My Own Custom Domain', ko: '🔒 내 소유 독립 도메인', id: '🔒 Domain Independen Saya' },
  'domain_production_use': { en: 'For Live Service', ko: '실 서비스 용', id: 'Untuk Layanan Live' },
  'domain_option_own_desc': {
    en: 'Directly map your premium domain purchased from Gabia, Cloudflare, etc. (e.g. brand.com) directly to Google Cloud Run with zero margin of error.',
    ko: '가비아, Cloudflare 등에서 직접 구매하신 명품 도메인(예: brand.com)을 Google Cloud Run 인프라에 1도 오차없이 직결 구성합니다.',
    id: 'Hubungkan langsung domain premium Anda yang dibeli dari Gabia, Cloudflare, dll. (mis. brand.com) langsung ke Google Cloud Run dengan presisi tinggi.'
  },
  'domain_temp_host_label': { en: 'Register Temporary Host (letters/numbers/hyphens only)', ko: '임시 호스트 등록 (소문자/숫자/하이픈만 지원)', id: 'Daftar Host Sementara (hanya huruf/angka/tanda hubung)' },
  'domain_temp_host_tip': {
    en: '💡 Automatically generated based on the project\'s English slug. Feel free to modify as desired.',
    ko: '💡 프로젝트 영문화 슬러그를 기반으로 자동 생성되었습니다. 원하시는 다른 이름으로 바꿀 수 있습니다.',
    id: '💡 Dibuat otomatis berdasarkan slug bahasa Inggris proyek. Silakan ubah sesuai keinginan.'
  },
  'domain_reset_to_slug': { en: '🔄 Restore default with project name', ko: '🔄 프로젝트명으로 기본값 복원', id: '🔄 Pulihkan default dengan nama proyek' },
  'domain_own_address_label': { en: 'Possessed Production Full Domain Address Name', ko: '보유 중인 프로덕션 전체 도메인 주소명', id: 'Alamat Nama Domain Produksi yang Dimiliki' },
  'domain_own_address_tip': {
    en: '💡 The domain ownership must be verified in your domain provider (Gabia, Whois, etc.) to integrate safely.',
    ko: '💡 도메인 등록 대행처(가비아, 후이즈 등)에서 소유권이 입증된 도메인이어야 안전하게 연동됩니다.',
    id: '💡 Kepemilikan domain harus diverifikasi di penyedia domain Anda (Gabia, Whois, dll.) untuk berintegrasi dengan aman.'
  },
  'domain_protocal_explanation': {
    en: '💡 The https:// protocol is automatically issued and installed for free by the Google Cloud SSL control tower, so please enter only the domain name safely.',
    ko: '💡 https:// 프로토콜은 Google Cloud SSL 관제탑에서 무상 자동 발급 및 탑재하므로 주소명만 안전하게 입력하세요.',
    id: '💡 Protokol https:// dikeluarkan secara otomatis dan diinstal gratis oleh menara kontrol SSL Google Cloud, jadi harap masukkan nama domain saja dengan aman.'
  },
  'domain_final_reserved_target_url': { en: 'Infrastructure Final Reserved Target URL:', ko: '인프라 최종 예약 타겟 URL:', id: 'URL Target Cadangan Akhir Infrastruktur:' },
  'domain_world_connection': { en: 'Connect World', ko: '세상 연결', id: 'Koneksi Dunia' },
  'human_essential': { en: '🔴 Human Essential', ko: '🔴 인간 필수', id: '🔴 Penting bagi Manusia' },
  'domain_embassy_explanation': {
    en: 'Now it is time to attach an official address (domain) to your gate (embassy) in the digital world. The container deployed in Google Cloud Run has a built-in default address ending in .run.app, but to establish brand value and actual traffic, you must bind an independent custom domain purchased from Gabia or GoDaddy.',
    ko: '이제 디지털 세계의 문(대사관)에 정식 주소판(도메인)을 부착할 시간입니다. 구글 Cloud Run에 배포된 컨테이너는 .run.app이라는 기본 주소를 내장하지만, 브랜드 가치 확립과 실제 유입을 위해선 가비아나 GoDaddy에서 구매한 독자 도메인(Custom Domain)을 바인딩해 주어야 합니다.',
    id: 'Kini saatnya memasang alamat resmi (domain) pada gerbang (kedutaan) Anda di dunia digital. Kontainer yang diterapkan di Google Cloud Run memiliki alamat default bawaan yang berakhiran .run.app, tetapi untuk membangun nilai merek dan lalu lintas nyata, Anda harus menautkan domain khusus independen yang dibeli dari Gabia atau GoDaddy.'
  },
  'goguma_sandbox_room': { en: 'GOGUMA Temporary Subdomain Sandbox Room', ko: 'GOGUMA 임시 서브도메인 샌드박스 중계실', id: 'Ruang Sandbox Subdomain Sementara GOGUMA' },
  'goguma_7day_free_profile': { en: '7-Day Free Temporary Profile', ko: '7일 무료 임시 배포 프로파일', id: 'Profil Penyebaran Sementara Gratis 7 Hari' },
  'goguma_reserved_addr_label': { en: 'Reserved Deployment Address:', ko: '배포 예약 주소:', id: 'Alamat Penyebaran yang Dicadangkan:' },
  'goguma_sync_active': { en: '● Proposal Sync Active (Automatic bypass active)', ko: '● 기획서 싱크 활성화 완료 (자동 우회로 가동)', id: '● Sinkronisasi Proposal Aktif (Bypass otomatis aktif)' },
  'goguma_sandbox_expert_guide': {
    en: '💡 Master Architecture Special Guide: You selected the GOGUMA temporary subdomain in the target URL step of the proposal. In this case, you have absolutely no need to touch the complex DNS records of third-party registrars like Gabia or Cloudflare! The GOGUMA architecture directly triggers static virtual proxies across global infrastructure sandboxes, entirely bypassing tedious address board configurations and making you immediately ready to freely communicate with the world.',
    ko: '💡 마스터 아키텍처 특화 가이드: 기획서의 타겟 URL 단계에서 고구마 임시 서브도메인을 선택하셨습니다. 이 경우 가비아, Cloudflare 등 3사 도메인 대행소의 복잡한 네임서버(DNS) 레코드를 일체 건드릴 이유가 없습니다! 고구마 아키텍처가 전 세계 인프라 샌드박스로 정적 가상 프록시를 직결 기동하므로, 번거로운 주소판 작업을 100% 생략하고 즉시 세상과 자유롭게 교신할 준비를 마칩니다.',
    id: '💡 Panduan Khusus Arsitek Master: Anda memilih subdomain sementara GOGUMA pada langkah URL target proposal. Dalam hal ini, Anda sama sekali tidak perlu menyentuh rekaman DNS yang rumit dari registrar pihak ketiga seperti Gabia atau Cloudflare! Arsitektur GOGUMA secara langsung memicu proxy virtual statis di seluruh kotak pasir infrastruktur global, sepenuhnya melewati konfigurasi papan alamat yang membosankan dan membuat Anda segera siap berkomunikasi secara bebas dengan dunia.'
  },
  'goguma_temp_orchestration_step': { en: '🚀 Temporary Host Orchestration Step', ko: '🚀 임시 호스트 오케스트레이션 단계', id: '🚀 Langkah Orkestrasi Host Sementara' },
  'goguma_sandbox_li_1': {
    en: 'Activates a sandbox tenant partition inside the GOGUMA server room to handle full delegated mapping of external SSL certificates.',
    ko: '고구마 서버실 내부에 샌드박스 테넌트 파티션을 활성화하여 외부 SSL 인증서를 전면 위임 매핑합니다.',
    id: 'Mengaktifkan partisi penyewa kotak pasir di dalam ruang server GOGUMA untuk menangani pemetaan delegasi penuh sertifikat SSL eksternal.'
  },
  'goguma_sandbox_li_2': {
    en: 'Guarantees full high-fidelity public access to the address {customDomain} for 7 days starting from container deployment completion.',
    ko: '컨테이너 배포 완료를 기점으로 7일간 {customDomain} 주소로의 퍼블릭 하이파이 접근을 전면 보증합니다.',
    id: 'Menjamin akses publik dengan ketelitian tinggi secara penuh ke alamat {customDomain} selama 7 hari sejak penyelesaian penerapan kontainer.'
  },
  'goguma_sandbox_li_3': {
    en: 'Before the expiry, you can switch to your own custom domain at any time and seamlessly transition to the live production server mapping guide, non-disruptively with a one-stop setup.',
    ko: '기한 만료 전, 독자 도메인 단추로 전환 시 언제든지 원스톱 무중단으로 실서버 매핑 가이드로 교체 가능합니다.',
    id: 'Sebelum kedaluwarsa, Anda dapat beralih ke domain khusus Anda sendiri kapan saja dan beralih ke panduan pemetaan server produksi secara lancar dan tanpa gangguan.'
  },
  'goguma_proxy_sim_label': { en: '💡 Simulates the remote GOGUMA private gateway and Docker proxy mapping.', ko: '💡 원격 고구마 프라이빗 게이트웨이 및 도커 프록시 매핑을 시뮬레이션합니다.', id: '💡 Mensimulasikan gateway privat GOGUMA jarak jauh dan pemetaan proxy Docker.' },
  'goguma_sim_binding': { en: 'Approving Virtual Proxy Binding ({progress}%)', ko: '가상 프록시 바인딩 승인 중 ({progress}%)', id: 'Menyetujui Pengikatan Proxy Virtual ({progress}%)' },
  'goguma_sim_approved': { en: '✔ 7-Day Free Sandbox Connection Approved', ko: '✔ 7일 무료 샌드박스 연결 승인됨', id: '✔ Koneksi Sandbox Gratis 7 Hari Disetujui' },
  'goguma_sim_start_button': { en: '⚡ Verify Virtual Proxy Orchestration', ko: '⚡ 가상 프록시 오케스트레이션 연결 검증', id: '⚡ Verifikasi Orkestrasi Proxy Virtual' },
  'goguma_ops_report': { en: '🛡️ [GOGUMA SSL/TLS Tower Report]:', ko: '🛡️ [GOGUMA SSL/TLS 관제탑 보고]:', id: '🛡️ [Laporan Menara Pengawas GOGUMA SSL/TLS]:' },
  'goguma_assigned_temp_addr': { en: '- Designated Temporary Address:', ko: '- 지정 임시 주소:', id: '- Alamat Sementara yang Ditentukan:' },
  'goguma_allocated_entitlement': { en: '- Allocated Entitlement:', ko: '- 할당 자격:', id: '- Hak yang Dialokasikan:' },
  'goguma_7day_dedicated_sandbox': { en: 'GOGUMA Multi-Tenant 7-day Dedicated Sandbox', ko: '고구마 멀티 테넌트 7일 전용 샌드박스', id: 'GOGUMA Multi-Penyewa Sandbox Khusus 7 Hari' },
  'goguma_sandbox_ready_desc': {
    en: '- Security certificate (wildcard delegated SSL) loaded correctly. Anyone from the outside can now immediately test the connection and collect one-click feedback!',
    ko: '- 보안 인증서(와일드카드 위임 SSL) 탑재 상태 양호. 이제 외부에서 누구나 즉각 접속 테스트하여 원클릭 피드백을 수집할 수 있습니다!',
    id: '- Sertifikat keamanan (delegasi wildcard SSL) dimuat dengan benar. Siapa pun dari luar sekarang dapat segera menguji koneksi dan mengumpulkan umpan balik satu klik!'
  },
  'goguma_sim_log_1': {
    en: '[GOGUMA REVERSE PROXY] Initiating GOGUMA sandbox internal network orchestration...',
    ko: '[GOGUMA REVERSE PROXY] 고구마 샌드박스 내부 망 조율 개시...',
    id: '[GOGUMA REVERSE PROXY] Memulai orkestrasi jaringan internal sandbox GOGUMA...'
  },
  'goguma_sim_log_2': {
    en: '🔍 [GATEWAY CHALLENGE] Checking incoming docker container status for https://{domain}...',
    ko: '🔍 [GATEWAY CHALLENGE] https://{domain} 인입 서브 도커 컨테이너 상태 점검...',
    id: '🔍 [GATEWAY CHALLENGE] Memeriksa status kontainer docker masuk untuk https://{domain}...'
  },
  'goguma_sim_log_3': {
    en: '✔ [ORCHESTRATION SUCCESS] Node running approval for gfs-cluster-{sub} completed!',
    ko: '✔ [ORCHESTRATION SUCCESS] gfs-cluster-{sub} 노드 가동 승인 완료!',
    id: '✔ [ORCHESTRATION SUCCESS] Persetujuan jalannya node untuk gfs-cluster-{sub} selesai!'
  },
  'goguma_sim_log_4': {
    en: '✔ [SSL ON] goguma.app global wildcard certificate binding completed successfully.',
    ko: '✔ [SSL ON] goguma.app 글로벌 와일드카드 인증서 바인딩 정합 완료.',
    id: '✔ [SSL ON] Pengikatan sertifikat wildcard global goguma.app berhasil diselesaikan.'
  },
  'goguma_sim_log_5': {
    en: '🎉 [7-DAY TRIAL GRANTED] Temporary deployment complete! For the next 7 days, a dedicated virtual gateway will be active, allowing full external testing.',
    ko: '🎉 [7-DAY TRIAL GRANTED] 임시 배포 완료! 향후 7일간 전용 가상 게이트웨이가 작동하여 외부 실인입 테스트가 전면 허용됩니다.',
    id: '🎉 [7-DAY TRIAL GRANTED] Penerapan sementara selesai! Selama 7 hari ke depan, gateway virtual khusus akan aktif, memungkinkan pengujian eksternal penuh.'
  },
  'own_sim_log_1': {
    en: '[DNS CHECK] Querying global recursive DNS resolvers (8.8.8.8, 1.1.1.1)...',
    ko: '[DNS CHECK] 전 세계 DNS 재귀 해석기(8.8.8.8, 1.1.1.1) 질의 시작...',
    id: '[DNS CHECK] Menanyakan resolver DNS rekursif global (8.8.8.8, 1.1.1.1)...'
  },
  'own_sim_log_2': {
    en: '🔍 [1.1.1.1 Cloudflare] Attempting look-up for {host}...',
    ko: '🔍 [1.1.1.1 Cloudflare] {host} 조회 시도...',
    id: '🔍 [1.1.1.1 Cloudflare] Mencoba pencarian untuk {host}...'
  },
  'own_sim_log_3': {
    en: '🔍 [8.8.8.8 Google DNS] Record detected: {host} -> {target}!',
    ko: '🔍 [8.8.8.8 Google DNS] {host} -> {target} 레코드 감지 완료!',
    id: '🔍 [8.8.8.8 Google DNS] Data terdeteksi: {host} -> {target}!'
  },
  'own_sim_log_4': {
    en: '🎉 [DNS PROPAGATED] Global DNS record propagation complete! SSL/TLS certificate automatic issuance (HTTPS) approved.',
    ko: '🎉 [DNS PROPAGATED] 전 세계 DNS 레코드 정합성 전파 완료! SSL/TLS 인증서 자동 발급(HTTPs) 승인됨.',
    id: '🎉 [DNS PROPAGATED] Penyebaran rekaman DNS global selesai! Penerbitan otomatis sertifikat SSL/TLS (HTTPS) disetujui.'
  },
  'own_dns_helper_console': { en: 'GOGUMA Domain & DNS Helper Console', ko: 'GOGUMA 도메인 및 DNS 헬퍼 콘솔', id: 'Konsol Helper Domain & DNS GOGUMA' },
  'interactive_guide': { en: 'Interactive Guide', ko: '인터랙티브 가이드', id: 'Panduan Interaktif' },
  'domain_registrar_label': { en: 'Domain Registrar', ko: '도메인 등록 대행사', id: 'Registrar Domain' },
  'registrar_others': { en: 'Other Registrar (Manual Binding)', ko: '기타 대행사 (기타 / 직접연동)', id: 'Registrar Lainnya (Ikatan Manual)' },
  'domain_type_label': { en: 'Domain Type', ko: '도메인 유형', id: 'Tipe Domain' },
  'domain_type_subdomain': { en: 'Subdomain (e.g., www.address)', ko: '서브도메인 (www.주소)', id: 'Subdomain (misal: www.alamat)' },
  'domain_type_apex': { en: 'Apex/Root (no www)', ko: '루트/에이펙스 (www 없음)', id: 'Apex/Root (tanpa www)' },
  'owned_domain_name_label': { en: 'Domain Name You Own', ko: '소유 중인 도메인명', id: 'Nama Domain yang Anda Miliki' },
  'proposal_target_url_label': { en: 'Proposal Target URL:', ko: '기획서 타겟 URL:', id: 'URL Target Proposal:' },
  'unspecified': { en: 'Unspecified', ko: '미지정', id: 'Belum Ditentukan' },
  'sync_status_matched': { en: '● 100% Synced & Correct (Safe)', ko: '● 100% 동기화 정합 상태 (안심)', id: '● 100% Sinkron & Benar (Aman)' },
  'sync_status_mismatched': { en: '▲ Different from target (Custom mapping active)', ko: '▲ 타겟 주소와 상이 (독립 맞춤 튜닝 중)', id: '▲ Berbeda dari target (Pemetaan khusus aktif)' },
  'no_info': { en: 'No Information', ko: '정보 없음', id: 'Tidak ada informasi' },
  'goguma_btn_import_from_proposal': { en: '🔄 Import from Proposal', ko: '🔄 기획서에서 자동 가져오기', id: '🔄 Impor otomatis dari proposal' },
  'goguma_btn_export_to_proposal': { en: '💾 Export back to Proposal', ko: '💾 기획서로 역방향 영구저장', id: '💾 Ekspor kembali ke proposal' },
  'goguma_domain_sync_architecture_guide': {
    en: '💡 Master Architecture Guide: Since the "Target URL" in the proposal phase may contain detailed file paths, and the "Domain Name You Own" must contain pure DNS parameters, merging them can disrupt mapping communication rules in Gabia, Cloudflare, etc. Therefore, maintaining separate fields and using this sync controller to interface them fits safety criteria perfectly.',
    ko: '💡 마스터 아키텍처 가이드: 기획 단계의 "타겟 URL"은 세부 파일 경로를 포함하고, "소유 중인 도메인명"은 순수 DNS 파라미터가 들어가야 하므로 필드를 하나로 합칠 경우 가비아/Cloudflare 등에서 통신 규칙이 손상될 수 있습니다. 따라서 필드를 개별 유지하되, 이 동기화 단추를 사용하여 상호 가공 연동하는 것이 안전 기준에 완벽히 부합합니다.',
    id: '💡 Panduan Arsitek Master: Karena "URL Target" dalam fase proposal mungkin berisi jalur file terperinci, dan "Nama Domain yang Anda Miliki" harus berisi parameter DNS murni, menggabungkannya dapat mengganggu aturan komunikasi pemetaan di Gabia, Cloudflare, dll. Oleh karena itu, mempertahankan bidang terpisah dan menggunakan pengontrol sinkronisasi ini untuk menghubungkannya sangat pas dengan kriteria keselamatan.'
  },
  'goguma_workflow_guide_title': { en: '🚀 GOGUMA Territory Mapping Step-by-Step Guideline (Add-On Instructions)', ko: '🚀 GOGUMA 디테일 영토 매핑 가이드라인 (에드온 지시서)', id: '🚀 Panduan Langkah-demi-langkah Pemetaan Teritori GOGUMA (Instruksi Tambahan)' },
  'goguma_workflow_step_1': { en: 'First, visit the {link}.', ko: '우선 {link}으로 이동합니다.', id: 'Pertama, kunjungi {link}.' },
  'goguma_cloud_run_dashboard': { en: 'Cloud Run Infrastructure Dashboard', ko: 'Cloud Run 인프라 대시보드', id: 'Dashboard Infrastruktur Cloud Run' },
  'goguma_workflow_step_2': {
    en: 'Open the Domain Mappings tab, select <strong>[Add Mapping]</strong>, and enter your domain <code>{domain}</code>.',
    ko: '도메인 매핑 설정 탭을 열고, <strong>[도메인 추가]</strong>를 선택한 뒤 소유하신 도메인 <code>{domain}</code>을 기입합니다.',
    id: 'Buka tab Pemetaan Domain, pilih <strong>[Tambah Pemetaan]</strong>, dan masukkan domain Anda <code>{domain}</code>.'
  },
  'goguma_workflow_step_3': {
    en: 'Once Google Cloud verifies your ownership, log in to your DNS management or Nameserver configuration page at provider <strong>{provider}</strong> and create the high-priority DNS records specified in the table below.',
    ko: '구글 클라우드가 소유권을 최종 확인해 주면, 대행사 <strong>{provider}</strong>의 DNS 관리 혹은 네임서버 설정 페이지에 접속하여 하단의 표에 적시된 DNS 레코드를 1급 바인딩하십시오.',
    id: 'Setelah Google Cloud memverifikasi kepemilikan Anda, masuk ke halaman manajemen DNS atau konfigurasi Nameserver di penyedia <strong>{provider}</strong> dan buat rekaman DNS prioritas tinggi yang ditentukan dalam tabel di bawah ini.'
  },
  'cloudflare_warning_title': { en: '🛡️ Cloudflare Notice! Orange Cloud vs Grey Cloud Warning', ko: '🛡️ Cloudflare 특전! 오렌지 프록시 주의 안내전 (Orange Cloud vs Grey Cloud)', id: '🛡️ Pemberitahuan Cloudflare! Peringatan Awan Oranye vs Awan Abu-abu' },
  'cloudflare_warning_desc1': {
    en: 'When using Cloudflare, if the default setting of <strong>Proxied (Orange Cloud)</strong> is enabled, it may interfere with Google Cloud confirming domain ownership or issuing the initial SSL/TLS certificate (Let\'s Encrypt) due to handshake issues.',
    ko: 'Cloudflare를 이용할 때, 기본 설정인 <strong>Proxied (Proxy 상태 활성화 / 오렌지 구름)</strong>가 켜져 있으면 구글 클라우드가 도메인 소유권을 확인하거나 최초 SSL/TLS 1등급 보안 인증서(LetsEncrypt)를 발행할 때 핸드셰이크 방해가 일어날 수 있습니다.',
    id: 'Saat menggunakan Cloudflare, jika pengaturan default <strong>Proxied (Awan Oranye)</strong> diaktifkan, hal itu dapat mengganggu verifikasi kepemilikan domain oleh Google Cloud atau penerbitan sertifikat SSL/TLS awal (Let\'s Encrypt) karena masalah handshake.'
  },
  'cloudflare_warning_desc2': {
    en: '💡 Therefore, during the initial setup and DNS propagation phase, make sure to set the Proxy Status to "DNS Only (Grey Cloud)"! You can safely turn on the Proxy after the certificate has been successfully generated and mapped.',
    ko: '💡 따라서, 최초 셋업 및 도메인 전파 단계에서는 Proxy Status를 반드시 "DNS Only (회색 구름)" 상태로 지정해 주신 것인지 확인하십시오! 인증서 발행과 맵핑이 완벽히 끝난 뒤 프록시를 켜셔도 무방합니다.',
    id: '💡 Oleh karena itu, selama penyiapan awal dan fase penyebaran DNS, pastikan untuk menyetel Status Proxy ke "DNS Only (Awan Abu-abu)"! Anda dapat dengan aman mengaktifkan Proxy setelah sertifikat berhasil dibuat dan dipetakan.'
  },
  'other_registrars_title': { en: '💬 Using a registrar not in this list? (Don\'t panic! It\'s perfectly fine!)', ko: '💬 대행사 리스트에 없는 대행사를 활용 중이신가요? (당황하지 않으셔도 좋습니다!)', id: '💬 Menggunakan registrar yang tidak ada dalam daftar ini? (Jangan khawatir! Semuanya baik-baik saja!)' },
  'other_registrars_desc1': {
    en: 'No matter which domain registrar in the world (e.g., AWS Route 53, Hostinger, Namecheap) you are using, they all comply with the exact same <strong>RFC standard DNS protocol regulations</strong>.',
    ko: '전 세계 어떤 도메인 등록처(예: AWS Route 53, 호스팅어, 닷네임코리아, 네임칩, 메일루 등)를 사용 중이시더라도 완전히 동일한 <strong>RFC 표준 DNS 통신 기술 규정</strong>을 준수합니다.',
    id: 'Tidak peduli registrar domain mana pun di dunia (mis. AWS Route 53, Hostinger, Namecheap) yang Anda gunakan, semuanya mematuhi <strong>peraturan protokol DNS standar RFC</strong> yang persis sama.'
  },
  'other_registrars_desc2': {
    en: 'It makes absolutely no difference if your registrar\'s name isn\'t listed. Simply access your registrar\'s user portal, enter the <strong>[Manage DNS Records]</strong>, <strong>[DNS Management]</strong>, or <strong>[Advanced DNS Settings]</strong> menu, and fill in the exact records shown in the table below for a seamless 100% global integration.',
    ko: '목록에 명칭이 없더라도 아무런 지장이 없으며, 등록소의 마이페이지에서 <strong>[네임서버 레코드 관리]</strong>, <strong>[DNS 관리]</strong> 또는 <strong>[고급 DNS 설정]</strong> 메뉴를 들어가신 뒤 아래 표의 데이터를 똑같이 기입해 주시면 우주 어디서나 100% 안심하고 완벽 조율됩니다.',
    id: 'Sama sekali tidak ada perbedaan jika nama registrar Anda tidak terdaftar. Cukup akses portal pengguna registrar Anda, masuk ke menu <strong>[Kelola Rekaman DNS]</strong>, <strong>[Manajemen DNS]</strong>, atau <strong>[Pengaturan DNS Lanjutan]</strong>, dan isi rekaman persis seperti yang ditunjukkan dalam tabel di bawah ini untuk integrasi global 100% yang mulus.'
  },
  'hostinger_info_title': {
    en: '🚀 Hostinger Integration Guide! (hPanel Setup Guide)',
    ko: '🚀 호스팅어(Hostinger) 연동 특전! (hPanel 간편 DNS 셋팅)',
    id: '🚀 Panduan Integrasi Hostinger! (Panduan Atur hPanel)'
  },
  'hostinger_info_desc1': {
    en: 'When configuring custom domains in <strong>Hostinger hPanel</strong>, go to the <strong>Domains</strong> division, choose your target domain, and access the <strong>DNS / Nameservers</strong> menu.',
    ko: '<strong>호스팅어 hPanel</strong>에서 도메인을 조율할 경우, hPanel의 <strong>도메인(Domains) 목록</strong>으로 이동하여 해당 도메인을 누르고 <strong>DNS / 네임서버</strong> 메뉴로 접근해 주십시오.',
    id: 'Saat mengatur domain kustom di <strong>Hostinger hPanel</strong>, buka tab <strong>Domain</strong>, pilih domain Anda, lalu akses menu <strong>DNS / Nameserver</strong>.'
  },
  'hostinger_info_desc2': {
    en: '💡 <strong>Hostinger DNS Rules</strong>: Enter the exact DNS records from the table below. If adding a CNAME for www, ensure there are no duplicate CNAME or A records targeting the "www" host to avoid record collision!',
    ko: '💡 <strong>호스팅어 DNS 필수 조율</strong>: 하단 레코드 표의 항목을 동일하게 수동 기입해 주십시오. www용 CNAME 레코드를 추가하기 전에 "www" 호스트에 할당된 중복 A 레코드나 기존 CNAME 레코드가 있을 경우 충돌 방지를 위해 먼저 삭제 후 기입하셔야 합니다.',
    id: '💡 <strong>Peraturan DNS Hostinger</strong>: Masukkan rekaman DNS yang tepat dari tabel di bawah ini. Sebelum menambahkan CNAME untuk www, pastikan tidak ada rekaman CNAME atau A duplikat pada host "www" untuk mencegah bentrokan!'
  },
  'dns_table_title': { en: 'Registrar: {provider} DNS Configuration Records Information', ko: '등록 대행사: {provider} DNS 설정 레코드 정보', id: 'Registrar: {provider} Informasi Rekaman Konfigurasi DNS' },
  'goguma_processing_required': { en: '🚨 Action Required', ko: '🚨 가공 필수', id: '🚨 Tindakan Diperlukan' },
  'dns_table_col_type': { en: 'Record Type', ko: '레코드 타입', id: 'Tipe Rekaman' },
  'dns_table_col_host': { en: 'Host (Host / Name)', ko: '호스트 (Host / Name)', id: 'Host (Host / Name)' },
  'dns_table_col_value': { en: 'Value (Value / Points To)', ko: '값 (Value / Points To)', id: 'Nilai (Value / Points To)' },
  'generally_empty': { en: '@ (usually empty)', ko: '@ (대체로 공란)', id: '@ (biasanya kosong)' },
  'or_empty': { en: '@ (or empty)', ko: '@ (또는 공란)', id: '@ (atau kosong)' },
  'propagation_time_notice': { en: '💡 It may take from 10 minutes to several hours for records to propagate globally after registration.', ko: '💡 DNS 네임서버 등록 후 전 세계 전파 완료까지 10분 ~ 수 시간이 소요될 수 있습니다.', id: '💡 Mungkin diperlukan waktu 10 menit hingga beberapa jam agar rekaman menyebar secara global setelah pendaftaran.' },
  'propagation_checking': { en: 'Checking Live DNS Propagation ({progress}%)', ko: 'DNS 실시간 전파 확인 중 ({progress}%)', id: 'Memeriksa Penyebaran DNS Live ({progress}%)' },
  'propagation_complete_btn': { en: '✔ DNS Propagation & Coupling Verified', ko: '✔ DNS 전파 및 연동 검증 완료', id: '✔ Penyebaran & Penyambungan DNS Terverifikasi' },
  'propagation_start_btn': { en: '📡 Simulate DNS Propagation Verification', ko: '📡 DNS 전파 상태 정합성 모의 검증', id: '📡 Simulasikan Verifikasi Penyebaran DNS' },
  'designated_domain_label': { en: 'Designated Domain:', ko: '지정 도메인:', id: 'Domain yang Ditentukan:' },
  'target_infrastructure_label': { en: 'Target Infrastructure:', ko: '대상 인프라:', id: 'Infrastruktur Target:' },
  'ssl_issuance_success_desc': { en: 'Google Cloud Run Container (SSL Class-1 certificate issued successfully)', ko: 'Google Cloud Run 컨테이너 (SSL 1등급 자격증 발급 성공)', id: 'Google Cloud Run Container (Sertifikat SSL Kelas-1 berhasil diterbitkan)' },
  'propagation_success_desc': { en: 'Global DNS distributed cache integrity matched 100% successfully! External access has been activated immediately.', ko: '전 세계 DNS 분산 캐시 정합성이 100% 매칭 완료되어 즉시 외부 접근이 활성화되었습니다!', id: 'Integritas cache terdistribusi DNS global 100% cocok! Akses eksternal segera diaktifkan.' },

  // Landing Page
  'select_region': { en: 'Region', ko: '지역', id: 'Wilayah' },
  'select_language': { en: 'Language', ko: '언어', id: 'Bahasa' },
  'select_currency': { en: 'Currency', ko: '통화', id: 'Mata Uang' },
  'welcome_back': { en: 'Welcome to GOGUMA FIELD', ko: 'GOGUMA FIELD에 오신 것을 환영합니다', id: 'Selamat Datang di GOGUMA FIELD' },
  'signup_welcome_desc': { 
    en: 'Welcome to GOGUMA Architect! Start your journey where your ideas bloom continuously into fully-fledged applications with absolute ease.', 
    ko: 'GOGUMA 아키텍트에 오신 것을 환영합니다! 당신의 상상이 고구마 줄기처럼 끊임없이 이어져 완벽한 앱으로 실현되는 놀라운 여정을 시작해보세요.', 
    id: 'Selamat datang di GOGUMA Architect! Mulailah perjalanan Anda di mana ide-ide Anda terwujud dengan mudah menjadi aplikasi yang fungsional.' 
  },
  'signup_mode_personal': { en: 'Personal', ko: '개인용', id: 'Personal' },
  'signup_mode_enterprise': { en: 'Enterprise', ko: '내부용', id: 'Enterprise' },
  'signup_mode_commercial': { en: 'Commercial', ko: '상업용 SaaS', id: 'Commercial' },
  'personal_mode_desc': { 
    en: 'This mode is for developing personal web/apps. Other than for testing purposes, you must not accept registrations or use the developed web/app commercially.', 
    ko: '개인용 웹/앱을 개발하기 위한 모드입니다. 또한 핵심 기능 구현 테스트를 위한 최소사양모델 개발로도 활용할 수 있습니다.',
    id: 'Mode ini adalah untuk mengembangkan web/aplikasi pribadi. Selain untuk tujuan pengujian, Anda tidak boleh menerima pendaftaran atau menggunakan web/aplikasi yang dikembangkan secara komersial.'
  },
  'enterprise_mode_desc': {
    en: 'Select when developing internal web/apps for companies/organizations. All regulations follow internal organization policies.',
    ko: '기업/단체 등의 내부용 웹/앱을 개발할 때 선택합니다. 모든 규정은 기업/단체 내부 규정을 따릅니다.',
    id: 'Pilih saat mengembangkan web/aplikasi internal untuk perusahaan/organisasi. Semua peraturan mengikuti kebijakan internal organisasi.'
  },
  'commercial_mode_desc': {
    en: 'Select when building commercial SaaS. GOGUMA supports you in meeting the legal regulations of your service country.',
    ko: '상업용 SaaS를 구축할 때 선택합니다. 서비스 국가의 법적 규정을 충족할 수 있도록 GOGUMA가 함께 지원합니다.',
    id: 'Pilih saat membangun SaaS komersial. GOGUMA mendukung Anda dalam memenuhi peraturan hukum negara layanan Anda.'
  },
  'tos_enterprise_title': { en: 'Consent to Collection and Use of Personal Information for Internal System Use', ko: '사내 시스템 이용을 위한 개인정보 수집·이용 동의' },
  'tos_enterprise_purpose': { en: 'Granting permission to use internal systems, user identification, account governance management by department/company, and business contact', ko: '수집 및 이용 목적: 사내 시스템 이용 권한 부여, 사용자 식별, 부서/회사별 계정 거버넌스 관리 및 업무 연락' },
  'tos_enterprise_items': { en: 'Company name, Name, Email', ko: '수집 항목: 회사명, 이름, 이메일' },
  'tos_enterprise_period': { en: 'Until deletion of internal system account or resignation', ko: '보유 및 이용 기간: 사내 시스템 계정 삭제 시 또는 퇴사 시까지' },
  'tos_enterprise_refusal': { en: 'You have the right to refuse consent. However, if you do not agree, account issuance and service use will be restricted.', ko: '동의 거부 권리 안내: 귀하는 본 개인정보 수집 및 이용 동의를 거부할 권리가 있습니다. 다만, 동의하지 않으실 경우 사내 시스템 계정 발급 및 서비스 이용이 제한됩니다' },
  'tos_commercial_title': { en: 'Consent to Collection and Use of Personal Information for Service Use', ko: '서비스 이용을 위한 개인정보 수집·이용 동의' },
  'tos_commercial_purpose': { en: 'User identification, provision of architecture workspace and configuration management', ko: '수집 및 이용 목적: 사용자 식별, 오픈 아키텍처 워크스페이스 제공 및 환경 설정 관리' },
  'tos_commercial_items': { en: 'Company name, Name, Email', ko: '수집 항목: 회사명, 이름, 이메일' },
  'tos_commercial_period': { en: 'Until account deletion or local data reset', ko: '보유 및 이용 기간: 회원 탈퇴 또는 로컬 데이터 초기화 시까지' },
  'tos_commercial_refusal': { en: 'You have the right to refuse consent. However, if you refuse, registration and service use will be impossible.', ko: '동의 거부 권리 안내: 귀하는 본 개인정보 수집 및 이용 동의를 거부할 권리가 있습니다. 다만, 동의를 거부하실 경우 회원가입 및 서비스 이용이 불가능합니다.' },
  'agree_to_terms': { en: 'I agree to the terms', ko: '동의함', id: 'Saya setuju' },
  'signup_footer_global': { en: 'By signing up, you agree to GOGUMA’s Terms and Privacy Policy.', ko: '가입하시면 GOGUMA의 서비스 약관 및 개인정보처리방침에 동의하게 됩니다.', id: 'Dengan mendaftar, Anda menyetujui Ketentuan dan Kebijakan Privasi GOGUMA.' },
  'company_name_label': { en: 'Company Name', ko: '회사명', id: 'Nama Perusahaan' },
  'user_name_label': { en: 'Name', ko: '이름', id: 'Nama' },
  'get_started': { en: 'Get Started', ko: '시작하기', id: 'Mulai' },
  'reset_password': { en: 'Reset Password', ko: '비밀번호 재설정' },
  'login_desc': { en: 'Access your account to planning.', ko: '기획을 위해 계정에 로그인하세요.' },
  'signup_desc': { en: 'Create a new account and start planning like a pro.', ko: '새 계정을 만들고 전문가처럼 기획을 시작하세요.' },
  'forgot_password_desc': { en: "Forgot your password? We'll send a reset link to your email.", ko: '비밀번호를 잊으셨나요? 이메일로 재설정 링크를 보내드립니다.' },
  'email': { en: 'Email', ko: '이메일' },
  'password': { en: 'Password', ko: '비밀번호' },
  'forgot_password_link': { en: 'Forgot Password?', ko: '비밀번호 찾기' },
  'sign_in': { en: 'Sign In', ko: '로그인', id: 'Masuk' },
  'sign_up': { en: 'Sign Up', ko: '회원가입', id: 'Daftar' },
  'sign_in_with_google': { en: 'Sign in with Google', ko: 'Google로 로그인' },
  'or': { en: 'or', ko: '또는' },
  'remember_me': { en: 'Remember Me', ko: '로그인 유지' },
  'send_reset_link': { en: 'Send Reset Link', ko: '재설정 링크 전송' },
  'dont_have_account': { en: "Don't have an account?", ko: '계정이 없으신가요?' },
  'already_have_account': { en: "Already have an account?", ko: '이미 계정이 있으신가요?' },
  'remember_password': { en: "Remembered your password?", ko: '비밀번호가 생각나셨나요?' },
  'captcha_desc': { en: 'Calculate to prevent automated signups:', ko: '자동 가입 방지를 위해 계산하세요:' },
  'enter_result': { en: 'Enter result', ko: '결과 입력' },
  'password_reset_success': { en: 'Password reset email has been sent. Please check your inbox.', ko: '비밀번호 재설정 이메일이 전송되었습니다. 편지함을 확인해 주세요.' },
  'plan_beyond_limits': { en: 'PLAN BEYOND LIMITS.', ko: '한계를 넘어서는 기획.' },
  'landing_hero_desc': { 
    en: "<b>We invite you from 'Seam Life'—where you had to force your life into ready-made apps—to 'Seamless Life.'</b><br/><br/>In the era of AI, you are the director of your own world. Don’t adapt to the app. Make the app adapt to you. Optimized for the Google AI Ecosystem, GOGUMA turns your unique vibe into a fully functional web and app with minimal clicks and settings—just like pulling a single vine and watching a whole bunch of sweet potatoes (GOGUMA) roll out.", 
    ko: "<b>기성 앱에 당신의 삶을 맞추던 \"Seam Life\"에서 \"Seamless Life\"로 초대합니다.</b><br/><br/>이제 AI 시대, 내가 원하는 세상은 내가 직접 디렉팅합니다. 나를 앱에 맞추지 말고, 앱을 나에게 맞추세요. Google AI 생태계에 최적화된 GOGUMA가 줄기를 당기면 딸려 오는 고구마 넝쿨처럼, 당신의 바이브를 최소한의 클릭과 세팅으로 웹과 앱으로 구현해 드립니다.",
    id: "<b>Kami mengundang Anda dari 'Seam Life'—di mana Anda harus memaksakan hidup Anda ke dalam aplikasi siap pakai—ke 'Seamless Life.'</b><br/><br/>Kini di era AI, Andalah yang menyutradarai dunia yang Anda inginkan. Jangan sesuaikan diri Anda dengan aplikasi, melainkan sesuaikan aplikasi dengan Anda. Dioptimalkan untuk Ekosistem Google AI, GOGUMA mewujudkan vibe Anda ke dalam web dan aplikasi dengan klik dan pengaturan minimal—seperti menarik satu sulur dan melihat seluruh jajaran ubi jalar (GOGUMA) ikut tertarik."
  },
  'powered_by': { en: 'Powered by', ko: '기술 지원' },
  'architecture': { en: 'Architecture', ko: '아키텍처' },
  'email_address': { en: 'Email Address', ko: '이메일 주소' },
  'robot_prevention': { en: 'Robot Prevention', ko: '로봇 방지' },
  'create_account': { en: 'Create Account', ko: '계정 생성' },
  'robot_check_failed': { en: 'Robot check failed. The calculation is incorrect.', ko: '로봇 확인 실패. 계산이 틀렸습니다.' },
  'bot_speed_rejected': { en: 'Submission too fast. Please review the form before submitting.', ko: '제출이 너무 빠릅니다. 폼을 검토 후 다시 제출해 주세요.' },
  'suspicious_activity': { en: 'suspicious activity detected', ko: '의심스러운 활동 감지됨' },

  // GOGUMA Guide
  'what_is_goguma': { en: 'What is GOGUMA?', ko: 'GOGUMA는 무엇인가요?' },
  'what_is_goguma_desc': { 
    en: "An intelligent web architect that transforms your intuition (Vibe) into a high-fidelity software design document (SDD).", 
    ko: "사용자의 직관(Vibe)을 고밀도 소프트웨어 설계도(SDD)로 전환하는 '지능형 웹 아키텍트'입니다." 
  },
  'why_goguma': { en: 'Why GOGUMA?', ko: '왜 GOGUMA인가요?' },
  'why_goguma_desc': { 
    en: "Bridges the gap between planners and developers with structural data, preventing design omissions and syncing with STITCH.", 
    ko: "기획자와 개발자 사이의 간극을 구조적 데이터로 메워 설계 누락을 방지하고 STITCH 엔진과 즉시 연동됩니다." 
  },
  'security_compliance_title': { en: 'Security & Compliance', ko: '보안 및 규정 준수', id: 'Keamanan & Kepatuhan' },
  'security_stripe_title': { en: 'Zero Financial Data', ko: '금융 데이터 제로화', id: 'Bebas Data Keuangan' },
  'security_stripe_desc': { 
    en: 'GOGUMA is 100% free software. We never collect or store credit cards, bank details, or payment records.', 
    ko: 'GOGUMA는 100% 무료 소프트웨어로 신용카드, 계좌번호, 결제 내역을 일체 수집하거나 보관하지 않습니다.', 
    id: 'GOGUMA 100% gratis dan tidak memproses data pembayaran atau kartu kredit.' 
  },
  'security_gdpr_title': { en: 'GDPR / CCPA Ready', ko: 'GDPR / CCPA Ready', id: 'Siap GDPR / CCPA' },
  'security_gdpr_desc': { 
    en: 'We proactively follow privacy guidelines to protect the rights of global users.', 
    ko: '글로벌 유저의 권리 보호를 위해 프라이버시 가이드라인을 능동적으로 준수합니다.', 
    id: 'Kami secara aktif mematuhi panduan privasi untuk melindungi hak-hak pengguna global.' 
  },
  'security_google_title': { en: 'Google Cloud AI', ko: 'Google Cloud AI', id: 'Google Cloud AI' },
  'security_google_desc': { 
    en: "All AI pipelines in GOGUMA follow Google Cloud's strict AI safety guidelines.", 
    ko: '고구마의 모든 AI 파이프라인은 Google Cloud의 엄격한 AI 안전 지침을 따릅니다.', 
    id: 'Semua pipa AI GOGUMA mengikuti pedoman keamanan AI yang ketat dari Google Cloud.' 
  },
  'operational_principle': { en: 'Operational Principle : Vibe to SDD', ko: '운영 원칙 : Vibe to SDD' },
  'goguma_mcp_note': { 
    en: "* SDDs generated in GOGUMA are injected directly into the build environment via the STITCH MCP server.", 
    ko: "* GOGUMA에서 생성된 SDD는 STITCH MCP 서버를 통해 빌드 환경에 즉시 주입됩니다." 
  },
  'quick_start_guide': { en: 'Quick Start Guide', ko: '퀵 스타트 가이드' },
  'qs_step_01_title': { en: 'Vision Set', ko: '비전 설정' },
  'qs_step_01_desc': { en: 'Set project name, core mission, and target.', ko: '프로젝트 이름과 핵심 목적, 타겟을 설정합니다.' },
  'qs_step_02_title': { en: 'Context Logic', ko: '컨텍스트 로직' },
  'qs_step_02_desc': { en: 'Define benchmarks and tech stack via AI analysis.', ko: 'AI 분석을 통해 벤치마크와 기술 스택을 정의합니다.' },
  'qs_step_03_title': { en: 'IA Architect', ko: 'IA 아키트' },
  'qs_step_03_desc': { en: 'Structure sitemap and functional scripts for each page.', ko: '사이트 맵과 각 페이지의 기능 스크립트를 구성합니다.' },
  'qs_step_04_title': { en: 'SDD Dispatch', ko: 'SDD 디스패치' },
  'qs_step_04_desc': { en: 'Send refined data to STITCH to start building.', ko: '정제된 데이터를 STITCH로 전송하여 빌드를 시작합니다.' },

  // App Header & Navigation
  'start_project': { en: 'Start Project', ko: '프로젝트 시작' },
  'goals_targets': { en: 'Goals & Targets', ko: '목표 및 타겟' },
  'concept_analysis': { en: 'Concept & Analysis', ko: '컨셉 및 분석' },
  'wireframe': { en: 'Wireframe', ko: '와이어프레임' },
  'tech_schedule': { en: 'ROADMAP & CHART', ko: '로드맵 및 차트' },
  'design_system': { en: 'Design System', ko: '디자인 시스템' },
  'navigation_architecture': { en: 'Navigation Architecture', ko: '내비게이션 아키텍처' },
  'extract_logo_colors': { en: 'Extract Logo Colors', ko: '로고 색상 추출' },
  'extracting': { en: 'Extracting...', ko: '추출 중...' },
  'back': { en: 'Back', ko: '뒤로' },
  'back_to_login': { en: 'Back to Login', ko: '로그인으로 돌아가기' },
  'next_step': { en: 'Next Step', ko: '다음 단계' },
  'finish': { en: 'Finish', ko: '마침' },
  'step': { en: 'Step', ko: '단계' },
  'drafting_future': { en: 'Drafting the future of web design with GOOGLE AI WEB ARCHITECT', ko: 'GOOGLE AI WEB ARCHITECT와 함께 웹 디자인의 미래를 설계합니다' },
  'architect_vision': { en: 'WEB ARCHITECT', ko: '웹 아키텍트' },
  'functional_arch_title': { en: 'Functional Mapping (Architectural Map)', ko: '기능 매핑 (아키텍처 맵)' },
  'functional_arch_subtitle': { 
    en: 'Validate the navigation structure through a visual architectural map. Check screen IDs and layout nodes to ensure no planning omissions.', 
    ko: '설계된 내비게이션 구조를 시각적인 아키텍처 맵으로 전환하여 검토합니다. 각 화면별 스크린 ID와 상세 레이아웃 노드를 확인하고, 기획의 누락이 없는지 최종 검증하세요.' 
  },
  'prompt_hub_title': { en: 'Prompt Extraction Hub', ko: '프롬프트 추출 허브' },
  'prompt_hub_subtitle': { en: 'Generate optimized prompts for Google AI ecosystem tools based on your plan.', ko: '기획안을 바탕으로 Google AI 생태계 도구에 최적화된 프롬프트를 생성합니다.' },
  'stitch_prompt_title': { en: 'Stitch Prompt (Design Constitution)', ko: 'Stitch 프롬프트 (디자인 헌법)' },
  'stitch_prompt_desc': { en: 'Design configuration analyzed for DESIGN.md format.', ko: 'DESIGN.md 형식으로 분석된 디자인 구성입니다.' },
  'studio_prompt_title': { en: 'AI Studio (Functional Spec)', ko: 'AI Studio (기능 명세)' },
  'studio_prompt_desc': { en: 'Technical specification for Build Mode prototyping.', ko: '빌드 모드 프로토타이핑을 위한 기술 명세입니다.' },
  'antigravity_prompt_title': { en: 'Antigravity (Security & Deploy)', ko: 'Antigravity (보안 및 배포)' },
  'antigravity_prompt_desc': { en: 'Security posture and Cloud Run deployment configuration.', ko: '보안 태세 및 Cloud Run 배포 구성입니다.' },
  'wide_research_title': { en: 'Wide Research (NotebookLM RAG)', ko: 'Wide Research (NotebookLM RAG)' },
  'wide_research_desc': { en: 'Evidence-based planning with NotebookLM RAG grounding.', ko: 'NotebookLM RAG를 통한 근거 중심의 기획 명세입니다.' },
  'wide_research_status': { en: 'Wide Research Status', ko: 'Wide Research 상태' },
  'rag_grounding_active': { en: 'NotebookLM RAG Grounding Active', ko: 'NotebookLM RAG 그라운딩 활성화됨' },
  'hallucination_guard': { en: 'Hallucination Guard: 0% target', ko: '할루시네이션 가드: 0% 목표' },
  'generate_stitch': { en: 'Generate Stitch Prompt', ko: 'Stitch 프롬프트 생성' },
  'generate_studio': { en: 'Generate Studio Prompt', ko: 'Studio 프롬프트 생성' },
  'generate_antigravity': { en: 'Generate Antigravity Prompt', ko: 'Antigravity 프롬프트 생성' },
  'copy_stitch': { en: 'Copy DESIGN.md', ko: 'DESIGN.md 복사' },
  'copy_studio': { en: 'Copy SPEC.md', ko: 'SPEC.md 복사' },
  'copy_antigravity': { en: 'Copy DEPLOY.md', ko: 'DEPLOY.md 복사' },
  'download_md': { en: 'Download .md', ko: '.md 다운로드' },
  'system_instruction_title': { en: 'System Instructions', ko: '시스템 가이드' },
  'system_instruction_desc': { en: 'AI core personality and behavioral constraints.', ko: 'AI 핵심 페르소나 및 행동 제약입니다.' },
  'copy_instruction': { en: 'Copy Instructions', ko: '가이드 복사' },
  'hub': { en: 'Hub', ko: '허브' },
  'generate_arch_map': { en: 'Generate Functional Map', ko: '기능 맵 생성' },
  'generating_arch': { en: 'Generating Functional Map...', ko: '기능 맵 생성 중...' },
  'edit_node_title': { en: 'Edit Node', ko: '노드 편집' },
  'node_label': { en: 'Label', ko: '레이블' },
  'node_description': { en: 'Description', ko: '설명' },
  'add_screen': { en: 'Add Screen', ko: '화면 추가' },
  'edit': { en: 'Edit', ko: '편집' },
  'authenticating': { en: 'Authenticating System', ko: '시스템 인증 중' },

  // Project Manager
  'load_project': { en: 'Load Project', ko: '프로젝트 불러오기' },
  'load_project_desc': { en: 'Select a project to load and continue your work.', ko: '불러올 프로젝트를 선택하여 작업을 계속하세요.' },
  'search_project': { en: 'Search projects...', ko: '프로젝트 검색...' },
  'no_projects': { en: 'No projects found.', ko: '프로젝트를 찾을 수 없습니다.' },
  'confirm_delete': { en: 'Are you sure you want to delete project "{name}"?', ko: '프로젝트 "{name}"을 삭제하시겠습니까?' },
  'project_saved': { en: 'Project "{name}" has been saved to the cloud.', ko: '프로젝트 "{name}"이 클라우드에 저장되었습니다.' },
  'project_updated': { en: 'Project "{name}" has been updated.', ko: '프로젝트 "{name}"이 업데이트되었습니다.' },
  'enter_project_name': { en: 'Please enter a project name.', ko: '프로젝트 이름을 입력하세요.' },
  'loading_projects': { en: 'Loading saved projects...', ko: '저장된 프로젝트 불러오는 중...' },
  'print_report': { en: 'Print Planning Report', ko: '기획 보고서 출력' },
  'print_now': { en: 'Print Now', ko: '지금 출력' },
  'print_report_title': { en: 'Print Planning Report', ko: '기획 보고서 출력' },

  // Project Overview Form Steps
  'start_project_title': { en: 'Start Your Project', ko: '프로젝트 시작' },
  'start_project_subtitle': { 
    en: 'A great website starts with a clear name. Set a professional name to define your project. This name will be used throughout your proposal.', 
    ko: '기획의 첫 걸음은 프로젝트의 이름을 정의하는 것입니다. 브랜드를 상징하거나 프로젝트의 성격을 잘 나타내는 전문적인 명칭을 입력하세요. 이 이름은 기획서 전반에 사용됩니다.' 
  },
  'project_name_label': { en: 'Project Name', ko: '프로젝트 이름' },
  'project_name_placeholder': { en: 'e.g., Local Gourmet Map Renewal', ko: '예: 지역 맛집 지도 리뉴얼' },
  'select_platform': { en: 'Select Platform', ko: '플랫폼 선택' },
  'select_service_type': { en: 'Select Service Type', ko: '서비스 형태 선택', id: 'Pilih Tipe Layanan' },
  'web_platform': { en: 'Web Application', ko: '웹 애플리케이션' },
  'app_platform': { en: 'Mobile App', ko: '모바일 앱' },
  'web_platform_desc': { en: 'Desktop-first, wide layout, standard web grid.', ko: '데스크톱 우선, 와이드 레이아웃, 표준 웹 그리드.' },
  'app_platform_desc': { en: 'Mobile-first, touch-optimized, bottom navigation.', ko: '모바일 우선, 터치 최적화, 바텀 내비게이션.' },
  'edit_name_anytime': { en: 'You can edit the project name at any time.', ko: '프로젝트 이름은 언제든지 수정할 수 있습니다.' },
  'goals_objectives_title': { en: 'Core Goals & Objectives', ko: '핵심 목표 및 목적' },
  'goals_objectives_subtitle': { 
    en: 'Define who and what you are building this site for. Clear goals lead to stronger outcomes. Define purposes, audiences, and KPIs here.', 
    ko: '사이트의 존재 이유와 타겟을 명확히 하는 단계입니다. 구축 목적, 주요 타겟 오디언스, 핵심 성과 지표(KPI)를 정의하여 기획의 논리적 근거를 마련하세요. AI가 최적의 기술 스택을 추천해 드립니다.' 
  },
  'target_url_label': { en: 'Target URL', ko: '타겟 URL' },
  'target_url_desc': { en: 'Enter the target URL for production.', ko: '프로덕션 타겟 URL을 입력하세요.' },
  'purpose_label': { en: 'Purpose', ko: '목적' },
  'purpose_placeholder': { en: 'e.g., Brand awareness, interactive global community', ko: '예: 브랜드 인지도 향상, 글로벌 커뮤니티' },
  'purpose_desc': { en: 'Describe the ultimate goal you want to achieve.', ko: '달성하고자 하는 최종 목표를 설명하세요.' },
  'target_audience_label': { en: 'Target Audience (Who)', ko: '타겟 오디언스 (누구)' },
  'target_audience_placeholder': { en: 'e.g., Global users interested in digital services', ko: '예: 디지털 서비스에 관심 있는 글로벌 사용자' },
  'target_audience_desc': { en: 'Define your primary visitors specifically.', ko: '주요 방문자를 구체적으로 정의하세요.' },
  'kpi_label': { en: 'KPI', ko: 'KPI' },
  'kpi_placeholder': { en: 'e.g., 10k monthly visitors, 1k newsletter subscribers', ko: '예: 월간 방문자 1만 명, 뉴스레터 구독자 1천 명' },
  'kpi_desc': { en: 'Set metrics to measure success.', ko: '성공을 측정할 지표를 설정하세요.' },
  'tone_manner_label': { en: 'Design Tone & Manner', ko: '디자인 톤 앤 매너' },
  'tone_manner_placeholder': { en: 'e.g., Warm and trustworthy, minimal, vibrant', ko: '예: 따뜻하고 신뢰감 있는, 미니멀한, 활기찬' },
  'tone_manner_desc': { en: 'Describe the emotions you want to convey.', ko: '전달하고 싶은 감성을 설명하세요.' },
  'inspiration_concept_title': { en: 'Inspiration & Concept', ko: '영감 및 컨셉' },
  'inspiration_concept_subtitle': { 
    en: 'Analyze visual sensitivity and competitiveness. AI analyzes benchmark URLs and provides ethical hacker perspectives on risks and directions.', 
    ko: '사이트의 시각적 감성과 경쟁력을 분석하는 단계입니다. 벤치마킹할 사이트의 URL을 입력하면 AI가 특징을 심층 분석하며, 화이트 해커 관점의 비판을 통해 잠재적 리스크와 개선 방향을 제시합니다.' 
  },
  'reference_label': { en: 'Reference', ko: '레퍼런스' },
  'ai_recommend': { en: 'AI Recommend', ko: 'AI 추천' },
  'ai_refine': { en: 'AI Refine', ko: 'AI 정리/정교화' },
  'ai_polish': { en: 'AI Polish', ko: 'AI 다듬기' },
  'reference_placeholder': { en: 'Describe site characteristics you find inspiring or use AI recommendations.', ko: '영감을 주는 사이트 특성을 설명하세요.' },
  'benchmark_label': { en: 'Benchmark', ko: '벤치마킹' },
  'ai_analyze': { en: 'AI Analyze', ko: 'AI 분석' },
  'benchmark_url_placeholder': { en: 'Site URL to analyze (https://...)', ko: '분석할 사이트 URL (https://...)' },
  'analysis_placeholder': { en: 'Analysis results will appear here.', ko: '분석 결과가 여기에 표시됩니다.' },
  'knowledge_source_title': { en: 'Knowledge Source', ko: '지식 소스' },
  'knowledge_source_subtitle': { en: 'Register documents, images, and links for AI to reference.', ko: 'AI가 참조할 문서, 이미지, 링크를 등록하세요.' },
  'add_knowledge_link': { en: 'Add Link', ko: '링크 추가' },
  'upload_knowledge_file': { en: 'Upload File', ko: '파일 업로드' },
  'knowledge_source_placeholder': { en: 'Enter Google Drive links or reference document descriptions.', ko: 'Google Drive 링크나 참조 문서 설명을 입력하세요.' },
  'knowledge_source_name': { en: 'Name', ko: '이름' },
  'knowledge_source_desc_label': { en: 'Content / Description', ko: '내용 / 설명' },
  'file_limit_info': { en: 'Max size: 10MB per file. (Supported: PDF, PPTX, DOCX, PNG, JPG)', ko: '파일당 최대 10MB.' },
  'ai_criticism_title': { en: 'Architecture Review & Negative Constraints', ko: '아키텍처 검토 노트 및 제약 사항' },
  'ai_criticism_subtitle': { en: 'Define security guardrails, performance constraints, anti-patterns, and architecture review notes.', ko: '보안 가이드라인, 성능 제약 사항, 배제할 안티패턴 및 기술 검토 의견을 기술합니다.' },
  'analyze_criticism': { en: 'Draft Review Guidelines', ko: '검토 가이드 초안' },
  'criticism_placeholder': { en: 'Document system constraints, security requirements, and anti-patterns to avoid (e.g., - DO NOT expose API keys on client\n- Strict 44px mobile touch targets)...', ko: '시스템 구축 시 준수해야 할 보안 규칙, 배제할 안티패턴, 성능 제약 사항을 입력하세요 (예: - 클라이언트 API 키 노출 금지\n- 모바일 터치 타겟 44px 이상 보장)...' },
  'tech_stack_ai_recommend': { en: 'Auto Suggest', ko: '자동 제안' },
  'tech_stack_placeholder': { en: 'e.g., React, Next.js, Node.js, Tailwind CSS, PostgreSQL', ko: '예: React, Next.js, Node.js, Tailwind CSS, PostgreSQL' },
  'visual_sitemap': { en: 'Visual Sitemap', ko: '시각적 사이트맵' },
  'sitemap_desc': { en: 'Visualize the entire structure of your site at a glance.', ko: '사이트의 전체 구조를 한눈에 시각화하세요.' },
  'gemini_strategy_title': { en: 'Strategic Direction & Implementation Guide', ko: '전략 방향성 및 실행 가이드' },
  'generate': { en: 'Generate', ko: '생성' },
  'strategy_placeholder': { en: "Define operational guidelines, business logic, and implementation phases.", ko: "서비스 운영 가이드라인, 비즈니스 로직 및 구현 단계를 기술하세요." },
  'functional_mapping_title': { en: 'Functional Mapping', ko: '기능 매핑' },
  'functional_mapping_subtitle': { en: 'Define core features for users and essential components for each screen.', ko: '핵심 기능과 필수 컴포넌트를 정의하세요.' },
  'screen_list_label': { en: 'Screen List (Screen ID)', ko: '화면 목록 (스크린 ID)' },
  'screen_list_desc': { en: 'Define screen IDs for planning and development management.', ko: '개발 관리를 위해 스크린 ID를 정의하세요.' },
  'core_features_label': { en: 'Core Features', ko: '핵심 기능' },
  'core_features_desc': { en: 'List technical features that must be implemented.', ko: '기술적 기능을 나열하세요.' },
  'wireframe_context_title': { en: 'Wireframe & Context', ko: '와이어프레임 및 컨텍스트' },
  'wireframe_context_subtitle': { en: 'Design the structure to visualize screen layouts and define the planning intent.', ko: '화면 레이아웃을 시각화하기 위해 구조를 설계하세요.' },
  'wireframe_label': { en: 'Wireframe Structure', ko: '와이어프레임 구조' },
  'wireframe_placeholder': { en: 'Describe the section layout for each page in text.', ko: '섹션 레이아웃을 설명하세요.' },
  'wireframe_desc': { en: 'Decide the flow of the layout.', ko: '레이아웃의 흐름을 결정하세요.' },
  'context_label': { en: 'Contextual Rationale', ko: '컨텍스트 근거' },
  'context_placeholder': { en: 'Why must it be structured this way?', ko: '왜 이렇게 설계되어야 하나요?' },
  'context_desc': { en: 'Record the planning intent to share with team members.', ko: '기획 의도를 기록하세요.' },
  'tech_roadmap_title': { en: 'ROADMAP & CHART', ko: '로드맵 및 차트' },
  'tech_roadmap_subtitle': { 
    en: 'Establish a systematic schedule from start to launch. Create Gantt charts by setting tasks, owners, and durations.', 
    ko: '프로젝트의 시작부터 런칭까지의 전체 일정을 체계적이며 시각적으로 수립합니다. 태스크별 담당자와 기간을 설정하여 간트 차트 형태의 로드맵을 생성하고 관리하세요.' 
  },
  'tech_stack_label': { en: 'Tech Stack', ko: '기술 스택' },
  'tech_stack_desc': { en: 'Define the tech stack to be used.', ko: '사용할 기술 스택을 정의하세요.' },
  'roadmap_label': { en: 'Roadmap', ko: '로드맵' },
  'roadmap_placeholder': { en: 'Discovery: Needs Assessment [Jan - Jan]\nPlanning: Project Agreement [Feb - Feb]\nDesign: Wireframe [March - April]\nDevelopment: Coding [May - August]', ko: '분석: 니즈 파악 [1월 - 1월]' },
  'roadmap_desc': { en: 'Chart is generated when you enter roadmap in format: [Category: Task Name [StartMonth - EndMonth]]', ko: '형식에 맞춰 입력하면 차트가 생성됩니다: [카테고리: 태스크 이름 [시작월 - 종료월]]' },
  'generate_chart': { en: 'Generate Chart', ko: '차트 생성' },
  'hide_chart': { en: 'Hide Chart', ko: '차트 숨기기' },
  'generate_roadmap': { en: 'Generate Roadmap', ko: '로드맵 생성' },
  'generating_roadmap': { en: 'Generating Roadmap...', ko: '로드맵 생성 중...' },
  'roadmap_generated': { en: 'Roadmap generated successfully!', ko: '로드맵이 생성되었습니다!' },
  'responsible_person': { en: 'Responsible', ko: '담당자' },
  'month_names': { en: 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec', ko: '1월,2월,3월,4월,5월,6월,7월,8월,9월,10월,11월,12월' },

  // Planning Form
  'design_system_preview': { en: 'Color Combination Preview', ko: '색상 조합 미리보기' },
  'color_check_desc': { en: 'Check if your colors match well. See how the link color looks within the text, and if buttons and accent colors stand out.', ko: '색상 배합이 잘 맞는지 확인하세요.' },
  'sample_heading': { en: 'Sample UI Heading', ko: '샘플 UI 제목' },
  'main_button': { en: 'Main Button', ko: '메인 버튼' },
  'accent_action': { en: 'Accent Action', ko: '액센트 액션' },
  'title_slogan': { en: 'Title & Slogan', ko: '제목 및 슬로건' },
  'enter_site_name': { en: 'Enter site name', ko: '사이트 이름 입력' },
  'write_first_impression': { en: 'Write your first impression for visitors', ko: '첫인상을 기록하세요' },
  'description_label': { en: 'Description', ko: '설명' },
  'provide_detailed_desc': { en: 'Provide a more detailed description of the site', ko: '상세 설명을 제공하세요' },
  'nav_menus': { en: 'Navigation Menus', ko: '내비게이션 메뉴' },
  'color_palette': { en: 'Color Palette', ko: '색상 팔레트' },
  'layout_structure': { en: 'Layout Structure', ko: '레이아웃 구조' },
  'standard_layout': { en: 'Standard', ko: '표준' },
  'sidebar_layout': { en: 'Sidebar', ko: '사이드바' },
  'centered_layout_desc': { en: 'Centered layout', ko: '중앙 정렬 레이아웃' },
  'sidebar_layout_desc': { en: 'Left side menu', ko: '좌측 사이드 메뉴' },
  'grid_system': { en: 'Section Grid System', ko: '섹션 그리드 시스템' },
  'mobile_dashboard_title': { en: 'Mobile Dashboard Config', ko: '모바일 대시보드 설정' },
  'card_count': { en: 'Widget Count', ko: '위젯(카드) 개수' },
  'columns_rows': { en: 'Grid Layout (Cols/Rows)', ko: '그리드 레이아웃 (열/행)' },
  'bottom_nav_label': { en: 'Bottom Navigation', ko: '하단 네비게이션' },
  'realtime_notif': { en: 'Real-time Notifications', ko: '실시간 알림' },
  'user_profile_access': { en: 'User Profile Access', ko: '사용자 프로필 접근' },
  'widget_name': { en: 'Widget Name', ko: '위젯 이름' },
  'app_vibe_desc': { en: 'Optimized for touch, personalization, and rapid access.', ko: '터치, 개인화, 빠른 접근에 최적화된 앱 구조입니다.' },
  'tab_count': { en: 'Number of Tabs (1-5)', ko: '탭 개수 (1-5)' },
  'ai_tab_recommend': { en: 'Recommend Tab Functions', ko: '탭 기능 추천' },
  'bottom_tab_config': { en: 'Bottom Tab Configuration', ko: '하단 탭 바 구성' },
  'hamburger_menu': { en: 'Hamburger Menu (Drawer)', ko: '햄버거 메뉴 (드로어)' },
  'sync_nav_menus': { en: 'Synchronized with NAVIGATION MENUS', ko: 'NAVIGATION MENUS와 동기화됨' },
  'icon': { en: 'Icon', ko: '아이콘' },
  'recommend_grid': { en: 'Recommend Grid', ko: '그리드 추천' },
  'sections_count': { en: 'Sections', ko: '섹션' },
  'footer_branding': { en: 'Footer Branding', ko: '푸터 브랜딩' },
  'company_label': { en: 'Company', ko: '회사명' },
  'address_label': { en: 'Address', ko: '주소' },
  'representative_label': { en: 'Representative', ko: '대표자' },
  'copied': { en: 'Copied!', ko: '복사됨!' },
  'copy': { en: 'Copy', ko: '복사' },
  'link': { en: 'Link', ko: '링크' },
  'accent': { en: 'Accent', ko: '액센트' },
  'theme': { en: 'Theme', ko: '테마' },

  // Page Structure Form
  'nav_arch_title': { en: 'Navigation Architecture', ko: '내비게이션 아키텍처' },
  'nav_arch_subtitle': { 
    en: "Design the hierarchy and detailed functions of each page. Organize menus via drag & drop and refine content scripts with AI's help.", 
    ko: "사이트의 전체 구조와 각 페이지별 상세 기능을 설계합니다. 드래그 앤 드롭으로 메뉴 계층을 구성하고, AI의 도움을 받아 각 페이지의 콘텐츠 스크립트와 SEO 설정을 완료하세요." 
  },
  'drag_drop_organize': { en: 'Drag & Drop to organize', ko: '드래그 앤 드롭' },
  'add_page': { en: 'Add Page', ko: '페이지 추가' },
  'no_pages_defined': { en: 'No pages defined yet', ko: '정의된 페이지 없음' },
  'config_script': { en: 'Configuration & Script', ko: '구성 및 스크립트' },
  'visual_content': { en: 'Visual Content', ko: '시각적 콘텐츠' },
  'uploading_image': { en: 'Uploading Image...', ko: '이미지 업로드 중...' },
  'upload_cover_image': { en: 'Upload Cover Image', ko: '커버 이미지 업로드' },
  'paste_image_url': { en: 'Paste image URL here...', ko: '이미지 URL 입력...' },
  'random': { en: 'Random', ko: '무작위' },
  'page_script_content': { en: 'Page Script & Content', ko: '페이지 스크립트' },
  'confirm_changes': { en: 'Confirm Changes', ko: '변경 사항 확인' },
  'format': { en: 'Format Script', ko: '스크립트 포맷' },
  'script_formatted': { en: 'Script content formatted!', ko: '정리 완료!' },
  'ai_generate_script': { en: 'AI Generate Script', ko: 'AI 스크립트 생성' },
  'generating': { en: 'Generating...', ko: '생성 중...' },
  'select_page_edit': { en: 'Select a page to edit', ko: '편집할 페이지 선택' },
  'choose_page_map': { en: 'Choose a page from the map to configure its content', ko: '맵에서 페이지 선택' },
  'level_node': { en: 'Level {level} Node', ko: '{level} 레벨 노드' },
  'no_script_refine': { en: 'No script content to refine.', ko: '내용이 없습니다.' },
  'auto_save_found': { en: 'Auto-saved data found. Would you like to restore it?', ko: '자동 저장 복구할까요?' },
  'restore': { en: 'Restore', ko: '복구' },
  'discard': { en: 'Discard', ko: '삭제' },
  'auto_saved': { en: 'Auto-saved', ko: '자동 저장됨' },
  'script_refined': { en: 'Script successfully refined!', ko: '다듬어짐!' },
  'image_uploaded': { en: 'Image uploaded successfully.', ko: '성공!' },
  'image_upload_failed': { en: 'Failed to upload image.', ko: '실패.' },
  'duplicate_slug': { en: 'Duplicate Slug', ko: '중복 슬러그' },
  'invalid_slug_format': { en: 'Invalid Format', ko: '잘못된 형식' },
  'check_slug_settings': { en: 'Please check your slug settings. There are duplicate or invalid format slugs.', ko: '설정 확인.' },
  'move_up': { en: 'Move Up', ko: '위로' },
  'move_down': { en: 'Move Down', ko: '아래로' },
  'indent': { en: 'Indent Right', ko: '들여쓰기' },
  'outdent': { en: 'Indent Left', ko: '내어쓰기' },
  'untitled_page': { en: 'Untitled Page', ko: '제목 없음' },
  'empty_script_warn': { en: 'Page script is empty. Please write content or use AI Refine to generate it.', ko: '비어 있음.' },
  'script_empty_error': { en: 'Content is missing', ko: '내용 없음' },
  'ai_refine_suggest': { en: 'Try AI Refine for content', ko: 'AI 다듬기' },
  'ai_refine_tooltip': { en: 'Improves readability and professional tone by refining the content.', ko: '톤을 다듬어줍니다.' },
  'new_page': { en: 'New Page', ko: '새 페이지' },
  'template_label': { en: 'Page Template', ko: '템플릿' },
  'template_standard': { en: 'Standard Content Page', ko: '표준' },
  'template_contact': { en: 'Contact Form Page', ko: '문의' },
  'template_blog': { en: 'Blog Post Page', ko: '블로그' },
  'template_faq': { en: 'FAQ Page', ko: 'FAQ' },
  'template_portfolio': { en: 'Portfolio Page', ko: '포트폴리오' },
  'template_testimonial': { en: 'Testimonial Page', ko: '후기' },
  'page_name_label': { en: 'Page Name', ko: '페이지 이름' },
  'seo_settings': { en: 'SEO Settings', ko: 'SEO 설정' },
  'seo_title_label': { en: 'SEO Title', ko: 'SEO 제목' },
  'seo_desc_label': { en: 'Meta Description', ko: '메타 설명' },
  'seo_keywords_label': { en: 'Keywords', ko: '키워드' },
  'seo_title_placeholder': { en: 'Enter title for search results...', ko: '제목 입력...' },
  'seo_desc_placeholder': { en: 'Enter page description for search engines...', ko: '설명 입력...' },
  'seo_keywords_placeholder': { en: 'Enter keywords separated by commas...', ko: '키워드 입력...' },
  'recommend_seo': { en: 'Recommend SEO', ko: 'SEO 추천' },
  'seo_recommended': { en: 'SEO settings recommended.', ko: '추천 완료.' },
  'write_detailed_desc': { en: 'Write the detailed content, scripts, and layout notes for this page...', ko: '내용 작성...' },

  // Auth Error Messages
  'auth_failed': { en: 'Authentication failed. Please check your credentials and try again.', ko: '인증에 실패했습니다. 계정 정보를 확인하고 다시 시도해 주세요.' },
  'auth_no_method': { en: 'Email/Password login is not enabled for this project.', ko: '이 프로젝트에 이메일/비밀번호 로그인이 활성화되어 있지 않습니다.' },
  'auth_invalid_credential': { en: 'The email or password you entered is incorrect.', ko: '입력하신 이메일 또는 비밀번호가 올바르지 않습니다.' },
  'auth_user_not_found': { en: 'No account found with this email address.', ko: '해당 이메일로 등록된 계정을 찾을 수 없습니다.' },
  'auth_wrong_password': { en: 'The password you entered is incorrect. Please try again.', ko: '비밀번호가 틀렸습니다. 다시 확인해 주세요.' },
  'auth_email_already_in_use': { en: 'This email address is already registered. Please sign in instead.', ko: '이미 사용 중인 이메일 주소입니다. 로그인해 주세요.' },
  'auth_weak_password': { en: 'Password is too weak. It must be at least 6 characters long and include a mix of letters and numbers.', ko: '비밀번호가 너무 취약합니다. 최소 6자 이상이어야 하며 문자만 숫자를 혼합해 주세요.' },
  'auth_invalid_email': { en: 'Please enter a valid email address format (e.g., user@example.com).', ko: '유효한 이메일 형식을 입력해 주세요 (예: user@example.com).' },
  'auth_too_many_requests': { en: 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.', ko: '잦은 로그인 실패로 인해 이 계정에 대한 액세스가 일시적으로 차단되었습니다. 비밀번호를 재설정하여 즉시 복구하거나 나중에 다시 시도해 주세요.' },
  'auth_internal_error': { en: 'An internal server error occurred. Please try again in a few minutes.', ko: '인증 서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
  'auth_popup_closed': { en: 'Login popup was closed before completion. If this persists, please try opening the app in a new tab or check your popup blocker settings.', ko: '로그인 팝업이 완료되기 전에 닫혔습니다. 문제가 지속되면 앱을 [새 탭에서 열기]로 실행하거나 브라우저의 팝업 차단 설정을 확인해 주세요.' },
  'auth_user_disabled': { en: 'This account has been disabled. Please contact support for assistance.', ko: '이 계정은 비활성화되었습니다. 지원팀에 문의해 주세요.' },
  'auth_network_error': { en: 'A network error occurred. Please check your internet connection and try again.', ko: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.' },
  'auth_different_credential': { en: 'An account already exists with this email but using a different sign-in method (like Google). Please sign in using that method.', ko: '이 이메일로 이미 계정이 존재하지만 다른 로그인 수단(예: Google)을 사용하고 있습니다. 해당 수단으로 로그인해 주세요.' },
  'auth_requires_recent_login': { en: 'This action is sensitive and requires recent authentication. Please log out and log back in to continue.', ko: '보안이 필요한 작업이므로 최근 인증이 필요합니다. 로그아웃 후 다시 로그인해 주세요.' },
  'gemini_rate_limit': { en: 'Rate limit exceeded for Gemini API. Please wait a moment and try again.', ko: 'Gemini API 호출 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.' },

  // App Misc
  'design_system_desc': { en: 'Define the color palette and layout that determine your brand identity.', ko: '브랜드 비주얼 정의.' },
  'design_system_subtitle': { 
    en: "The Design System step builds your brand's core identity. 1. Set the site name and first-impression slogan, 2. Extract and apply brand color palettes via AI analysis, 3. Define the visual DNA through optimized layouts (Standard/Sidebar) and grid systems.", 
    ko: "디자인 시스템 단계에서는 브랜드의 핵심 아이덴티티를 구축합니다. 1. 사이트 명칭과 첫인상을 결정하는 슬로건 설정, 2. AI 분석을 통한 브랜드 컬러 팔레트 추출 및 적용, 3. 최적화된 레이아웃 구조(표준/사이드바) 및 그리드 시스템 구성을 통해 사이트의 시각적 DNA를 완성하세요." 
  },
  'planning_complete': { en: 'All planning is complete!', ko: '기획 완료!' },
  'page_slug_error': { en: 'Please check the slugs in the page details. There are duplicate or invalid format slugs.', ko: '슬러그 확인.' },

  // Site Preview
  'realtime_struct_desc': { en: 'Real-time website structure generated based on the plan.', ko: '실시간 구조.' },
  'desktop_view': { en: 'Desktop View', ko: '데스크톱 뷰' },
  'mobile_view': { en: 'Mobile View', ko: '모바일 뷰' },
  'slogan_placeholder': { en: 'Your one-line introduction appears here.', ko: '슬로건 위치.' },
  'body_desc_placeholder': { en: 'This is the main body area where the core content of your site will go.', ko: '메인 콘텐츠.' },
  'learn_more': { en: 'Learn More', ko: '더 알아보기' },
  'rep_label': { en: 'Rep:', ko: '대표:' },
  'addr_label': { en: 'Addr:', ko: '주소:' },
  'tel_label': { en: 'TEL:', ko: '전화:' },
  'email_label': { en: 'Email:', ko: '이메일:' },
  'text_content': { en: '📝 Text', ko: '📝 텍스트' },
  'image_content': { en: '🖼️ Image', ko: '🖼️ 이미지' },
  'untitled_site': { en: 'Untitled Site', ko: '제목 없음' },

  // Print Report
  'doc_status': { en: 'Document Status', ko: '문서 상태' },
  'final_proposal': { en: 'Final Proposal', ko: '최종 제안서' },
  'date_issue': { en: 'Date of Issue', ko: '발행 일자' },
  'std_documentation': { en: 'Standard documentation', ko: '표준 문서화' },
  'mockup_visualization_note': { en: '* This visualization represents the core layout and architectural intent of the proposal.', ko: '* 시각화입니다.' },
  'func_script_context': { en: 'Functional script & Context', ko: '기능 스크립트' },
  'no_script_defined': { en: 'No script defined for this page.', ko: '스크립트 없음.' },
  'internal_doc': { en: 'Internal Planning Document', ko: '내부 기획 문서' },
  'confidential': { en: 'Confidential • Web Planner Tool', ko: '대외비' },
  'page_end': { en: 'Page END', ko: '페이지 종료' },
  'ai_strategy_direction': { en: 'Gemini Optimized Strategy', ko: 'Gemini 전략' },
  'project_strategy': { en: 'Project Strategy', ko: '프로젝트 전략' },
  'business_purpose': { en: 'Business Purpose', ko: '비즈니스 목적' },
  'target_audience': { en: 'Target Audience', ko: '타겟 오디언스' },
  'kpi': { en: 'KPI', ko: 'KPI' },
  'branding_tone': { en: 'Branding Tone', ko: '브랜딩 톤' },
  'design_mockup': { en: 'Design Mockup', ko: '디자인 목업' },
  'technical_details': { en: 'Technical Details', ko: '기술적 세부 사항' },

  // Prompt Hub / Dispatch
  'stitch_dispatch_hub': { en: 'STITCH Dispatch Hub', ko: 'STITCH 디스패치 허브' },
  'stitch_dispatch_subtitle': { 
    en: 'Extract master prompts for the Google AI ecosystem based on your plan. Copy DESIGN.md, SPEC.md, and DEPLOY.md to transition to build mode.', 
    ko: '완성된 기획 데이터를 기반으로 Google AI 생태계에 주입할 마스터 프롬프트를 추출합니다. DESIGN.md, SPEC.md, DEPLOY.md를 복사하여 빌드 모드로 즉시 전환하세요.' 
  },
  'sdd_synth': { en: 'PHASE 1: SDD SYNTHESIS', ko: '단계 1: SDD 합성' },
  'status': { en: 'Status', ko: '상태' },
  'ready_for_injection': { en: 'Ready for Injection', ko: '주입 준비 완료' },
  'guard': { en: 'Guard', ko: '가드' },
  'negative_constraints_active': { en: 'Negative Constraints: Active', ko: '부정적 제약: 활성화됨' },
  'dispatching_sdd': { en: 'Dispatching SDD...', ko: 'SDD 디스패치 중...' },
  'sdd_dispatched': { en: 'SDD Dispatched', ko: 'SDD 디스패치 완료' },
  'dispatch_to_stitch': { en: 'Dispatch to STITCH', ko: 'STITCH로 디스패치' },
  'architect_note': { en: "Architect's Note", ko: '아키텍트의 노트' },
  'architect_note_desc': { 
    en: '"GOGUMA transforms vague intent into precise structure. Once dispatched, STITCH will interpret this manifest to build your high-fidelity design environment."', 
    ko: '"GOGUMA는 모호한 의도를 정교한 구조로 전환합니다. 디스패치 후 STITCH가 이 매니페스트를 해석하여 환경을 구축합니다."' 
  },
  'manifest_synced': { en: 'Manifest synced with current site plan context', ko: '매니페스트가 현재 사이트 플랜과 동기화되었습니다.' },
  
  'stitch_guide_title': { en: 'STITCH Integration Guide', ko: 'STITCH 연동 가이드' },
  'stitch_guide_step1': { en: 'SDD Manifest Copied', ko: 'SDD 매니페스트가 복사되었습니다' },
  'stitch_guide_step2': { en: 'Open STITCH (New Tab)', ko: 'STITCH를 열었습니다 (새 탭)' },
  'stitch_guide_step3': { en: 'Paste the SDD into the STITCH prompt to begin coding.', ko: 'STITCH 프롬프트에 SDD를 붙여넣어 코딩을 시작하세요.' },
  'seamless_chain_active': { en: 'SEAMLESS CHAIN ACTIVE', ko: '심리스 체인 활성화됨' },

  // Deployment Config
  'deployment_config_title': { en: 'Deployment Config Panel', ko: '배포 설정 패널', id: 'Panel Konfigurasi Deployment' },
  'deployment_config_subtitle': { 
    en: 'Configure the target environment and infrastructure settings for your project deployment.', 
    ko: '프로젝트 배포를 위한 대상 환경 및 인프라 설정을 구성합니다.',
    id: 'Konfigurasikan lingkungan target dan pengaturan infrastruktur untuk deployment proyek Anda.' 
  },
  'infrastructure_config_label': { en: 'Infrastructure Configuration', ko: '인프라 구성 설정', id: 'Konfigurasi Infrastruktur' },
  'admin_audit_label': { en: 'Administrative Audit', ko: '행정 거버넌스 감사', id: 'Audit Administratif' },
  'deployment_mode': { en: 'Deployment Mode', ko: '배포 모드', id: 'Mode Deployment' },
  'dev_mode': { en: 'Development (Dev)', ko: '개발용 (Dev)', id: 'Development (Dev)' },
  'prod_mode': { en: 'Production (Prod)', ko: '배포용 (Prod)', id: 'Production (Prod)' },
  'dev_desc': { en: 'Focuses on rapid prototyping and debugging logs.', ko: '빠른 프로토타이핑과 디버깅 로그 노출 위주', id: 'Berfokus pada pembuatan prototipe cepat dan log debugging.' },
  'prod_desc': { en: 'Strict security, Secret Manager integration, and administrative compliance.', ko: 'Zero-Trust 보안, Secret Manager 연동 등 엄격한 사양', id: 'Keamanan ketat, integrasi Secret Manager, dan kepatuhan administratif.' },
  'region_guide': { en: 'Select the geographical location closest to your users for lower latency.', ko: '사용자와 가장 가까운 지리적 위치를 선택하여 지연 시간을 최소화하세요.', id: 'Pilih lokasi geografis terdekat dengan pengguna Anda untuk latensi yang lebih rendah.' },
  'provider_guide': { en: 'Cloud Run is recommended for most web apps; GKE for complex orchestration.', ko: '대부분의 웹 앱에는 Cloud Run을 추천하며, 복잡한 관리가 필요한 경우 GKE를 선택하세요.', id: 'Cloud Run direkomendasikan untuk sebagian besar aplikasi web; GKE untuk orkestrasi yang kompleks.' },
  'budget_guide': { en: 'Max monthly spend before auto-shutdown or alert notification triggers.', ko: '예산 초과 시 자동 중단 또는 알림이 발생하는 월간 최대 지출 한도입니다.', id: 'Pengeluaran bulanan maksimum sebelum penghentian otomatis atau pemicu pemberitahuan peringatan.' },
  'audit_guide': { en: 'Internal tracking codes for corporate compliance and cost center assignment.', ko: '기업 규정 준수 및 비용 센터 할당을 위한 내부 추적 코드입니다.', id: 'Kode pelacakan internal untuk kepatuhan perusahaan dan penetapan pusat biaya.' },
  'legal_guide': { en: 'Verification of Terms of Service, Privacy Policy, and GDPR/MOU compliance.', ko: '이용약관, 개인정보 처리방침 및 관련 법적 규제 준수 여부를 확인합니다.', id: 'Verifikasi Ketentuan Layanan, Kebijakan Privasi, dan kepatuhan GDPR/MOU.' },
  'signoff_guide': { en: 'Final authority approval required to initiate the production deployment pipeline.', ko: '운영 환경 배포 파이프라인을 시작하기 위해 필요한 최종 권한자의 승인입니다.', id: 'Persetujuan otoritas akhir diperlukan untuk memulai pipa deployment produksi.' },
  'view_guide': { en: 'View Guide', ko: '가이드 보기', id: 'Lihat Panduan' },
  'deployment_handbook': { en: 'Deployment Handbook', ko: '배포 핸드북', id: 'Buku Panduan Deployment' },
  'deployment_handbook_subtitle': { en: 'Essential knowledge for successful resource allocation.', ko: '성공적인 리소스 할당을 위해 알아두어야 할 핵심 지식입니다.', id: 'Pengetahuan penting untuk alokasi sumber daya yang sukses.' },
  'handbook_step1_title': { en: 'Step 1: Resource Provisioning', ko: '1단계: 리소스 프로비저닝', id: 'Langkah 1: Penyediaan Sumber Daya' },
  'handbook_step1_desc': { en: 'Determine regional presence and instance types based on expected peak traffic and data residency laws.', ko: '예상되는 피크 트래픽과 데이터 관련 법적 상주 요건에 따라 리전 선택 및 인스턴스 유형을 조율합니다.', id: 'Tentukan keberadaan regional dan jenis instans berdasarkan perkiraan lalu lintas puncak dan hukum kedaulatan data.' },
  'handbook_step2_title': { en: 'Step 2: Security Hardening', ko: '2단계: 보안 강화', id: 'Langkah 2: Pengerasan Keamanan' },
  'handbook_step2_desc': { en: 'Implement Google Secret Manager for API keys and database credentials to ensure zero-trust compliance.', ko: 'Zero-Trust 보안 아키텍처를 준수하기 위해 구글 시크릿 매니저(Secret Manager)를 도입하고 API 키와 DB 자격 증명을 암호화합니다.', id: 'Terapkan Google Secret Manager untuk kunci API dan kredensial database untuk memastikan kepatuhan zero-trust.' },
  'handbook_step3_title': { en: 'Step 3: Governance Check', ko: '3단계: 거버넌스 검토', id: 'Langkah 3: Pemeriksaan Tata Kelola' },
  'handbook_step3_desc': { en: 'Finalize legal and institutional sign-offs to validate project intent against corporate guidelines.', ko: '비즈니스 정합성을 검증하기 위해 기획안과 사양서에 대한 법적 효력 검토 및 기관 최종 서명을 완료합니다.', id: 'Selesaikan penandatanganan hukum dan institusional untuk memvalidasi maksud proyek terhadap pedoman korporat.' },
  'region_label': { en: 'Region', ko: '리전', id: 'Wilayah (Region)' },
  'provider_label': { en: 'Infrastructure Provider', ko: '인프라 제공자', id: 'Penyedia Infrastruktur' },
  'secret_mgmt_label': { en: 'Secret Management', ko: '비밀 관리', id: 'Manajemen Rahasia' },
  'budget_limit_label': { en: 'Monthly Budget Limit', ko: '월간 예산 한도', id: 'Batas Anggaran Bulanan' },
  'budget_code_label': { en: 'Administrative Budget Code', ko: '행정 예산 코드', id: 'Kode Anggaran Administratif' },
  'legal_approval_label': { en: 'Legal Approval', ko: '법적 승인', id: 'Persetujuan Hukum' },
  'inst_signoff_label': { en: 'Institutional Sign-off', ko: '기관 최종 승인', id: 'Persetujuan Institusional' },
  'done': { en: 'DONE', ko: '완료', id: 'SELESAI' },
  'pending': { en: 'PENDING', ko: '대기 중', id: 'TERTUNDA' },
  'signoff_warning': { en: 'Deployment is disabled until institutional sign-off is completed.', ko: '기관 최종 승인이 완료될 때까지 배포가 비활성화됩니다.', id: 'Deployment dinonaktifkan hingga penandatanganan institusional selesai.' },
  
  'ia_visualization': { en: 'IA VISUALIZATION', ko: 'IA 시각화' },

  // Admin module
  'admin_dashboard': { en: 'Operational Stats', ko: '운영 통계' },
  'cs_stats': { en: 'CS Statistics', ko: 'CS 처리 통계', id: 'Statistik CS' },
  'user_mgmt': { en: 'User Management', ko: '사용자 관리' },
  'project_log': { en: 'Project Logs', ko: '전체 프로젝트 로그' },
  'billing_usage': { en: 'API Usage & Cost', ko: 'API 사용량 및 비용' },
  'system_settings': { en: 'System Settings', ko: '시스템 설정' },
  'mail_inbox': { en: 'In-App Mail Inbox', ko: '인앱 메일 수신함', id: 'Kotak Masuk Surat In-App' },
  'mail_inbox_desc': { en: 'Gmail pipeline linked with master@goguma.app and powered by Gemini AI classification.', ko: 'master@goguma.app과 연동된 지메일 파이프라인 및 제미나이 AI 자동 분류 시스템입니다.', id: 'Saluran pipa Gmail yang ditautkan dengan master@goguma.app dan didukung oleh klasifikasi AI Gemini.' },
  'admin_panel': { en: 'Admin Panel', ko: '관리자 패널' },
  'master_architect': { en: 'Master Architect', ko: '수석 아키텍트' },
  
  'admin': { en: 'ADMIN', ko: '관리자' },
  'user': { en: 'USER', ko: '사용자' },

  // Dashboard & Analytics
  'total_users': { en: 'Total Users', ko: '총 사용자' },
  'total_projects': { en: 'Total Projects', ko: '총 프로젝트' },
  'api_calls_today': { en: 'API Calls (Today)', ko: 'API 호출 (오늘)' },
  'active_sessions': { en: 'Active Sessions', ko: '활성 세션' },
  'dashboard_desc': { en: 'Real-time traffic and system usage metrics.', ko: '실시간 트래픽 및 시스템 사용 지표 데이터입니다.' },
  'api_traffic': { en: 'API Call Traffic', ko: 'API 호출 트래픽' },
  'api_traffic_desc': { en: 'Gemini API usage trends over the last 7 days', ko: '최근 7일간의 Gemini API 사용량 변화' },
  'realtime': { en: 'REAL-TIME', ko: '실시간' },
  'system_status': { en: 'System Status', ko: '시스템 상태' },
  'all_systems_operational': { en: 'All Systems Operational', ko: '모든 시스템 정상 가동 중' },
  'db_load': { en: 'Database Load', ko: '데이터베이스 부하' },
  'server_latency': { en: 'Server Latency', ko: '서버 지연 시간' },
  'storage_usage': { en: 'Storage Usage', ko: '저장 공간 사용량' },
  'download_report': { en: 'Download Health Report', ko: '상태 리포트 다운로드' },
  'api_usage_cost': { en: 'API Usage & Cost', ko: 'API 사용량 및 비용' },
  'api_usage_cost_desc': { en: 'Infrastructure costs and API call metrics based on service operation.', ko: '서비스 운영에 따른 인프라 비용 및 API 호출 지표입니다.' },
  'filter': { en: 'Filter', ko: '필터' },
  'export_data': { en: 'Export Data', ko: '데이터 내보내기' },
  'usage_trends': { en: 'Monthly Usage Trends', ko: '월간 사용량 트렌드' },
  'last_30_days': { en: 'Last 30 Days', ko: '최근 30일' },
  'last_90_days': { en: 'Last 90 Days', ko: '최근 90일' },
  'model_distribution': { en: 'Model Distribution', ko: '모델 배분' },
  'estimated_cost': { en: 'Estimated Monthly Cost', ko: '예상 월간 비용' },
  'vs_prev_month': { en: 'vs Prev Month', ko: '전월 대비' },
  'gemini_3_flash': { en: 'Gemini 3 Flash', ko: '제미나이 3 플래시' },
  'gemini_2_0_pro': { en: 'Gemini 2.0 Pro', ko: '제미나이 2.0 프로' },
  'other_models': { en: 'Other Models', ko: '기타 모델' },
  
  // Project Proposal Report
  'export_proposal_pdf': { en: 'Export Planning Proposal (PDF)', ko: '기획 제안서 내보내기 (PDF)' },
  'export_project_json': { en: 'Export Project JSON (.goguma.json)', ko: '프로젝트 JSON 내보내기', id: 'Ekspor Proyek JSON' },
  'import_project_json': { en: 'Import Project JSON (.json)', ko: '프로젝트 JSON 가져오기', id: 'Impor Proyek JSON' },
  'download_this_project': { en: 'Download Project JSON', ko: '이 프로젝트 JSON 다운로드', id: 'Unduh JSON Proyek' },
  'copy_this_project': { en: 'Copy Project JSON', ko: '프로젝트 JSON 복사', id: 'Salin JSON Proyek' },
  'dropzone_title': { en: 'Drop Project File Here', ko: 'GOGUMA 프로젝트 파일 드롭', id: 'Lepaskan File Proyek di Sini' },
  'dropzone_subtitle': { en: 'Release your .goguma.json or .json file to instantly import your project state.', ko: '.goguma.json 또는 .json 파일을 놓으면 프로젝트 상태를 즉시 분석하여 불러옵니다.', id: 'Lepaskan file .goguma.json atau .json Anda untuk langsung mengimpor status proyek.' },
  'dropzone_formats': { en: 'Supports .goguma.json • .json (v2.0 & Raw SitePlan)', ko: '.goguma.json • .json 지원 (v2.0 규격 및 원본 SitePlan)', id: 'Mendukung .goguma.json • .json' },
  'drop_confirm_title': { en: 'Confirm Project Import', ko: '프로젝트 가져오기 확인', id: 'Konfirmasi Impor Proyek' },
  'drop_confirm_subtitle': { en: 'Review project summary before importing into your workspace.', ko: '워크스페이스에 불러오기 전 프로젝트 요약 정보를 검토하세요.', id: 'Tinjau ringkasan proyek sebelum mengimpor ke ruang kerja Anda.' },
  'confirm_import_button': { en: 'Confirm & Import to Workspace', ko: '확인 및 워크스페이스에 불러오기', id: 'Konfirmasi & Impor ke Ruang Kerja' },
  'save_to_library_only': { en: 'Save to Library Only', ko: '보관함에만 저장', id: 'Hanya Simpan ke Pustaka' },
  'number_of_pages': { en: 'Number of Pages', ko: '페이지 수', id: 'Jumlah Halaman' },
  'open_in_workspace': { en: 'Open in Workspace', ko: '워크스페이스에 바로 열기', id: 'Buka di Ruang Kerja' },
  'save_to_library_btn': { en: 'Save to Projects Library', ko: '보관함에 새 프로젝트로 저장', id: 'Simpan ke Pustaka Proyek' },
  'drop_import_success': { en: 'Project loaded into workspace successfully.', ko: '프로젝트를 워크스페이스에 성공적으로 불러왔습니다.', id: 'Proyek berhasil dimuat ke ruang kerja.' },
  'drop_save_success': { en: 'Project saved to library successfully.', ko: '프로젝트가 보관함에 안전하게 저장되었습니다.', id: 'Proyek berhasil disimpan ke pustaka.' },
  'drop_invalid_error': { en: 'The dropped file is not a valid GOGUMA project JSON file.', ko: '드롭된 파일이 올바른 GOGUMA 프로젝트 JSON 파일이 아닙니다.', id: 'File bukan JSON proyek GOGUMA yang valid.' },
  'generating_proposal': { en: 'Generating Strategic Proposal...', ko: '전략적 제안서 생성 중...' },
  'review_comments': { en: 'Review Comments', ko: '검토 의견' },
  'approval_signature': { en: 'Approval Signature', ko: '승인 서명' },
  'executive_summary': { en: 'Executive Summary', ko: '프로젝트 요약' },
  'strategic_intent': { en: 'Strategic Intent', ko: '전략적 의도' },
  'administrative_roadmap': { en: 'Administrative Roadmap', ko: '행정 로드맵' },
  'sdd_summary': { en: 'SDD Summary (Technical)', ko: '기술 설계 요약 (SDD)' },
  'negative_constraints': { en: 'Negative Constraints', ko: '부정적 제약 사항' },
  'ai_design_principles': { en: 'AI Design Principles', ko: 'AI 설계 원칙' },
  'admin_monitoring_plan': { en: 'Admin Monitoring Plan', ko: '관리자 모니터링 계획' },
  'project_overview_section': { en: 'Project Overview', ko: '프로젝트 개요' },
  'strategic_planning_section': { en: 'Strategic Planning', ko: '전략적 기획' },
  'function_spec_section': { en: 'Detailed Function Spec (SPEC)', ko: '상세 기능 명세 (SPEC)' },
  'ia_section': { en: 'Information Architecture (IA)', ko: '정보 구조 (IA)' },
  'admin_security_section': { en: 'Administration & Security', ko: '행정 및 보안' },
  'admin_monitoring_section': { en: 'Admin Mode Design', ko: '관리자 모드 설계' },
  'cover_title': { en: 'Project Proposal & System Design Manifest', ko: '프로젝트 제안서 및 시스템 설계 매니페스트' },
  'admin_incharge': { en: 'Admin in Charge', ko: '운영 책임자' },
  'mou_compliance': { en: 'MOU Compliance Status', ko: 'MOU 준수 현황' },
  'budget_approval_status': { en: 'Budget Approval Status', ko: '예산 승인 현황' },

  // User Mgmt & Projects
  'user_mgmt_desc': { en: 'Manage permissions and account status for administrators and general users.', ko: '관리자 및 일반 사용자 계정의 권한과 상태를 관리합니다.' },
  'search_user_placeholder': { en: 'Search by name or email...', ko: '이름 또는 이메일로 검색...' },
  'user_profile': { en: 'User Profile', ko: '사용자 프로필' },
  'my_account': { en: 'My Account', ko: '내 계정' },
  'ai_policy': { en: 'AI Policy', ko: '인공지능 정책', id: 'Kebijakan AI' },
  'ai_policy_intro_title': { en: '1. Introduction', ko: '1. 개요 및 목적', id: '1. Pendahuluan' },
  'ai_policy_intro_desc': { 
    en: 'This AI Policy outlines how Artificial Intelligence (AI) technologies are utilized within our services and how we robustly protect and handle your data.', 
    ko: '본 인공지능 정책(이하 "AI 정책")은 당사 서비스 내에서 인공지능(AI) 기술이 활용되는 방식과 사용자의 데이터가 안전하게 보호되는지 투명하게 설명하기 위해 마련되었습니다.',
    id: 'Kebijakan AI ini menguraikan bagaimana teknologi Kecerdasan Buatan (AI) digunakan dalam layanan kami dan bagaimana kami melindungi serta menangani data Anda dengan kuat.'
  },
  'ai_policy_training_title': { en: '2. No Data Training Guarantee', ko: '2. 데이터 학습 원천 배제', id: '2. Jaminan Tanpa Pelatihan Data' },
  'ai_policy_training_desc': { 
    en: 'We strictly guarantee that your input data (prompts, text, uploaded files) and AI-generated outputs are NEVER used for training AI models by us or our third-party provider (Google Cloud AI). Your business data remains exclusively yours and is processed solely to execute your requests.', 
    ko: '당사는 사용자가 입력한 프롬프트, 텍스트, 업로드한 파일 및 AI가 생성한 결과물을 당사 또는 제3자(Google 등)의 AI 모델 학습(Training) 목적으로 절대 사용하지 않으며, 타인에게 공유하지 않습니다. 귀하의 비즈니스 데이터는 오직 귀하의 요청을 처리하는 데에만 사용됩니다.',
    id: 'Kami menjamin secara tegas bahwa data masukan Anda (prompt, teks, file yang diunggah) dan keluaran yang dihasilkan AI TIDAK PERNAH digunakan untuk melatih model AI oleh kami atau penyedia pihak ketiga kami (Google Cloud AI). Data bisnis Anda tetap menjadi milik Anda secara eksklusif dan diproses semata-mata untuk menjalankan permintaan Anda.'
  },
  'ai_policy_security_title': { en: '3. Technical Partner & Security', ko: '3. 기술 파트너 및 데이터 보안', id: '3. Mitra Teknis & Keamanan' },
  'ai_policy_security_desc': { 
    en: 'To deliver advanced features, we build upon Google Cloud AI (Gemini API), which adheres to top-tier global compliance standards. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). In accordance with Google\'s enterprise data privacy commitments, your data is never stored permanently on Google servers and is deleted after processing.', 
    ko: '당사는 고품질의 기능을 제공하기 위해 글로벌 보안 표준을 준수하는 Google Cloud AI(Gemini API)를 활용합니다. 모든 데이터는 전송 및 보관 시 암호화(TLS 1.3 및 AES-256) 처리되며, 구글의 엔터프라이즈 데이터 보호 규정에 따라 구글 서버 내에 영구 저장되지 않고 처리가 완료되는 즉시 임시 캐시가 파기됩니다.',
    id: 'Untuk memberikan fitur-fitur canggih, kami menggunakan Google Cloud AI (Gemini API), yang mematuhi standar kepatuhan global tingkat atas. Semua data dienkripsi saat transit (TLS 1.3) dan saat diam (AES-256). Sesuai dengan komitmen privasi data perusahaan Google, data Anda tidak pernah disimpan secara permanen di server Google dan dihapus setelah pemrosesan.'
  },
  'ai_policy_transfer_title': { en: '4. Cross-Border Transfer', ko: '4. 데이터 국외 이전 고지', id: '4. Transfer Lintas Batas' },
  'ai_policy_transfer_desc': { 
    en: 'For AI computation purposes, data may be temporarily transferred to regions where Google’s secure data centers are located (including the United States). This cross-border transfer complies strictly with applicable data protection laws, including South Korea\'s PIPA and Indonesia\'s UU PDP.', 
    ko: 'AI 연산 처리를 위해 사용자가 입력한 데이터는 Google의 보안 데이터 센터가 위치한 국가(미국 등)로 일시적으로 전송될 수 있습니다. 이는 안정적인 AI 서비스 제공을 위한 위탁 처리이며, 현지 개인정보 보호법(한국 PIPA, 인도네시아 UU PDP 등)에 따른 안전조치를 철저히 준수합니다.',
    id: 'Untuk tujuan komputasi AI, data dapat dipindahkan sementara ke wilayah tempat pusat data aman Google berada (termasuk Amerika Serikat). Transfer lintas batas ini mematuhi secara ketat undang-undang perlindungan data yang berlaku, termasuk PIPA Korea Selatan dan UU PDP Indonesia.'
  },
  'ai_policy_liability_title': { en: '5. Limitation of Liability', ko: '5. 생성 콘텐츠의 한계 및 면책', id: '5. Batasan Tanggung Jawab' },
  'ai_policy_liability_desc': { 
    en: 'Due to the nature of AI technology, generated outputs may occasionally contain inaccurate or biased information (hallucinations). Users should independently verify critical information before relying on it for business, legal, or medical decisions. We assume no liability for consequences arising from the use of AI-generated content.', 
    ko: 'AI가 생성한 정보는 기술적 특성상 100% 정확하지 않거나 편향된 내용을 포함할 수 있습니다(환각 현상). 따라서 비즈니스, 법적, 의학적 등 중요한 결정을 내리기 전에 사용자의 최종 검토를 권장하며, 생성된 콘텐츠의 사용으로 인해 발생하는 결과에 대해 당사는 책임을 지지 않습니다.',
    id: 'Karena sifat teknologi AI, keluaran yang dihasilkan terkadang mengandung informasi yang tidak akurat atau bias (halusinasi). Pengguna harus memverifikasi informasi kritis secara independen sebelum mengandalkannya untuk keputusan bisnis, hukum, atau medis. Kami tidak bertanggung jawab atas konsekuensi yang timbul dari penggunaan konten yang dihasilkan AI.'
  },
  'usage_details': { en: 'AI Policy', ko: '인공지능 정책', id: 'Kebijakan AI' },
  'update_profile': { en: 'Update Profile', ko: '프로필 수정' },
  'profile_updated': { en: 'Profile updated successfully', ko: '프로필이 성공적으로 수정되었습니다.' },
  'save_changes': { en: 'Save Changes', ko: '변경사항 저장' },
  'usage_summary': { en: 'Usage Summary', ko: '사용현황 요약' },
  'total_api_calls': { en: 'Total API Calls', ko: '총 API 호출 수' },
  'full_name': { en: 'Full Name', ko: '이름' },
  'company_name': { en: 'Company Name', ko: '회사명' },
  'optional': { en: 'Optional', ko: '선택사항' },
  'full_name_hint': { en: '2-30 characters. Letters, spaces, and hyphens only. No numbers or special characters.', ko: '2~30자 이내. 영문/한글, 공백, 하이픈(-)만 허용됩니다. 숫자나 특수문자는 사용할 수 없습니다.' },
  'password_rules': { en: 'Password Rules', ko: '비밀번호 규칙' },
  'password_hint': { en: '8-20 characters. Must include uppercase, lowercase, number, and special character (!@#$%^&*).', ko: '8~20자 이내. 대문자, 소문자, 숫자, 특수문자(!@#$%^&*)를 포함해야 합니다.' },
  'current_password': { en: 'Current Password', ko: '현재 비밀번호' },
  'new_password': { en: 'New Password', ko: '새 비밀번호' },
  'confirm_password': { en: 'Confirm New Password', ko: '새 비밀번호 확인' },
  'password_mismatch': { en: 'Passwords do not match.', ko: '비밀번호가 일치하지 않습니다.' },
  'password_invalid': { en: 'Password does not meet the requirements.', ko: '비밀번호가 규칙에 맞지 않습니다.' },
  'update_password': { en: 'Update Password', ko: '비밀번호 변경' },
  'password_updated': { en: 'Password updated successfully.', ko: '비밀번호가 성공적으로 변경되었습니다.' },

  'role': { en: 'Role', ko: '역할' },
  'created_at': { en: 'Created At', ko: '가입일' },
  'usage': { en: 'Usage', ko: '사용량' },
  'balance': { en: 'Balance', ko: '잔액' },
  'cost': { en: 'Cost', ko: '비용' },
  'actions': { en: 'Actions', ko: '작업' },
  'active': { en: 'ACTIVE', ko: '활성' },
  'onboarding_welcome_title': { en: 'Welcome to GOGUMA Architect', ko: '고구마 아키텍트에 오신 것을 환영합니다' },
  'onboarding_welcome_desc': { en: 'I am your Master Architect. Let me guide you through the process of turning your vision into production-ready code.', ko: '저는 당신의 수석 아키텍트입니다. 당신의 비전을 실제 코드로 전환하는 과정을 안내해 드리겠습니다.' },
  'onboarding_platform_title': { en: 'Define Your Platform', ko: '플랫폼 정의' },
  'onboarding_platform_desc': { en: 'Choose between a Web application or a Mobile-first App. This determines the entire architecture logic.', ko: '웹 애플리케이션 또는 모바일 앱 중 선택하세요. 이는 전체 아키텍처 로직을 결정합니다.' },
  'onboarding_context_title': { en: 'Strategic Context', ko: '전략적 맥락' },
  'onboarding_context_desc': { en: 'Provide detailed project goals. AI uses this to build a logic map that aligns with your business intent.', ko: '상세한 프로젝트 목표를 제공하세요. AI는 이를 기반으로 비즈니스 의도에 맞는 로직 맵을 구축합니다.' },
  'onboarding_dispatch_title': { en: 'SDD Dispatch', ko: 'SDD 사출' },
  'onboarding_dispatch_desc': { en: 'Finalize your Software Design Document and dispatch it to the engine for code generation.', ko: '소프트웨어 설계 문서(SDD)를 최종 확정하고 코드 생성을 위해 엔진으로 전송합니다.' },
  'got_it': { en: 'Got it', ko: '알겠습니다' },
  'skip_tutorial': { en: 'Skip Tutorial', ko: '튜토리얼 건너뛰기' },
  'start_exploring': { en: 'Start Exploring', ko: '탐색 시작하기' },
  'inactive': { en: 'INACTIVE', ko: '비활성' },
  'loading_users': { en: 'Loading Users...', ko: '사용자 목록 로드 중...' },
  'no_users_found': { en: 'No users found', ko: '사용자를 찾을 수 없습니다' },
  'project_log_desc': { en: 'Monitor the history of all planning documents generated on the platform.', ko: '플랫폼에서 생성된 모든 기획안의 이력을 모니터링합니다.' },
  'search_projects': { en: 'Search projects...', ko: '프로젝트 검색...' },
  'untitled_project': { en: 'Untitled Project', ko: '제목 없는 프로젝트' },
  'no_description': { en: 'No description provided.', ko: '설명이 없습니다.' },
  'pages': { en: 'Pages', ko: '페이지' },
  'inspection': { en: 'Inspection', ko: '검수' },
  'no_projects_archive': { en: 'No projects found to archive', ko: '아카이브할 프로젝트가 없습니다' },

  // System Settings
  'system_settings_desc': { en: 'Manage operating policies and notices throughout the platform.', ko: '플랫폼 전반의 운영 정책 및 공지사항을 관리합니다.' },
  'maintenance_mode': { en: 'Maintenance Mode', ko: '점검 모드' },
  'maintenance_mode_desc': { en: 'When maintenance mode is activated, service access for regular users is restricted and a maintenance guide screen is displayed.', ko: '점검 모드를 활성화하면 일반 사용자의 서비스 접근이 제한되고 점검 안내 화면이 표시됩니다.' },
  'global_announcement': { en: 'Global Announcement', ko: '전체 공지사항' },
  'announcement_desc': { en: 'Enter the content of the announcement to be displayed at the top of the general user screen.', ko: '전체 사용자 화면 상단에 표시될 공지 내용을 입력하세요.' },
  'announcement_placeholder': { en: 'Enter notice content...', ko: '공지 내용을 입력하세요...' },
  'master_password_required': { en: 'Changes require master password', ko: '변경을 위해 마스터 암호가 필요합니다' },
  'apply_changes': { en: 'Apply Changes', ko: '변경사항 적용' },
  'settings_updated': { en: 'System configuration updated successfully.', ko: '시스템 설정이 성공적으로 업데이트되었습니다.' },
  'company_display_name': {
    en: 'PT. KOREAN CENTER INDONESIA',
    ko: '한국센터글로벌네트워크',
    id: 'PT. KOREAN CENTER INDONESIA'
  },
  'company_footer_id': {
    en: 'PT. KOREAN CENTER INDONESIA\nJl. Kecak, No. 12, Tonja, Denpasar, Bali, Indonesia\nEmail : master@goguma.app',
    ko: '상호명: 한국센터글로벌네트워크 | 대표자: 박기홍 | 사업자등록번호: 141-82-83410\n통신판매업신고: 제2025-부천원미-1090호 | 주소: 경기도 부천시 원미구 역곡로19번길 26, 108동 803호\n개인정보보호책임자(CPO): 박기홍 (master@goguma.app)',
    id: 'PT. KOREAN CENTER INDONESIA\nJl. Kecak, No. 12, Tonja, Denpasar, Bali, Indonesia\nEmail : master@goguma.app'
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  region: string;
  setRegion: (region: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [region, setRegion] = useState<string>('global');
  const [currency, setCurrency] = useState<string>('USD');

  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'ko') {
      document.documentElement.classList.add('lang-ko');
    } else {
      document.documentElement.classList.remove('lang-ko');
    }
  }, [language]);

  useEffect(() => {
    // Detect language and region from browser locale and timezone
    try {
      const browserLang = navigator.language.toLowerCase();
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      if (browserLang.startsWith('ko') || timeZone.includes('Seoul')) {
        setLanguage('ko');
        setRegion('korea');
        setCurrency('KRW');
        return;
      }
      if (browserLang.startsWith('id') || timeZone.includes('Jakarta')) {
        setLanguage('id');
        setRegion('indonesia');
        setCurrency('IDR');
        return;
      }
    } catch (e) {
      console.warn('Browser detection failed:', e);
    }
  }, []);

  const t = (key: string, params?: Record<string, string>) => {
    const entry = translations[key];
    if (!entry) return key;

    let text = entry[language] || entry['en'];
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, region, setRegion, currency, setCurrency, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
