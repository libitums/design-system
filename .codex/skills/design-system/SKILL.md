---
name: design-system
description: libitum 디자인 시스템의 토큰과 컴포넌트 스펙으로 UI를 구현하거나 새 스펙을 작성할 때 사용합니다 — 버튼, 헤더, 바텀 시트, 바텀 네비게이터, 인디케이터, 색·타이포·간격·모서리·그림자·모션 토큰. Use when implementing UI from this design system, picking tokens, or authoring a new component spec.
---

# libitum Design System

## 값의 출처

**색·타이포·간격·모서리·그림자·모션 값을 직접 쓰지 마세요.** 모두 `foundations/`에 토큰으로 있습니다.

| 필요한 것 | 파일 |
|---|---|
| 색 | `foundations/color.json` |
| 폰트·크기·자간 | `foundations/typography.json` |
| 간격 (4px 리듬) | `foundations/spacing.json` |
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
| 버튼 (Solid / Shadow / Choice) | `components/action-buttons.md` |
| 하단 탭 바 | `components/bottom-navigator.md` |
| 바텀 시트 | `components/bottom-sheet.md` |
| 다이얼로그 | `components/dialog.md` |
| 학습 헤더 | `components/header/progress-header.md` |
| 뒤로가기 헤더 | `components/header/back-header.md` |
| 페이지 점 인디케이터 | `components/indicator/page-indicator.md` |
| 상태 배지 | `components/indicator/status-indicator.md` |
| 단계 인디케이터 | `components/indicator/step-indicator.md` |

## 자주 틀리는 것

- **그림자가 두 종류입니다.** 하드 섀도우 `4px 4px 0`(blur 0)는 Shadow Button 전용 장식이고, `elevation.shadow.s1~s3`는 표면의 깊이입니다. 섞지 마세요.
- **테두리는 2px, 높이 안쪽**(`border-box`)에 그립니다. 계열과 무관하게 사이즈 스케일의 높이가 유지됩니다.
- **Loading은 Default 색을 그대로 두고** 스피너만 더합니다. 스피너 색은 라벨 색의 35%이고, 라벨은 지우지 않습니다.
- **Disabled 라벨은 전 계열 `gray.400`** 입니다.
- **모서리가 배치를 뜻합니다.** 사방 12px = 여백 안쪽에 뜨는 카드, 하단만 12px = 화면 상단 밀착, 상단만 12px = 화면 하단 밀착, 상단만 16px = 바텀 시트.

## 지켜야 할 것

- **이 저장소의 문서가 기준입니다.** 원본 디자인 파일과 값이 다르면 문서를 따르고, 문서에 없는 값을 외부에서 가져오지 않습니다.
- **사용자에게 보이는 문구는 `writing-tone` 스킬**을 먼저 읽고 씁니다.
- **접근성:** 아이콘만 있는 버튼에 접근성 이름을 붙이고, 상태를 색만으로 나타내지 않으며, 인디케이터는 줄 전체를 하나의 상태로 알립니다.

## 새 스펙을 쓸 때

기존 `components/**/*.md` 두어 개를 읽고 형식을 맞추세요. 한국어로 쓰되 토큰명·상태명·컴포넌트명은 영문 그대로 두고, 색은 `` `gray.700` #575357 ``처럼 토큰명과 hex를 함께 적습니다. **변경 이력이나 해결 내역은 넣지 않습니다** — 문서는 현재 스펙만 담습니다.

전체 규칙은 저장소 루트의 `AGENTS.md`에 있습니다.
