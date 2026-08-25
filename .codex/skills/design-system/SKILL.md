---
name: design-system
description: libitum 디자인 시스템의 토큰과 컴포넌트 스펙으로 UI를 구현하거나 새 스펙을 작성할 때 사용합니다 — 버튼, 헤더, 바텀 시트, 바텀 네비게이터, 인디케이터, 색·타이포·간격·선 두께·모서리·그림자·모션 토큰. Use when implementing UI from this design system, picking tokens, or authoring a new component spec.
---

# libitum Design System

## 값의 출처

**색·타이포·간격·선 두께·모서리·그림자·모션 값을 직접 쓰지 마세요.** 모두 `foundations/`에 토큰으로 있습니다.

| 필요한 것 | 파일 |
|---|---|
| 색 | `foundations/color.json` |
| 폰트·크기·자간 | `foundations/typography.json` |
| Web·앱 폰트 제공·fallback | `foundations/font-delivery.md` |
| hit area·대비·키보드·semantics | `foundations/accessibility.md` |
| 간격 (0~96 progressive scale) | `foundations/spacing.json` |
| 선 두께 (thin / regular / strong) | `foundations/stroke.json` |
| 화면 여백 · safe area | `foundations/layout.json` |
| 모서리 | `foundations/radius.json` |
| 쌓임 순서 · 표면 · 그림자 | `foundations/elevation.json` |
| duration · easing | `foundations/motion.json` |
| 아이콘 에셋 · 크기 | `foundations/iconography.json` |

```
❌ padding: 15px            ❌ color: #F5F5F5
✅ padding: {spacing.16}    ✅ color: {color.gray.100}
```

토큰에 없는 값이 필요하면 **만들지 말고 없다고 보고하세요.**

## 컴포넌트

구현 전에 해당 스펙 문서를 **전부** 읽으세요. 상태·사이즈·예외가 표로 정리되어 있습니다.

| 컴포넌트 | 문서 |
|---|---|
| 버튼 (Neutral / Brand / Outline / Subtle / Text) | `components/button.md` |
| 라운드 버튼 (Neutral / Brand) | `components/round-button.md` |
| 하단 탭 바 | `components/bottom-navigator.md` |
| 바텀 시트 | `components/bottom-sheet.md` |
| 다이얼로그 | `components/dialog.md` |
| 학습 헤더 | `components/header/progress-header.md` |
| 뒤로가기 헤더 | `components/header/back-header.md` |
| 페이지 점 인디케이터 | `components/indicator/page-indicator.md` |
| 상태 배지 | `components/indicator/status-indicator.md` |
| 단계 인디케이터 | `components/indicator/step-indicator.md` |

## 자주 틀리는 것

- **Button과 Round Button에는 그림자를 쓰지 않습니다.** 표면 깊이가 필요한 다른 컴포넌트만 `elevation.shadow.s1~s3`를 씁니다.
- **Outline 테두리 `stroke.width.thin` 1px는 실제 크기에 포함됩니다.** Hug 너비와 높이는 `components/button.md`의 산식으로 계산합니다.
- **Loading은 변형별 색을 따릅니다.** Button은 라벨을 유지하고, Round Button은 아이콘을 Spinner로 교체합니다.
- **Disabled 색은 변형별로 다릅니다.** 공통값으로 치환하지 말고 각 상태 표를 확인합니다.
- **밝은 표면의 일반 텍스트는 `fg.neutral-muted` 이상**을 씁니다. `fg.neutral-subtle`은 의미 있는 아이콘·UI 그래픽에, `fg.neutral-subtlest`는 장식·Disabled 표현에만 사용합니다.
- **브랜드 대비:** 밝은 표면의 브랜드 전경은 `fg.brand`, 강한 브랜드 표면·그래픽은 `brand.strong`을 사용합니다.
- **Futura 파일은 플랫폼별 라이선스 확인 전까지 배포하지 않습니다.** Webfont 라이선스와 App 라이선스를 구분하며, 앱은 허용된 파일이 없으면 Accent도 Pretendard 기반 Default로 fallback합니다.
- **2px와 6px 간격은 컴팩트 컴포넌트 내부에만 씁니다.** 일반적인 컴포넌트와 레이아웃은 8px 이상의 4px 리듬을 따릅니다.
- **모서리가 배치를 뜻합니다.** 사방 12px = 여백 안쪽에 뜨는 카드, 하단만 12px = 화면 상단 밀착, 상단만 12px = 화면 하단 밀착, 상단만 16px = 바텀 시트.

## 지켜야 할 것

- **이 저장소의 문서가 기준입니다.** 원본 디자인 파일과 값이 다르면 문서를 따르고, 문서에 없는 값을 외부에서 가져오지 않습니다.
- **사용자에게 보이는 문구는 `writing-tone` 스킬**을 먼저 읽고 씁니다.
- **접근성:** `foundations/accessibility.md`를 따릅니다. custom control은 `spacing.48`의 최소 hit area를 확보하고, Focused에는 `white`·`border.strong` 2px ring을 함께 쓰며, Disabled에는 ring을 표시하지 않습니다. 아이콘만 있는 버튼에 접근성 이름을 붙이고 상태를 색만으로 나타내지 않습니다.

## 새 스펙을 쓸 때

기존 `components/**/*.md` 두어 개를 읽고 형식을 맞추세요. 한국어로 쓰되 토큰명·상태명·컴포넌트명은 영문 그대로 두고, 색은 `` `gray.700` #868B94 ``처럼 토큰명과 hex를 함께 적습니다. **변경 이력이나 해결 내역은 넣지 않습니다** — 문서는 현재 스펙만 담습니다.

전체 규칙은 저장소 루트의 `AGENTS.md`에 있습니다. 문구 작업은 `/writing-tone` 스킬을 함께 부르세요.
