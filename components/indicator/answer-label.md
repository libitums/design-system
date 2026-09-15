# Answer Label

학습자가 제출한 답안의 판정 결과를 문제 가까이에 보여주는 라벨입니다. 답을 기다리는 Pending과 판정이 끝난 Correct·Incorrect를 Result로 두고, Emphasis와 Size를 서로 독립적으로 조합합니다. 챕터·레슨처럼 학습 항목 전체의 진행 상태는 [Status Indicator](./status-indicator.md)를 씁니다.

## 구조

```text
Answer Label
├── Icon (Result에 따라 표시)
└── Label
```

Answer Label은 Icon과 Label만 포함합니다. 문제 번호, 해설, 정답 보기, 다시 풀기 Button은 상위 문제 영역이 조합하며 Answer Label의 padding이나 너비에 포함하지 않습니다.

## 옵션

각 옵션은 독립적으로 조합합니다. 조합 전체를 별도 variant로 만들지 않습니다.

| 옵션 | 값 | 용도 |
|---|---|---|
| Result | Pending / Correct / Incorrect | 답안의 판정 단계와 결과 |
| Emphasis | Solid / Subtle | 화면 안에서의 강조 수준 |
| Size | S / M / L | 주변 콘텐츠 밀도에 맞춘 크기 |
| Label | Result 기본 문구 / 과제별 문구 | 판정 결과를 말하는 UI 문구 |

Tone과 Icon은 옵션이 아니라 Result가 결정합니다. 사용처에서 Result와 다른 Tone이나 Icon을 직접 지정하지 않습니다.

### 조합 규칙

- Result는 한 번에 하나만 가집니다.
- Correct·Incorrect는 Icon과 Label을 항상 함께 표시합니다. Icon이나 Label 한쪽만 남기지 않습니다.
- Pending은 Icon 없이 Label만 표시하고, Icon 자리와 간격을 함께 제거합니다.
- Label 문구는 Result의 의미를 바꾸지 않는 범위에서 과제에 맞게 바꿀 수 있습니다. Incorrect를 `아쉬워요`처럼 판정이 드러나지 않는 문구로 쓰지 않습니다.
- 같은 목록 안에서는 Emphasis와 Size를 섞지 않습니다.

## 공통 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| 너비 | 콘텐츠에 맞게 줄어듦 | — |
| 높이 | Size의 최소 높이, 콘텐츠가 더 크면 콘텐츠와 세로 padding에 맞게 늘어남 | — |
| 정렬 | Icon과 Label을 가로·세로 중앙 정렬 | — |
| Icon ↔ Label 간격 | 8px | `spacing.8` |
| Icon 에셋 | `padding` 변형 | `icon.$extensions.com.libitum.iconography.variants.padding` |
| Label 폰트 | Pretendard Variable Bold 700 | `typography.label.*` |
| Label 줄 수 | 한 줄, 가용 너비를 넘으면 줄바꿈 | — |
| 테두리 | 없음 | — |
| 그림자 | 없음 | — |

너비와 높이는 다음 식으로 계산합니다.

```text
기본 너비 = Label 실측 너비 + (가로 padding × 2)
Icon 포함 = 기본 너비 + Icon 크기 + spacing.8
높이 = max(최소 높이, Label line-height + (세로 padding × 2))
```

글자 크기를 확대하거나 번역 문구가 길어져도 높이를 고정하거나 Label을 말줄임하지 않습니다.

## Size

| Size | 최소 높이 | 가로 / 세로 padding | Icon | Label | 모서리 |
|---|---:|---|---|---|---|
| S | 32px | 12px / 8px (`spacing.12` / `spacing.8`) | 16px `icon.size.xs` | `typography.label.m` 12px / 16px / 0.12px | 12px `radius.md` |
| M | 40px | 12px / 8px (`spacing.12` / `spacing.8`) | 20px `icon.size.sm` | `typography.label.l` 14px / 20px / 0px | 12px `radius.md` |
| L | 48px | 16px / 12px (`spacing.16` / `spacing.12`) | 24px `icon.size.md` | `typography.label.xl` 16px / 24px / 0px | 16px `radius.lg` |

- M은 문제를 푸는 화면의 기본값입니다. 기본 글자 크기에서는 콘텐츠와 padding의 합이 36px이므로 40px 안에서 세로 중앙 정렬합니다.
- S는 결과 요약·오답 노트처럼 여러 판정이 반복되는 목록에 사용합니다.
- L은 문제 하나의 결과에 집중하는 화면이나 말하기 과제처럼 화면에서 떨어져서도 결과를 확인해야 할 때 사용합니다.
- Icon 크기는 Label line-height와 같게 맞춥니다. Size를 추가할 때도 이 관계와 위 높이 산식을 유지합니다.

## Emphasis

| Emphasis | 용도 |
|---|---|
| Solid | 방금 제출한 답의 결과를 바로 알림. 문제를 푸는 화면의 기본값 |
| Subtle | 결과 요약·오답 노트처럼 여러 판정을 한눈에 비교하는 목록 |

Subtle의 Brand 배경은 `elevation.surface.floating`과 같은 값입니다. 바텀 시트·다이얼로그처럼 floating 표면 위에서는 라벨 경계가 사라지므로 Solid를 사용합니다.

## 상태

### Result

Result는 판정의 의미를 정의하고, 색은 Tone에 위임합니다.

| Result | 의미 | Tone | Icon | 기본 Label |
|---|---|---|---|---|
| Pending | 학습자의 답을 기다림 | Brand | 없음 | 과제별 문구, 예: `잘 들어 보세요`, `말해 보세요` |
| Correct | 제출한 답이 정답으로 판정됨 | Positive | `8-ui/tick` | `정답이에요` |
| Incorrect | 제출한 답이 오답으로 판정됨 | Negative | `8-ui/cross` | `오답이에요` |

### Tone

Tone은 Emphasis별 배경·전경 색 묶음입니다. Icon과 Label은 같은 전경색을 사용합니다.

| Tone | Solid 배경 | Solid 전경 | Subtle 배경 | Subtle 전경 |
|---|---|---|---|---|
| Brand | `brand.strong` #B94208 | `fg.neutral-inverted` #FFFFFF | `background.elevated` #FFF3EA | `fg.brand` #B94208 |
| Positive | `feedback.correct-text` #206541 | `fg.neutral-inverted` #FFFFFF | `feedback.correct-surface` #EDFFF3 | `feedback.correct-text` #206541 |
| Negative | `feedback.incorrect-strong-surface` #A62E34 | `fg.neutral-inverted` #FFFFFF | `feedback.incorrect-surface` #FFF0F1 | `feedback.incorrect-text` #A62E34 |

전경과 배경의 대비는 다음과 같습니다.

| Tone | Solid | Subtle |
|---|---:|---:|
| Brand | 5.461:1 | 5.008:1 |
| Positive | 7.002:1 | 6.735:1 |
| Negative | 6.859:1 | 6.201:1 |

Label은 모든 Size에서 18.67px 미만의 Bold 텍스트이므로 일반 텍스트 기준 4.5:1을 적용합니다. `brand.primary` #F46B18, `feedback.correct` #35A66F, `feedback.incorrect` #DF4D54는 흰 전경과 4.5:1 미만이므로 Answer Label의 배경으로 쓰지 않습니다. [Accessibility의 Brand Button 예외](../../foundations/accessibility.md#brand-button-예외)도 적용하지 않습니다.

### 전환

| 전환 | 조건 |
|---|---|
| Pending → Correct | 제출한 답이 정답으로 판정됨 |
| Pending → Incorrect | 제출한 답이 오답으로 판정됨 |
| Incorrect → Pending | 같은 문제를 다시 풀기 시작함 |

Correct는 해당 문제의 마지막 Result입니다. 다음 문제로 넘어가면 새 문제의 Answer Label은 Pending에서 시작합니다.

Answer Label은 누를 수 없는 표시 요소이므로 Pressed·Focused·Disabled 상태가 없습니다.

## 동작

| 입력·조건 | 결과 |
|---|---|
| 문제가 열림 | Pending으로 표시 |
| 답을 제출해 판정이 끝남 | Correct 또는 Incorrect로 바뀌고 결과를 알림 |
| 다시 풀기 시작 | Incorrect에서 Pending으로 돌아감 |
| 다음 문제로 이동 | 새 문제의 Answer Label이 Pending에서 시작 |
| 긴 Label·큰 글자 | 너비와 높이가 콘텐츠에 맞게 늘어나며 내용 전체 표시 |

색 전환은 `motion.duration.color` 150ms와 `motion.easing.easing`을 사용합니다. Icon과 Label은 전환을 시작할 때 바로 바꾸고, 크기·위치 animation은 사용하지 않습니다. 동작 줄이기가 켜져 있어도 색 변화는 유지합니다.

Answer Label에는 click·tap handler를 붙이지 않습니다. 다시 풀기나 해설 보기처럼 행동이 필요하면 [Button](../button.md)을 상위 문제 영역에 따로 둡니다.

## 접근성

- **결과를 색만으로 알리지 않습니다.** Correct·Incorrect는 Icon과 Label을 함께 표시하고, 판정은 Label 문구로 전달합니다.
- **Icon은 장식으로 처리합니다.** Label과 같은 의미를 반복하므로 접근성 트리에서 숨깁니다.
- **판정이 끝나면 결과를 한 번 알립니다.** focus를 옮기지 않고 플랫폼 announcement나 정중한 live region으로 Label을 알립니다. Pending 문구는 읽기 순서로 제공하고 반복해 알리지 않습니다.
- **어떤 문제의 결과인지 문맥을 제공합니다.** 한 화면에 문제가 여럿이면 `3번 문제, 정답이에요`처럼 문제와 함께 읽히게 연결합니다.
- **정적인 요소로 노출합니다.** button role이나 keyboard focus를 주지 않아 조작할 수 있는 control로 오해하지 않게 합니다.
- **Label은 UI 언어로 씁니다.** 학습 대상 언어의 답안이나 정답은 Label에 넣지 않고, 필요하면 상위 문제 영역에 올바른 `lang`과 함께 둡니다.
- **확대와 번역 길이를 허용합니다.** 글자 크기 확대, 긴 번역 문구, RTL에서도 Label이 잘리지 않아야 합니다. RTL에서는 Icon이 논리적 시작 가장자리에 옵니다.

## Result 확장

새 판정 결과가 필요하면 기존 Result의 색이나 Icon을 바꾸지 않고 Result를 추가합니다.

1. **의미를 먼저 정의합니다.** Result 이름은 `Correct`처럼 판정의 의미로 짓고 `Green`처럼 색으로 짓지 않습니다. 기존 Result와 의미가 겹치면 Result를 추가하지 않고 Label 문구를 조정합니다.
2. **기존 Tone에 매핑합니다.** 새 Result는 Brand·Positive·Negative 중 의미가 맞는 Tone을 사용합니다. 같은 Tone을 쓰는 Result끼리는 Icon과 Label로 구분합니다.
3. **판정이 끝난 Result에는 Icon을 지정합니다.** `padding` 에셋 중 Label과 같은 의미의 아이콘을 고르고, 다른 Result의 Icon과 겹치지 않게 합니다.
4. **새 Tone은 토큰이 먼저입니다.** 기존 Tone으로 의미를 표현할 수 없으면 Solid 배경·Solid 전경·Subtle 배경·Subtle 전경 4개의 semantic color token이 foundations에 먼저 있어야 합니다. 각 조합은 4.5:1 이상이어야 하며, 토큰이 없으면 임의 hex나 opacity로 만들지 않고 보고합니다.
5. **전환과 알림을 함께 정의합니다.** 추가한 Result로 들어오고 나가는 조건과 announcement 여부를 전환 표와 동작 표에 함께 적습니다.

## 사용 가이드

- **한 문제의 답안 판정에만 사용합니다.** 학습 항목의 진행 상태나 잠금 여부는 [Status Indicator](./status-indicator.md)를 사용합니다.
- **Button처럼 쓰지 않습니다.** 누를 수 있는 동작은 별도 Button으로 두고, Answer Label과 같은 모양·색으로 붙여 배치하지 않습니다.
- **한 문제에는 Answer Label을 하나만 둡니다.**
- **Result의 Tone과 Icon을 화면마다 바꾸지 않습니다.** 같은 판정이 항상 같은 색과 모양으로 보여야 결과를 빠르게 알아볼 수 있습니다.
- **Label은 짧게 쓰고 느낌표와 마침표를 붙이지 않습니다.** 문제마다 반복되는 문구라 `정답이에요!`처럼 느낌표를 붙이면 의미가 약해집니다 — [Writing Tone](../../foundations/writing-tone.md) 참고.
- **Pending 문구는 지금 할 일을 말합니다.** 듣기 과제는 `잘 들어 보세요`, 말하기 과제는 `말해 보세요`처럼 과제에 맞춥니다.
- **오답의 이유와 다음 행동은 Label 밖에서 안내합니다.** 해설이나 `다시 풀기` Button을 가까이 두고 Label은 판정만 말합니다.

색·폰트·간격·아이콘·동작은 [Color](../../foundations/color.json), [Typography](../../foundations/typography.json), [Spacing](../../foundations/spacing.json), [Radius](../../foundations/radius.json), [Iconography](../../foundations/iconography.json), [Motion](../../foundations/motion.json), [Elevation](../../foundations/elevation.json)을, 접근성과 언어 처리는 [Accessibility](../../foundations/accessibility.md), [International Design](../../foundations/international-design.md)을 참고합니다.
