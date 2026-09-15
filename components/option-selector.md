# Option Selector

주어진 텍스트 선택지 중 답이나 응답을 고르는 control입니다. 회화 응답 고르기, 빈칸에 들어갈 표현 고르기처럼 2개 이상의 선택지를 한 묶음으로 보여줄 때 씁니다. 선택지 하나는 Option Item이며, Option Selector는 Option Item의 묶음과 선택·확정 규칙을 소유합니다.

## 구조

```text
Option Selector
├── Group label (필수, 문제 영역에 둘 수 있음)
└── Option list
    └── Option Item × 2개 이상
        ├── Label
        └── Indicator (Selected에서 표시)
```

Group label은 무엇을 고르는지 알리는 질문이나 지시문입니다. 화면 흐름상 문제 영역에 따로 두어도 Option list와 programmatically 연결합니다.

## 옵션

각 옵션은 독립적으로 조합합니다. 조합 전체를 별도 variant로 만들지 않습니다.

| 옵션 | 값 | 용도 |
|---|---|---|
| Variant | Filled / Outlined | 놓이는 배경에 맞는 Option Item 표면 |
| Selection | Single / Multiple | 고를 수 있는 선택지 수 |
| Commit | Deferred / Immediate | 선택을 확정하는 시점 |
| Layout | Stack / Grid | 선택지 배치 |
| Content language | UI language / Learning language | Label의 언어 semantics |

### 조합 규칙

- Multiple은 Deferred만 사용합니다. 여러 개를 고른 뒤 제출 Button으로 확정합니다.
- Immediate는 Single에만 사용합니다. 선택하는 순간 답을 제출하거나 다음 대화로 넘어갑니다.
- 한 Option Selector 안에서 Variant를 섞지 않습니다.
- Option Item에는 텍스트 Label만 둡니다. 이미지·오디오 재생·설명이 필요한 선택지는 Option Item에 slot을 더하지 않고 전용 선택 컴포넌트로 분리합니다.
- Grid는 모든 Label이 2열 너비에서 두 줄 이하일 때만 사용합니다. 번역·학습 콘텐츠 길이를 미리 알 수 없으면 Stack을 사용합니다.

## 공통 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| 너비 | Stack은 부모 너비, Grid는 열 너비를 채움 | — |
| 최소 높이 | 60px, 콘텐츠에 맞게 늘어남 | — |
| 가로·세로 padding | 16px | `spacing.16` |
| 테두리 영역 | 2px, 모든 상태에서 레이아웃 크기에 포함 | `stroke.width.strong` |
| Indicator 자리 | 좌우 양쪽에 20px과 간격 8px을 대칭으로 확보 | `icon.size.sm`, `spacing.8` |
| Indicator | `8-ui/tick`, 20 × 20px, `padding` 에셋, 끝 가장자리 | `icon.size.sm`, `icon.$extensions.com.libitum.iconography.variants.padding` |
| Label 정렬 | 가로·세로 중앙 | — |
| Label 폰트 | Pretendard Variable SemiBold 600, 16px / 24px / 0px | `typography.button.xl` |
| Label 줄 수 | 제한 없음, 단어 경계에서 줄바꿈 | — |
| 모서리 | 16px | `radius.lg` |
| 그림자 | 없음 | — |

높이와 Label 너비는 다음 식으로 계산합니다.

```text
높이 = Label 높이 + (spacing.16 × 2) + (stroke.width.strong × 2)
Label 최대 너비 = Option Item 너비 − (stroke.width.strong + spacing.16 + icon.size.sm + spacing.8) × 2
```

Label이 한 줄이면 높이는 60px입니다. Indicator 자리는 선택 여부와 관계없이 양쪽에 확보하므로 Selected가 되어도 Label 위치가 변하지 않습니다.

1px 선을 쓰는 상태는 테두리 영역 2px 중 바깥쪽 1px(`stroke.width.thin`)만 칠하고 나머지 1px은 배경색으로 채웁니다. 선택 여부나 상태가 바뀌어도 Option Item의 크기는 변하지 않습니다.

### Layout

| Layout | 값 | 토큰 |
|---|---|---|
| Stack | 1열, Option Item 사이 12px | `spacing.12` |
| Grid | 같은 너비의 2열, 가로·세로 간격 12px, 같은 행의 높이는 가장 높은 Option Item에 맞춤 | `spacing.12` |

Grid의 읽기·focus 순서는 행 우선입니다. 글자 크기를 키워 한 Label이라도 세 줄 이상이 되면 전체를 Stack으로 전환합니다.

## Variant

| Variant | 용도 |
|---|---|
| Filled | 일러스트·이미지 장면 위. 불투명한 어두운 표면이 배경과 관계없이 Label을 읽을 수 있게 함 |
| Outlined | 밝은 화면 표면. 기본값 |

Filled의 배경 `gray.950`과 비슷한 어두운 단색 배경에서는 선택지의 경계가 보이지 않으므로 Outlined를 사용합니다.

## 상태

상태는 하나의 배타적인 목록이 아니라 다음 축을 조합합니다.

| 축 | 값 | 의미 |
|---|---|---|
| Selection | Unselected / Selected | 현재 선택 여부 |
| Interaction | Default / Pressed / Focused | 누르거나 keyboard focus를 받은 상태 |
| Availability | Enabled / Disabled | 선택 가능 여부 |

시각 상태 우선순위는 Disabled → Selected → Pressed → Default 순서입니다. Selected에서는 Pressed 배경을 적용하지 않고 Selected 표현을 유지합니다. Focused는 모든 Enabled 상태에 공통 focus ring을 더합니다.

### Filled

| 상태 | 배경 | 테두리 | Label·Indicator |
|---|---|---|---|
| Default | `gray.950` #1A1C20 | 2px, `gray.950` #1A1C20 | `gray.50` #F9F9FA, Indicator 없음 |
| Pressed | `gray.900` #2A3038 | 2px, `gray.900` #2A3038 | `gray.50` #F9F9FA, Indicator 없음 |
| Selected | `gray.950` #1A1C20 | 2px, `brand.primary` #F46B18 | `brand.primary` #F46B18, Indicator 표시 |
| Disabled | `gray.950` #1A1C20 | 2px, `gray.950` #1A1C20 | `gray.800` #555D6D, Indicator 없음 |
| Disabled + Selected | `gray.950` #1A1C20 | 2px, `gray.800` #555D6D | `gray.800` #555D6D, Indicator 표시 |

### Outlined

| 상태 | 배경 | 테두리 | Label·Indicator |
|---|---|---|---|
| Default | `white` #FFFFFF | 1px, `border.strong` #141115 | `fg.neutral` #1A1C20, Indicator 없음 |
| Pressed | `gray.100` #F7F8F9 | 1px, `border.strong` #141115 | `fg.neutral` #1A1C20, Indicator 없음 |
| Selected | `background.elevated` #FFF3EA | 2px, `brand.strong` #B94208 | `fg.brand` #B94208, Indicator 표시 |
| Disabled | `gray.50` #F9F9FA | 1px, `border.disabled` #B7B4B8 | `fg.disabled` #DCDEE3, Indicator 없음 |
| Disabled + Selected | `gray.50` #F9F9FA | 2px, `border.disabled` #B7B4B8 | `fg.disabled` #DCDEE3, Indicator 표시 |

### 대비

| 조합 | 대비 |
|---|---:|
| Filled Default Label | 16.215:1 |
| Filled Pressed Label | 12.645:1 |
| Filled Selected Label·테두리 | 5.657:1 |
| Outlined Default Label | 17.061:1 |
| Outlined Default 테두리 | 18.737:1 |
| Outlined Pressed Label | 16.045:1 |
| Outlined Selected Label·테두리 | 5.008:1 |

Label은 16px SemiBold 텍스트이므로 일반 텍스트 기준 4.5:1을, 테두리는 control 경계 기준 3:1을 적용합니다. Filled Selected에 Pressed 배경 `gray.900`을 쓰면 Label 대비가 4.412:1로 떨어지므로 Selected는 Pressed 배경을 적용하지 않습니다. Disabled는 수치 대비 예외이며 선택할 수 없는 이유를 가까운 문구로 안내합니다.

Selected는 색만으로 구분하지 않습니다. 테두리·Label 색과 함께 Indicator를 표시하고 선택 semantics를 제공합니다.

### Focus indicator

| 항목 | 값 | 토큰 |
|---|---|---|
| Inner ring | 2px solid, `white` #FFFFFF | `stroke.width.strong`, `color.white` |
| Outer ring | 2px solid, `border.strong` #141115 | `stroke.width.strong`, `color.border.strong` |
| Ring 사이 간격 | 0px | `spacing.0` |
| 전체 외곽 범위 | 4px | `spacing.4` |
| 형태 | Option Item의 바깥 윤곽을 따름 | `radius.lg` |

- Web은 `:focus-visible`에 ring을 적용합니다.
- Option Item 사이 간격 12px이 ring 범위 4px보다 넓으므로 ring이 이웃 선택지에 가려지지 않습니다.
- Disabled는 focus 순서에서 제외하고 ring을 표시하지 않습니다.

## 동작

### Deferred · Single

| 입력·조건 | 결과 |
|---|---|
| 탭·클릭 | 해당 Option Item을 Selected로, 이전 Selected를 Unselected로 전환 |
| Selected 항목을 다시 탭 | Selected 유지 |
| Tab | 그룹에 들어오면 Selected 항목, 없으면 첫 항목에 focus. 다시 Tab이면 그룹 밖으로 이동 |
| 방향키 | 이전·다음 Option Item으로 focus와 선택을 함께 이동 |
| Space | focus를 받은 Option Item 선택 |
| 제출 Button 실행 | 선택을 확정하고 모든 Option Item을 Disabled로 전환 |

### Deferred · Multiple

| 입력·조건 | 결과 |
|---|---|
| 탭·클릭·Space | 해당 Option Item의 Selected를 켜고 끔 |
| Tab | Option Item마다 순서대로 focus |
| 제출 Button 실행 | 선택을 확정하고 모든 Option Item을 Disabled로 전환 |

### Immediate · Single

| 입력·조건 | 결과 |
|---|---|
| 탭·클릭·Enter·Space | 해당 Option Item을 Selected로 바꾸고 바로 확정 |
| 확정 후 | 모든 Option Item을 Disabled로 전환하고 고른 항목은 Disabled + Selected로 남김 |
| Tab | Option Item마다 순서대로 focus. 방향키로는 선택하지 않음 |

Deferred에서는 선택만으로 답을 제출하거나 화면을 넘기지 않습니다. 선택이 없는 동안에는 제출 Button을 Disabled로 두고 이유를 가까운 문구로 안내합니다.

색 전환은 `motion.duration.color` 150ms, Pressed는 `motion.duration.pressed` 150ms와 `motion.easing.easing`을 사용합니다. Indicator는 전환과 함께 바로 표시하고 크기·위치 animation은 사용하지 않습니다. 동작 줄이기가 켜져 있어도 색 변화는 유지합니다.

## 접근성

- **그룹에 이름을 붙입니다.** Group label을 Option list의 접근성 이름으로 연결해 무엇을 고르는지 먼저 알 수 있게 합니다.
- **Selection과 Commit에 맞는 semantics를 사용합니다.** Deferred · Single은 radio group, Deferred · Multiple은 checkbox group, Immediate는 button 목록입니다. 선택 여부는 checked state로 제공합니다.
- **Selected를 색만으로 알리지 않습니다.** Indicator를 함께 표시합니다. Indicator는 선택 semantics와 같은 의미를 반복하므로 접근성 트리에서 숨깁니다.
- **Label이 접근성 이름입니다.** Label이 학습 대상 언어이면 해당 텍스트에 올바른 `lang`을 지정하고 Group label은 UI locale을 유지합니다.
- **확정 결과를 알립니다.** Immediate로 확정하거나 제출 뒤 모든 선택지가 Disabled가 되면 focus를 잃지 않게 다음 영역으로 옮기거나, 확정한 선택을 announcement로 알립니다.
- **최소 hit area는 48 × 48입니다.** Option Item의 최소 높이 60px이 기준을 충족하며 Option Item 전체가 hit area입니다. 12px 간격으로 이웃 선택지와 hit area가 겹치지 않습니다.
- **확대와 번역 길이를 허용합니다.** 글자 크기 확대, 긴 Label, RTL에서 높이를 고정하거나 Label을 말줄임하지 않습니다. RTL에서는 Indicator가 논리적 끝 가장자리로 이동합니다.

## 확장

Option Selector는 선택·확정 규칙을 소유하고, 표면과 콘텐츠는 다음 규칙으로 확장합니다.

1. **정답·오답 표시는 Feedback 축으로 추가합니다.** 제출 뒤 판정 결과를 보여줄 때는 Selection 값을 늘리지 않고 Option Item에 Feedback 축(None / Correct / Incorrect)을 더합니다. 색은 `feedback.correct-surface`·`feedback.correct-text`, `feedback.incorrect-surface`·`feedback.incorrect-text` 토큰에서 고르고, Indicator는 `8-ui/tick`·`8-ui/cross`로 구분하며, 판정 문구를 함께 제공해 색만으로 알리지 않습니다.
2. **새 Variant는 모든 상태를 정의합니다.** Default·Pressed·Selected·Disabled·Disabled + Selected의 배경·테두리·Label 색을 정하고 Label 4.5:1, 테두리 3:1을 확인합니다. 기준을 충족하는 토큰이 없으면 임의 hex나 opacity로 만들지 않고 보고합니다.
3. **텍스트 외 콘텐츠는 전용 선택 컴포넌트로 분리합니다.** 이미지·오디오 재생·설명이 붙은 선택지는 Option Item에 slot을 추가하지 않고 별도 컴포넌트로 정의합니다. 이때도 Selection·Commit 옵션, 상태 우선순위, 동작 표는 이 문서를 따릅니다.
4. **새 Layout은 순서와 전환 규칙을 함께 정의합니다.** 3열 이상이나 가로 스크롤을 추가할 때는 읽기·focus 순서와 큰 글자에서 Stack으로 전환하는 조건을 함께 정합니다.
5. **Indicator 모양은 Selection 의미와 함께 바꿉니다.** Single과 Multiple을 원형·사각형처럼 구분해야 하면 두 Selection 값에 모두 정의하고, Unselected에서도 표시할지 함께 정합니다.

## 사용 가이드

- **텍스트 선택지 2개 이상 중에서 고를 때 사용합니다.** 하나의 행동을 실행할 때는 [Button](./button.md)을 사용합니다.
- **Group label로 무엇을 고르는지 알립니다.** 선택지만 보고 질문을 추측하게 두지 않습니다.
- **점수에 반영되는 문제는 Deferred로 만듭니다.** 잘못 누른 선택을 제출 전에 바꿀 수 있어야 합니다. Immediate는 회화 응답처럼 흐름을 이어가는 선택에만 씁니다.
- **제출 Button은 Option Selector 밖에 둡니다.** 제출 Button은 [Button](./button.md)을 사용하고 선택지 목록 아래에 둡니다.
- **선택지 Label은 원문을 유지합니다.** 학습 콘텐츠는 UX writing 대상으로 고치거나 번역하지 않습니다.
- **UI 언어 Label은 짧게 쓰고 마침표를 붙이지 않습니다.** [Writing Tone](../foundations/writing-tone.md)을 따릅니다.
- **Disabled만으로 이유를 설명하지 않습니다.** 제출을 마쳤거나 시간이 끝나 고를 수 없으면 가까운 문구로 알립니다.

색·폰트·간격·선 두께·동작은 [Color](../foundations/color.json), [Typography](../foundations/typography.json), [Spacing](../foundations/spacing.json), [Stroke](../foundations/stroke.json), [Radius](../foundations/radius.json), [Iconography](../foundations/iconography.json), [Motion](../foundations/motion.json)을, 접근성과 언어 처리는 [Accessibility](../foundations/accessibility.md), [International Design](../foundations/international-design.md)을 참고합니다.
