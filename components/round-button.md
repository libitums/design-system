# Round Button

아이콘 하나로 자주 쓰는 명확한 행동을 실행하는 원형 버튼입니다. Neutral과 Brand 2종을 사용합니다.

## 구조

```text
Round Button
└── Icon
    └── Spinner (Loading에서 Icon을 대체)
```

## 변형

| 변형 | 용도 | 특징 |
|---|---|---|
| Neutral | 일반적인 아이콘 액션 | 중립색 아이콘 |
| Brand | 브랜드 강조가 필요한 아이콘 액션 | 브랜드색 아이콘 |

## 공통 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| 형태 | 정사각 프레임의 완전한 원 | `radius.full` |
| 배경 | `gray.100` #F7F8F9 | `color.gray.100` |
| 아이콘 정렬 | 수평·수직 중앙 | — |
| 아이콘 에셋 | `padding` 변형 | `icon.$extensions.com.libitum.iconography.variants.padding` |
| 테두리·그림자 | 없음 | — |

### 사이즈

가로와 세로는 항상 같은 고정값입니다. 아이콘의 실측 크기와 관계없이 외곽 프레임을 늘리거나 줄이지 않습니다.

| 사이즈 | 버튼 | 아이콘 | 토큰 |
|---|---:|---:|---|
| S | 28 × 28px | 16 × 16px | `icon.size.xs` |
| M | 36 × 36px | 18 × 18px | 현재 대응 토큰 없음 |
| L | 44 × 44px | 20 × 20px | `icon.size.sm` |
| XL | 56 × 56px | 24 × 24px | `icon.size.md` |

## 상태

### Neutral

| 상태 | 버튼 크기 | 배경 | 아이콘·Spinner |
|---|---|---|---|
| Default | 100% | `gray.100` #F7F8F9 | 아이콘 `fg.neutral-subtle` #868B94 |
| Pressed | 95% | `gray.100` #F7F8F9 | 아이콘 `fg.neutral-subtle` #868B94, 85% opacity |
| Disabled | 100% | `gray.50` #F9F9FA | 아이콘 `gray.500` #D1D3D8, 35% opacity |
| Loading | 100% | `gray.100` #F7F8F9 | Spinner `gray.500` #D1D3D8 |

### Brand

| 상태 | 버튼 크기 | 배경 | 아이콘·Spinner |
|---|---|---|---|
| Default | 100% | `gray.100` #F7F8F9 | 아이콘 `brand.secondary` #FF8D28 |
| Pressed | 95% | `gray.100` #F7F8F9 | 아이콘 `brand.secondary` #FF8D28, 85% opacity |
| Disabled | 100% | `gray.50` #F9F9FA | 아이콘 `brand.reward-disabled-surface` #FFF0E6, 35% opacity |
| Loading | 100% | `gray.100` #F7F8F9 | Spinner `brand.reward-disabled-surface` #FFF0E6 |

### Spinner

| 항목 | 값 | 토큰 |
|---|---|---|
| 크기 | 12 × 12px | 현재 대응 토큰 없음 |
| 선 두께 | 1.5px | `stroke.width.regular` |
| 배치 | 아이콘을 대체하고 중앙 정렬 | — |

### Focused

Focused는 Default·Pressed·Loading 위에 결합되며, focusable hit area 바깥에 공통 ring을 더합니다.

| 항목 | 값 | 토큰 |
|---|---|---|
| Inner ring | 2px solid, `white` #FFFFFF | `stroke.width.strong`, `color.white` |
| Outer ring | 2px solid, `border.strong` #141115 | `stroke.width.strong`, `color.border.strong` |
| Ring 사이 간격 | 0px | `spacing.0` |
| 전체 외곽 범위 | 4px | `spacing.4` |
| 형태 | 원형 focusable hit area의 바깥 윤곽을 따름 | `radius.full` |

S·M·L은 48 × 48 focusable hit area를, XL은 56 × 56 버튼 프레임을 ring으로 두릅니다. Disabled는 focus 순서에서 제외하고 ring을 표시하지 않습니다 — [Accessibility](../foundations/accessibility.md) 참고.

## 사용 가이드

- **아이콘만으로 행동이 분명할 때만** 씁니다. 설명이 필요하면 [Button](./button.md)의 라벨을 사용합니다.
- **접근성 이름을 반드시 제공합니다.** 화면에 라벨이 없어도 보조 기술에는 행동의 목적이 전달되어야 합니다 — [Accessibility](../foundations/accessibility.md) 참고.
- **S·M·L의 시각 크기를 hit area로 사용하지 않습니다.** 별도 영역으로 `spacing.48`의 최소 48 × 48을 확보합니다.
- **Pressed에서는 중심점을 유지한 채 95%로 축소합니다.** 주변 레이아웃은 움직이지 않습니다.
- **Loading에서는 Icon만 Spinner로 교체합니다.** 접근성 이름은 유지하고 처리 중 상태를 함께 알립니다.
