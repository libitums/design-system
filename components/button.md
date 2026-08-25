# Button

텍스트 라벨로 사용자의 행동을 실행하는 버튼입니다. Neutral, Brand, Outline, Subtle, Text 5종을 사용합니다.

## 구조

```text
Button
├── Spinner (Loading에서만)
├── Label
└── Icon (선택, 앞 또는 뒤 1개)
```

## 변형

| 변형 | 용도 | 특징 |
|---|---|---|
| Neutral | 일반 화면의 주 액션 | 중립색 고강조 표면 |
| Brand | 브랜드가 중요한 주 액션 | 브랜드색 고강조 표면 |
| Outline | 보조 액션 | 흰 배경과 1px (`stroke.width.thin`) 테두리 |
| Subtle | 낮은 강조의 보조 액션 | 연한 중립색 표면 |
| Text | 건너뛰기·취소 등 최소 강조 액션 | 배경과 테두리 없음 |

## 공통 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| 정렬 | 라벨·아이콘을 수평·수직 중앙 정렬 | — |
| 라벨 폰트 | Pretendard Variable SemiBold 600 | `typography.button.*` |
| 아이콘 위치 | 라벨 앞 또는 뒤 1개 | — |
| 아이콘 ↔ 라벨 간격 | 8px | `spacing.8` |
| Spinner ↔ 라벨 간격 | 6px | `spacing.6` |
| Outline 테두리 | 1px, 레이아웃 크기에 포함 | `stroke.width.thin` |
| 그림자 | 없음 | — |

`spacing.6`은 Spinner와 Label처럼 컴팩트한 요소 사이에만 사용합니다. 일반적인 아이콘과 라벨 사이에는 기본 inline 간격인 `spacing.8`을 사용합니다.

### 사이즈

표의 높이는 라벨 line-height와 세로 padding으로 계산한 **실제 프레임 높이**입니다. Outline은 `stroke.width.thin` 1px가 양쪽에 더해집니다.

| 사이즈 | 기본 높이 | Outline 높이 | 가로 / 세로 padding | 모서리 | 라벨 토큰 |
|---|---:|---:|---|---|---|
| S | 28px | 30px | 12px / 6px (`spacing.12` / `spacing.6`) | 12px `radius.md` | `typography.button.s` |
| M | 36px | 38px | 16px / 8px | 12px `radius.md` | `typography.button.m` |
| L | 44px | 46px | 20px / 12px | 16px `radius.lg` | `typography.button.l` |
| XL | 56px | 58px | 24px / 16px | 16px `radius.lg` | `typography.button.xl` |

### 너비

너비 모드는 `Hug`와 `Fill` 2가지입니다.

| 모드 | 계산 규칙 | 용도 |
|---|---|---|
| Hug | 콘텐츠 실측 너비 + 좌우 padding + 선택 아이콘 너비 + 아이콘 간격 + Outline 테두리 | 내용에 맞게 너비가 변하는 버튼 |
| Fill | 부모가 제공하는 너비를 채우고 콘텐츠를 가운데 정렬 | 바텀 시트·다이얼로그처럼 가로로 채우는 버튼 |

`Hug`의 실제 너비는 다음 식으로 계산합니다.

```text
기본 너비 = 라벨 실측 너비 + (가로 padding × 2)
아이콘 포함 = 기본 너비 + 아이콘 실측 너비 + spacing.8
Outline = 위 계산값 + (stroke.width.thin × 2)
Loading = 기본 너비 + Spinner 12px + spacing.6
```

Pretendard Variable을 기준으로 검증한 예시입니다.

| 예시 | 계산 | 실제 너비 |
|---|---|---:|
| S Neutral `Continue` | 52 + (12 × 2) | 76px |
| S Outline `Continue` | 52 + (12 × 2) + (1 × 2) | 78px |
| XL Neutral `Continue` + 15px 아이콘 | 68 + (24 × 2) + 15 + 8 | 139px |

**고정 프레임 너비를 Hug 스펙으로 사용하지 않습니다.** Figma나 구현의 프레임 너비가 위 산식과 다르면, 명시적으로 `Fill`을 쓰는 경우를 제외하고 라벨을 해당 폰트로 다시 측정해 산식에 맞춥니다.

## 상태

Loading은 라벨을 유지하고 앞에 12px Spinner를 둡니다.

### Neutral

| 상태 | 배경 | 라벨 | Spinner |
|---|---|---|---|
| Default | `gray.800` #555D6D | `gray.50` #F9F9FA | — |
| Pressed | `gray.800` #555D6D | `gray.50` #F9F9FA | — |
| Disabled | `gray.50` #F9F9FA | `fg.disabled` #DCDEE3 | — |
| Loading | `gray.800` #555D6D | `gray.50` #F9F9FA | `gray.50` #F9F9FA, 35% opacity |

### Brand

| 상태 | 배경 | 라벨 | Spinner |
|---|---|---|---|
| Default | `brand.primary` #F46B18 | `gray.50` #F9F9FA | — |
| Pressed | `brand.primary` #F46B18 | `gray.50` #F9F9FA | — |
| Disabled | `gray.50` #F9F9FA | `fg.disabled` #DCDEE3 | — |
| Loading | `brand.primary` #F46B18 | `gray.50` #F9F9FA | `gray.50` #F9F9FA, 35% opacity |

### Outline

| 상태 | 배경 | 테두리 | 라벨 | Spinner |
|---|---|---|---|---|
| Default | `white` #FFFFFF | `border.default` #848184 | `fg.neutral-subtle` #868B94 | — |
| Pressed | `gray.100` #F7F8F9 | `border.default` #848184 | `fg.neutral-muted` #555D6D | — |
| Disabled | `gray.50` #F9F9FA | `border.disabled` #B7B4B8 | `fg.disabled` #DCDEE3 | — |
| Loading | `white` #FFFFFF | `border.default` #848184 | `fg.neutral-subtle` #868B94 | `border.disabled` #B7B4B8 |

### Subtle

| 상태 | 배경 | 라벨 | Spinner |
|---|---|---|---|
| Default | `gray.100` #F7F8F9 | `fg.neutral-subtle` #868B94 | — |
| Pressed | `gray.300` #EEEFF1 | `gray.900` #2A3038 | — |
| Disabled | `gray.50` #F9F9FA | `gray.300` #EEEFF1 | — |
| Loading | `gray.100` #F7F8F9 | `fg.neutral-subtle` #868B94 | `fg.neutral-subtle` #868B94 |

### Text

| 상태 | 라벨 | Spinner |
|---|---|---|
| Default | `fg.brand` #F46B18 | — |
| Pressed | `brand.primary-pressed` #B94208 | — |
| Disabled | `gray.300` #EEEFF1 | — |
| Loading | `brand.secondary` #FF8D28 | `brand.secondary` #FF8D28 |

### Focused

Focused는 위 상태의 색·크기·Spinner를 유지한 채 focusable hit area 바깥에 ring을 더합니다.

| 항목 | 값 | 토큰 |
|---|---|---|
| Inner ring | 2px solid, `white` #FFFFFF | `stroke.width.strong`, `color.white` |
| Outer ring | 2px solid, `border.strong` #141115 | `stroke.width.strong`, `color.border.strong` |
| Ring 사이 간격 | 0px | `spacing.0` |
| 전체 외곽 범위 | 4px | `spacing.4` |
| 형태 | focusable hit area의 바깥 윤곽을 따름 | 버튼과 같은 radius |

- Default·Pressed·Loading은 Focused와 결합할 수 있습니다.
- Disabled는 focus 순서에서 제외하고 ring을 표시하지 않습니다.
- Text도 라벨 글자만 두르지 않고 최소 48 × 48 focusable hit area를 두릅니다.
- Web은 `:focus-visible`에 적용합니다 — [Accessibility](../foundations/accessibility.md) 참고.

## 사용 가이드

- **한 화면의 최상위 버튼은 Neutral 또는 Brand 중 하나만** 둡니다.
- **모든 사이즈의 hit area는 최소 48 × 48입니다.** S·M·L의 시각 높이는 유지하고 부모 control이나 투명 padding으로 `spacing.48`을 확보합니다 — [Accessibility](../foundations/accessibility.md) 참고.
- **버튼 너비는 라벨을 실제 폰트로 측정해 계산합니다.** 텍스트를 바꾸면서 이전 고정 너비를 유지하지 않습니다.
- **Fill 버튼에서도 좌우 padding을 보장합니다.** 번역으로 라벨이 길어지면 줄바꿈하지 말고 상위 레이아웃을 조정합니다.
- **Loading 중에도 라벨을 유지합니다.** 무엇을 기다리는지 알 수 있어야 합니다.
- **Disabled만으로 이유를 설명하지 않습니다.** 누를 수 없는 이유를 가까운 문구로 함께 안내합니다.
- **라벨은 `foundations/writing-tone.md`를 따릅니다.** 기능 이름보다 목적을 말하고 마침표를 붙이지 않습니다.

아이콘만 사용하는 액션은 [Round Button](./round-button.md)을 참고합니다.
