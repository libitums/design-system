# Compact Numeric Input

숫자 1자를 직접 입력하는 고정 크기 control입니다. 한 자리 수량·횟수처럼 주변 문맥에서 의미와 단위가 분명할 때 씁니다.

## 구조

```text
Compact Numeric Input
└── Value 또는 Placeholder
```

증가·감소 버튼과 단위 라벨은 컴포넌트 내부에 두지 않습니다. 의미·단위·입력 조건은 가까운 외부 Label이나 설명으로 제공합니다.

## 공통 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| 정렬 | Value를 가로·세로 중앙 정렬 | — |
| 입력값 | 숫자 1자 | — |
| 폰트 family | Pretendard Variable과 플랫폼 fallback | `font.family.default` |
| 폰트 weight | Bold 700 | `font.weight.bold` |
| 기본 배경 | `gray.100` #F7F8F9 | `color.gray.100` |
| 기본 Value | `fg.neutral` #1A1C20 | `color.fg.neutral` |
| 그림자 | 없음 | — |

### 사이즈

너비와 높이는 고정값이며 Focused·Error의 테두리를 포함합니다.

| 사이즈 | 너비 × 높이 | Value typography | 모서리 |
|---|---:|---|---|
| S | 48 × 56px | `typography.heading.s` (18px / 24px / 0px) | `radius.md` (12px) |
| M | 64 × 72px | `typography.heading.m` (22px / 28px / -0.4px) | `radius.lg` (16px) |
| L | 72 × 80px | `typography.heading.l` (28px / 34px / -0.8px) | `radius.lg` (16px) |

## 상태

| 상태 | 배경 | Value 또는 Placeholder | 테두리 |
|---|---|---|---|
| Empty | `gray.100` #F7F8F9 | Placeholder `fg.neutral-muted` #555D6D | 없음 |
| Filled | `gray.100` #F7F8F9 | Value `fg.neutral` #1A1C20 | 없음 |
| Focused | `white` #FFFFFF | Value `fg.neutral` #1A1C20 | `stroke.width.thin` 1px, `brand.strong` #B94208 |
| Error | `feedback.incorrect-surface` #FFF0F1 | Value `feedback.incorrect-text` #A62E34 | `stroke.width.thin` 1px, `feedback.incorrect` #DF4D54 |
| Disabled | `gray.50` #F9F9FA | Value 또는 Placeholder `fg.disabled` #DCDEE3 | 없음 |

Focused와 Error 테두리는 고정 크기 안쪽에 포함합니다. Empty의 Placeholder 값은 입력 예시일 뿐 실제 값으로 제출하거나 보조 기술의 현재 값으로 알리지 않습니다.

### Focus indicator

Focused의 브랜드 테두리와 별개로 focusable hit area 바깥에 공통 focus ring을 표시합니다.

| 항목 | 값 | 토큰 |
|---|---|---|
| Inner ring | 2px solid, `white` #FFFFFF | `stroke.width.strong`, `color.white` |
| Outer ring | 2px solid, `border.strong` #141115 | `stroke.width.strong`, `color.border.strong` |
| Ring 사이 간격 | 0px | `spacing.0` |
| 전체 외곽 범위 | 4px | `spacing.4` |
| 형태 | focusable hit area의 바깥 윤곽을 따름 | 사이즈별 radius |

- Web은 `:focus-visible`에 ring을 적용합니다.
- Error가 focus를 받아도 Error의 배경·Value·테두리를 유지하고 공통 ring을 더합니다.
- Disabled는 focus 순서에서 제외하고 ring을 표시하지 않습니다.

## 동작

| 입력·조건 | 결과 |
|---|---|
| 탭·클릭 | 입력 control에 focus를 옮기고 편집을 시작 |
| 숫자 입력 | 1자를 Value로 반영하고 Filled 상태로 전환 |
| 2자 이상 입력·붙여넣기 | 첫 번째 숫자 1자만 Value로 반영 |
| 값을 모두 지움 | Empty 상태로 전환하고 Placeholder가 있으면 표시 |
| 검증 실패 | Error 상태로 전환하고 가까운 오류 문구와 오류 semantics를 함께 제공 |
| Disabled | 입력·선택·focus를 허용하지 않음 |

입력값은 숫자 1자로 제한합니다. 음수·소수·두 자리 이상 값은 허용하지 않으며, 0~9 중 실제로 허용할 범위는 제품 흐름에서 정하고 입력 전에 가까운 문구로 알립니다.

## 접근성

- **접근성 이름을 반드시 제공합니다.** 화면에 보이는 외부 Label을 연결하는 방식을 우선하고 Placeholder를 Label로 사용하지 않습니다.
- **현재 숫자 값을 programmatically 제공합니다.** 최솟값·최댓값이 있는 경우 해당 범위도 보조 기술에 전달합니다.
- **숫자 입력에 맞는 키보드를 요청하되 입력 검증을 대신하지 않습니다.** 붙여넣기와 하드웨어 키보드 입력도 같은 규칙으로 검증합니다.
- **Error를 색만으로 알리지 않습니다.** 오류 문구를 가까이 두고 오류 상태와 문구의 관계를 보조 기술에 전달합니다. 상태가 입력 중 바뀌면 적절한 시점에 알립니다.
- **모든 사이즈의 hit area는 최소 48 × 48입니다.** 보이는 프레임 전체를 하나의 control로 사용하며 다른 control의 hit area와 겹치지 않습니다 — [Accessibility](../foundations/accessibility.md) 참고.

## 사용 가이드

- **숫자 1자로 표현되는 값에만 사용합니다.** 두 자리 이상 숫자, 전화번호, 인증번호, 통화·날짜처럼 별도 형식이 필요한 값에는 일반 Text Field나 전용 입력을 사용합니다.
- **입력 경로와 관계없이 1자 제한을 적용합니다.** 직접 입력뿐 아니라 붙여넣기와 자동 완성에도 같은 규칙을 사용합니다.
- **Placeholder는 형식 예시로만 사용합니다.** 기본값이 필요하면 Placeholder가 아니라 실제 Value로 제공합니다.
- **Disabled만으로 이유를 설명하지 않습니다.** 입력할 수 없는 이유를 가까운 문구로 안내합니다.
- **컴포넌트 안에 단위를 넣지 않습니다.** 단위는 외부 Label이나 설명에 두고 읽기 순서에서 Value와 연결합니다.

색·폰트·hit area의 공통 기준은 [Color](../foundations/color.json), [Typography](../foundations/typography.json), [Accessibility](../foundations/accessibility.md)를 따릅니다.
