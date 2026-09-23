# Stat Button

학습 지표 하나를 아이콘과 수로 요약해 보여주고, 누르면 그 지표의 자세한 기록을 여는 작은 버튼입니다. 학습 메인 화면 상단처럼 지표를 항상 보여줘야 하는 자리에 씁니다.

## 구조

```text
Stat Button
├── Icon
└── Count
```

Stat Button은 Icon과 Count만 포함합니다. 지표의 이름과 설명은 버튼 안에 넣지 않고 눌러서 여는 표면이 설명합니다.

## 옵션

각 옵션은 독립적으로 조합합니다. 조합 전체를 별도 variant로 만들지 않습니다.

| 옵션 | 값 | 용도 |
|---|---|---|
| Metric | Streak / Trophy / Gem | 어떤 지표를 요약하는지 |

### 조합 규칙

- Metric마다 Icon과 색이 정해져 있습니다. 다른 아이콘이나 색으로 바꾸지 않습니다.
- Count에는 수만 넣습니다. `3일`이나 `+2`처럼 단위·증감을 붙이지 않고, 단위는 접근성 이름과 여는 표면이 설명합니다.
- 한 화면에서 같은 Metric을 두 번 두지 않습니다.
- 지표가 늘어나도 한 줄에 4개를 넘기지 않습니다. 넘으면 지표를 한 표면으로 모읍니다.

## 공통 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| 배경 | `white` #FFFFFF | `color.white` |
| 테두리 | 2px, `gray.50` #F9F9FA, 레이아웃 크기에 포함 | `stroke.width.strong`, `color.gray.50` |
| 모서리 | 6px | `radius.sm` |
| 가로 padding | 12px | `spacing.12` |
| 세로 padding | 6px | `spacing.6` |
| Icon ↔ Count 간격 | 2px | `spacing.2` |
| Icon 크기 | 24 × 24px | `icon.size.md` |
| 아이콘 에셋 | `padding` 변형 | `icon.$extensions.com.libitum.iconography.variants.padding` |
| Count 폰트 | Pretendard Variable SemiBold 600, 12px / 16px / 0.12px | `typography.button.s` |
| 정렬 | Icon과 Count를 세로 중앙, 가로로 나란히 | — |
| 그림자 | 없음 | — |
| 너비 | 콘텐츠 실측 너비 | — |
| hit area | 최소 48 × 48px | `spacing.48` |

높이는 다음 식으로 계산합니다.

```text
높이 = Count line-height + (세로 padding × 2) + (stroke.width.strong × 2)
```

기본값은 32px이며 `spacing.32`와 같습니다. 가로 padding은 Metric과 관계없이 12px로 같습니다. Count의 자릿수가 늘면 너비만 늘어나고 높이는 변하지 않습니다. 세로 padding 6px과 간격 2px은 이 컴포넌트처럼 컴팩트한 요소 안에서만 사용합니다.

### Metric

| Metric | Icon | Icon 색 | Count 색 |
|---|---|---|---|
| Streak | `4-nature/fire` | `brand.secondary` #FF8D28 | `brand.strong` #B94208 |
| Trophy | `1-game/trophy` | `feedback.warning` #FFC500 | `feedback.warning-text` #2A3038 |
| Gem | `2-items/diamond` | `brand.gem` #00C3FF | `brand.gem-text` #2A3038 |

Icon은 지표의 성격을 색으로 전하고, Count는 읽을 수 있는 대비를 가진 색을 씁니다. 두 색을 서로 바꾸지 않습니다.

## 상태

| 상태 | 배경 | 테두리 | Icon·Count |
|---|---|---|---|
| Default | `white` #FFFFFF | 2px, `gray.50` #F9F9FA | Metric의 색 |
| Pressed | `gray.100` #F7F8F9 | 2px, `gray.50` #F9F9FA | Metric의 색 |
| Disabled | `gray.50` #F9F9FA | 2px, `gray.50` #F9F9FA | `fg.disabled` #DCDEE3 |

- Pressed는 크기를 바꾸지 않고 배경만 한 단계 어둡게 합니다. [Button](./button.md)의 Outline과 같은 규칙입니다.
- 값을 아직 받지 못했으면 Disabled로 두지 않고 `0`을 표시합니다. 자리를 비우거나 버튼을 감추지 않습니다.
- 색 전환은 `motion.duration.color` 150ms, Pressed는 `motion.duration.pressed` 150ms와 `motion.easing.easing`을 사용합니다.

### 대비

| 조합 | 대비 |
|---|---:|
| Streak Count ↔ `white` 배경 | 5.461:1 |
| Trophy Count ↔ `white` 배경 | 13.312:1 |
| Gem Count ↔ `white` 배경 | 13.312:1 |
| Streak Icon ↔ `white` 배경 | 2.310:1 (승인된 예외) |
| Trophy Icon ↔ `white` 배경 | 1.586:1 (승인된 예외) |
| Gem Icon ↔ `white` 배경 | 2.049:1 (승인된 예외) |
| 테두리 ↔ `white` 표면 | 1.052:1 (승인된 예외) |

Count는 12px 일반 텍스트이므로 4.5:1을 적용하고 세 Metric 모두 충족합니다. Icon과 테두리는 기준에 미달하며 적용 범위와 기록 방식은 [Accessibility의 시각 예외](../foundations/accessibility.md#시각-예외)를 따릅니다.

### Focus indicator

Focused는 상태의 색과 크기를 유지한 채 focusable hit area 바깥에 공통 focus ring을 더합니다.

| 항목 | 값 | 토큰 |
|---|---|---|
| Inner ring | 2px solid, `white` #FFFFFF | `stroke.width.strong`, `color.white` |
| Outer ring | 2px solid, `border.strong` #141115 | `stroke.width.strong`, `color.border.strong` |
| Ring 사이 간격 | 0px | `spacing.0` |
| 전체 외곽 범위 | 4px | `spacing.4` |
| 형태 | focusable hit area의 바깥 윤곽을 따름 | `radius.sm` |

- Web은 `:focus-visible`에 ring을 적용합니다. ReactLynx는 [Consuming의 ReactLynx 구현 참고](../CONSUMING.md#reactlynx-구현-참고)를 따릅니다.
- Disabled는 focus 순서에서 제외하고 ring을 표시하지 않습니다.

## 동작

| 입력·조건 | 결과 |
|---|---|
| 탭·클릭·Enter·Space | 화면을 Scrim으로 덮고 그 위에 지표의 기록 표면을 엶 |
| 표면을 닫음 | Stat Button으로 focus를 되돌림 |
| 값이 바뀜 | Count를 갱신하고 바뀐 값을 announcement로 알림 |
| Disabled | 입력·focus를 허용하지 않음 |

기록 표면은 [Bottom Sheet](./bottom-sheet.md) 또는 [Dialog](./dialog.md)를 사용하고, 뒤를 덮는 층은 [Overlay](./overlay.md)의 Screen 조합을 그대로 씁니다. Scrim 색과 불투명도는 Overlay 스펙의 값을 따르며 Stat Button이 따로 정하지 않습니다.

## 접근성

- **접근성 이름에 수와 목적을 함께 넣습니다.** `연속 학습 3일, 자세히 보기`처럼 무엇의 수인지와 누르면 무엇이 되는지를 알립니다. 화면의 수만 읽어서는 뜻을 알 수 없습니다.
- **Icon은 접근성 트리에서 숨깁니다.** 지표의 종류는 이름이 전달합니다.
- **최소 hit area는 48 × 48입니다.** 보이는 높이 32px은 그대로 두고 투명 영역으로 확보합니다 — [Accessibility](../foundations/accessibility.md) 참고.
- **지표를 색만으로 구분하지 않습니다.** Streak·Trophy·Gem은 아이콘 모양과 접근성 이름으로 구분합니다.
- **표면을 열면 focus를 그 안으로 옮깁니다.** 닫으면 열기 전의 Stat Button으로 되돌립니다. 자세한 규칙은 여는 표면의 스펙을 따릅니다.
- **값이 바뀌면 조용히 바꾸지 않습니다.** 학습을 마쳐 수가 늘면 바뀐 값을 보조 기술에 알립니다.
- **수는 로케일 표기를 따릅니다.** 자릿수 구분과 단위 표기는 [International Design](../foundations/international-design.md)을 따릅니다.

## 확장

Stat Button은 지표 하나의 요약과 실행만 소유하고, 새 요구는 다음 규칙으로 확장합니다.

1. **새 Metric은 Icon과 두 색을 함께 정합니다.** Icon 색은 지표의 성격을, Count 색은 4.5:1 이상을 만족하는 값을 고릅니다. 기준을 넘는 조합이 토큰에 없으면 임의 hex를 만들지 않고 보고합니다.
2. **증감 표시는 버튼 안에 넣지 않습니다.** 어제보다 얼마나 늘었는지는 눌러서 여는 표면에서 알립니다.
3. **지표 묶음은 상위 화면이 배치합니다.** 여러 Stat Button 사이의 간격과 정렬은 학습 메인 화면의 레이아웃에서 정의합니다.
4. **새 Size가 필요하면 padding과 폰트를 토큰에서 고릅니다.** 높이는 위 산식으로 계산하고 hit area 48 × 48을 다시 확인합니다.
5. **누를 수 없는 요약 표시는 Stat Button이 아닙니다.** 상세를 열 수 없는 지표는 control로 만들지 않고 텍스트로 표시합니다.

## 사용 가이드

- **항상 보여야 하는 지표에만 사용합니다.** 화면 상단에서 학습을 이어갈 동기를 주는 지표를 고릅니다.
- **수를 가공하지 않습니다.** 반올림하거나 `99+`로 줄이지 않고 실제 값을 보여줍니다. 자릿수가 길어지면 너비가 늘어나는 것을 허용합니다.
- **0도 그대로 보여줍니다.** 아직 기록이 없다는 사실도 정보이므로 버튼을 감추지 않습니다.
- **버튼 안에 설명 문구를 넣지 않습니다.** 설명이 필요하면 여는 표면에서 [Writing Tone](../foundations/writing-tone.md)에 맞춰 씁니다.

색·간격·모서리·선 두께·동작은 [Color](../foundations/color.json), [Spacing](../foundations/spacing.json), [Radius](../foundations/radius.json), [Stroke](../foundations/stroke.json), [Motion](../foundations/motion.json), 아이콘은 [Iconography](../foundations/iconography.json), 접근성은 [Accessibility](../foundations/accessibility.md)를 참고합니다.
