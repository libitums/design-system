# libitum Design System — Agent Guide

이 저장소는 libitum(어학 학습 서비스)의 디자인 시스템입니다. **실행 UI 코드가 아니라 원본 스펙과 배포 파이프라인 저장소**입니다. 토큰(JSON), 컴포넌트·지침 문서(Markdown), 아이콘 에셋(SVG), 검증·생성 도구로 이루어져 있습니다.

이 문서는 에이전트가 이 저장소를 읽고 작업할 때의 규칙입니다. 항상 로드되는 기본 규칙이며, 작업 종류에 맞는 스킬이 따로 있습니다.

| 스킬 | 언제 | 위치 |
|---|---|---|
| `design-system` | UI 구현, 토큰 선택, 새 스펙 작성 | `.codex/skills/` · `.claude/skills/` |
| `writing-tone` | 사용자에게 보이는 한국어 문구 작성·수정 | `.codex/skills/` · `.claude/skills/` |

Codex는 `.codex/skills/`, Claude Code는 `.claude/skills/`를 읽습니다. 두 디렉터리의 내용은 같으며, **한쪽을 고치면 다른 쪽도 함께 고쳐야 합니다.**

---

## 구조

```
foundations/     토큰과 원칙 — 모든 값의 출처
├── color.json            35색 (gray scale 12: gray 11 + white, brand 7, feedback 10, background 3, border 3)
├── typography.json       22 스타일 (accent / display / heading / body / caption / label / button / dialogue)
├── font-delivery.md      Web·앱 폰트 제공 · Futura 라이선스 · fallback 정책
├── accessibility.md      hit area · 대비 · 키보드 · focus · accessible semantics
├── spacing.json          Progressive primitive scale (0~96) · 컴팩트 내부 간격 2 / 6
├── stroke.json           선 두께 thin 1 / regular 1.5 / strong 2
├── layout.json           화면 여백 · 간격 3단계 · safe area
├── radius.json           sm 6 / md 12 / lg 16 / xl 24 / full
├── elevation.json        쌓임 순서 · 표면 색 · 그림자 s1~s3
├── motion.json           duration d1~d6 · easing 6종 · reduced motion
├── iconography.json      아이콘 에셋 참조 메타 · 크기 스케일
├── writing-tone.md       UX 문구 13원칙
└── international-design.md   로케일 표기 · 번역 길이 대응

components/      컴포넌트 스펙
├── button.md             Neutral / Brand / Outline / Subtle / Text
├── round-button.md       아이콘 전용 Neutral / Brand
├── bottom-navigator.md
├── bottom-sheet.md
├── dialog.md
├── header/               progress-header · back-header
└── indicator/            page · status · step

assets/icons/    SVG 815개 × 2 변형 (padding / no-padding), 12 카테고리
src/             원본 검증·package 생성 로직
scripts/         build·validate CLI 진입점
test/            파이프라인 자동 테스트
dist/            재생성 가능한 package 산출물 (Git 제외)
```

---

## 작업 전에 읽을 것

| 하려는 일 | 먼저 읽을 파일 |
|---|---|
| 컴포넌트 구현 | 해당 `components/**/*.md` → 거기 참조된 `foundations/*.json` |
| Web·앱 폰트 제공·fallback | `foundations/font-delivery.md` → `foundations/typography.json` |
| 접근성 동작·검증 | `foundations/accessibility.md` → 관련 컴포넌트 문서 |
| 사용자에게 보이는 한국어 문구 작성 | `foundations/writing-tone.md` (**필수**) |
| 날짜·숫자·통화 표기, 다국어 레이아웃 | `foundations/international-design.md` |
| 아이콘 선택·배치 | `foundations/iconography.json` |
| 새 컴포넌트 스펙 작성 | 기존 `components/**/*.md` 두어 개를 읽고 형식을 맞출 것 |
| foundation JSON 수정 | `npm run validate`와 `npm test`로 token 구조·alias를 검증할 것 |

---

## 규칙

### 1. 값을 지어내지 않는다

색·간격·선 두께·폰트·모서리는 **반드시 `foundations/`의 토큰을 쓴다.** 필요한 값이 토큰에 없으면 임의로 만들지 말고, 없다는 사실을 보고한다.

```
❌ padding: 15px            ❌ color: #F5F5F5
✅ padding: {spacing.16}    ✅ color: {color.gray.100}
```

### 2. 문서가 Figma보다 우선한다

`components/`와 `foundations/`의 값이 원본 디자인 파일과 다를 수 있다. **이 저장소의 문서가 기준이다.** 문서에 없는 값을 외부에서 가져오지 않는다.

### 3. 사용자에게 보이는 문구는 지침을 따른다

버튼 라벨, 토스트, 에러 메시지, 빈 화면, 알림 문구를 쓰거나 고칠 때는 `foundations/writing-tone.md`를 먼저 읽고, 문서 끝의 체크리스트로 검토한다. 특히 자주 어긋나는 것:

- 존칭어 최소화 — `등록할 수 있어요` (○) / `등록하실 수 있어요` (×)
- 기능의 이름보다 목적 — `채팅으로 거래하기` (○) / `채팅하기` (×)
- 버튼·라벨·타이틀에 마침표 없음
- 수는 아라비아 숫자 — `1개` (○) / `한 개` (×)

**학습 콘텐츠는 이 지침의 대상이 아니다.** 예문·지문·보기는 대상 언어 그대로 두고 UI 문구처럼 고치지 않는다.

### 4. 두 종류의 언어를 섞지 않는다

어학 서비스라 **UI 언어**와 **학습 대상 언어**가 한 화면에 공존한다. 학습 콘텐츠(예문, 지문, 보기)는 번역 대상이 아니며 대상 언어의 `lang` 속성이 필요하다. `foundations/international-design.md` 참고.

### 5. 그림자는 표면의 깊이에만 쓴다

- **부드러운 그림자** `elevation.shadow.s1~s3`로 표면의 깊이를 표현한다.
- Button과 Round Button에는 그림자를 쓰지 않는다.

### 6. 접근성은 선택이 아니다

- 공통 기준은 `foundations/accessibility.md`를 따른다.
- custom interactive element의 hit area는 최소 48 × 48이며 `spacing.48`을 사용한다.
- Focused는 `white` 2px inner ring과 `border.strong` 2px outer ring을 함께 쓰고, Disabled에는 표시하지 않는다.
- 밝은 표면의 일반 텍스트는 `fg.neutral-muted` 이상, 의미 있는 아이콘·UI 그래픽은 `fg.neutral-subtle` 이상을 사용한다.
- 아이콘만 있는 버튼에는 접근성 이름을 붙인다.
- 상태를 **색만으로** 나타내지 않는다. 점·아이콘·라벨을 함께 둔다.
- 인디케이터는 개별 요소가 아니라 줄 전체를 하나의 상태로 알린다.

---

## 스펙 문서를 새로 쓸 때

기존 문서와 같은 형식을 지킨다.

1. 한 줄 요약 — 무엇이고 언제 쓰는가
2. `## 구조` — 코드블록 트리
3. 영역별 스펙 표 — `항목 | 값 | 토큰` 3열, 값과 토큰명을 함께 적는다
4. `## 상태` — Default / Pressed / Disabled / Loading 등
5. `## 사용 가이드` — 굵은 글씨로 시작하는 규칙 문장
6. 관련 문서로 상대 경로 링크

지키는 것:

- **한국어로 쓴다.** 토큰명·상태명·컴포넌트명은 영문 그대로 둔다.
- **색은 토큰명과 hex를 함께** 적는다 — `` `gray.700` #868B94 ``
- **해결 내역·변경 이력을 문서에 넣지 않는다.** 문서는 현재 스펙만 담는다.
- **외부 링크(Figma 등)를 넣지 않는다.** 저장소 안에서 완결되어야 한다.

---

## 아직 없는 것

작업 중 필요해지면 만들지 말고 먼저 보고할 것.

- **dark mode** — `color.json`은 라이트 모드 단일 값이다.
- **Futura Webfont·App 라이선스** — 정확한 foundry·제품·weight·플랫폼별 사용 범위가 확인되기 전에는 파일, `@font-face`, native registration, preload를 추가할 수 없다. `foundations/font-delivery.md`를 따른다.
- **지원 로케일 확정** — `international-design.md`의 로케일 표는 참고용 기준값이다.
