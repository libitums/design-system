# Settings Cell

설정 하나를 한 줄로 보여주고, 그 자리에서 바로 켜고 끄거나 설정 화면으로 이동하는 행입니다. 설정 화면처럼 같은 성격의 설정을 여러 개 나열하는 자리에 씁니다. 여러 Settings Cell은 하나의 Settings group으로 묶습니다.

## 구조

```text
Settings group
└── Settings Cell × 1개 이상
    ├── Leading (선택)
    ├── Container
    │   ├── Title
    │   └── Description (선택)
    └── Trailing
```

Settings Cell은 한 설정의 이름, 설명, 현재 값을 소유합니다. 설정을 바꾸는 표면과 이동한 뒤의 화면은 Settings Cell이 소유하지 않습니다.

## 옵션

각 옵션은 독립적으로 조합합니다. 조합 전체를 별도 variant로 만들지 않습니다.

| 옵션 | 값 | 용도 |
|---|---|---|
| Trailing | Toggle / Navigation | 그 자리에서 바꾸는 설정인지, 다른 화면에서 바꾸는 설정인지 |
| Leading | None / Avatar | 설정의 대상을 사람으로 나타내야 하는지 |
| Description | None / Text | 설정의 결과를 한 줄로 덧붙일지 |
| Value | None / Text | Navigation에서 현재 값을 미리 보여줄지 |
| Availability | Enabled / Disabled | 지금 바꿀 수 있는지 |

### 조합 규칙

- Value는 Navigation에만 사용합니다. Toggle의 현재 값은 Toggle 자신이 나타냅니다.
- 한 Settings Cell에는 Trailing을 하나만 둡니다. Toggle과 Navigation을 같이 두지 않습니다.
- Leading Avatar는 사람을 나타내는 설정에만 씁니다. 설정의 종류를 아이콘으로 구분하지 않습니다.
- Description은 설정을 켜면 무엇이 되는지 한 줄로 적습니다. 두 줄이 필요하면 설정 화면으로 옮깁니다.
- 한 Settings group 안에서 Leading의 유무를 섞지 않습니다.

## 공통 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| 배경 | `white` #FFFFFF | `color.white` |
| 최소 높이 | 72px | 현재 대응 토큰 없음 |
| 가로 padding | 20px | `spacing.20` |
| 세로 padding | 16px | `spacing.16` |
| 영역 사이 간격 | 12px | `spacing.12` |
| Title ↔ Description 간격 | 4px | `spacing.4` |
| Value ↔ 이동 아이콘 간격 | 8px | `spacing.8` |
| Title 폰트 | Pretendard Variable SemiBold 600, 14px / 20px / 0px, `fg.neutral` #1A1C20 | `typography.button.m`, `color.fg.neutral` |
| Description 폰트 | Pretendard Variable Medium 500, 12px / 18px / 0px, `fg.neutral-muted` #555D6D | `typography.body.s`, `color.fg.neutral-muted` |
| Value 폰트 | Pretendard Variable Medium 500, 12px / 18px / 0px, `fg.neutral-muted` #555D6D | `typography.body.s`, `color.fg.neutral-muted` |
| 이동 아이콘 | 20 × 20px, `8-ui/arrow-right`, `fg.neutral-subtle` #868B94 | `icon.size.sm`, `color.fg.neutral-subtle` |
| Leading Avatar | 32px [Avatar](./avatar.md) sm | `spacing.32` |
| 테두리·그림자 | 없음 | — |
| hit area | 행 전체, 최소 48 × 48px | `spacing.48` |

높이는 콘텐츠에서 계산하고 최소 높이 아래로 줄지 않습니다.

```text
높이 = max(72px, 콘텐츠 높이 + (세로 padding × 2))
콘텐츠 높이 (Description 있음) = Title 높이 + spacing.4 + Description 높이
콘텐츠 높이 (Description 없음) = Title 높이
```

Title과 Description은 가로로 남는 공간을 모두 차지하고, Trailing은 콘텐츠 너비를 유지합니다. 글자 크기를 키우거나 번역으로 길어지면 Title과 Description이 줄바꿈하고 행의 높이가 늘어납니다. 말줄임하지 않습니다.

### Trailing

| Trailing | 내용 | 행동 |
|---|---|---|
| Toggle | [Toggle](./toggle.md) sm | 행을 누르면 그 자리에서 값을 바꿈 |
| Navigation | Value(선택) + `8-ui/arrow-right` | 행을 누르면 설정 화면이나 선택 표면을 엶 |

Toggle의 크기·색·상태는 [Toggle](./toggle.md)을 따르며 Settings Cell이 따로 정하지 않습니다.

## Settings group

같은 성격의 설정을 하나의 표면으로 묶습니다.

| 항목 | 값 | 토큰 |
|---|---|---|
| 배경 | `white` #FFFFFF | `color.white` |
| 테두리 | 1px, `gray.300` #EEEFF1 | `stroke.width.thin`, `color.gray.300` |
| 모서리 | 12px, 첫 행과 마지막 행의 바깥 모서리를 함께 깎음 | `radius.md` |
| 구분선 | 1px, `gray.300` #EEEFF1 | `stroke.width.thin`, `color.gray.300` |
| 구분선 범위 | 좌우 20px씩 들여씀 | `spacing.20` |

- 구분선은 행과 행 사이에만 둡니다. 마지막 행 아래에는 두지 않습니다.
- 성격이 다른 설정은 한 group에 넣지 않고 group을 나눕니다. group 사이 간격은 설정 화면의 레이아웃이 정합니다.
- group의 제목이 필요하면 group 바깥 위에 두고 Settings Cell로 만들지 않습니다.

## 상태

| 상태 | 배경 | 내용 |
|---|---|---|
| Default | `white` #FFFFFF | 각 요소의 기본 색 |
| Pressed | `gray.100` #F7F8F9 | 색을 바꾸지 않음 |
| Disabled | `white` #FFFFFF | 행 전체에 `opacity.disabled` 35% |

- Pressed는 행 전체의 배경만 바꿉니다. Toggle을 직접 누른 경우에는 Toggle의 Pressed 표현을 함께 씁니다.
- Disabled는 Title·Description·Value·Trailing에 같은 불투명도를 적용합니다. 요소마다 다른 색으로 바꾸지 않습니다.
- Disabled에서도 행을 목록에서 감추지 않고, 지금 바꿀 수 없는 이유를 Description에 적습니다.
- 색 전환은 `motion.duration.color` 150ms, Pressed는 `motion.duration.pressed` 150ms와 `motion.easing.easing`을 사용합니다.

### 대비

| 조합 | 대비 |
|---|---:|
| Title ↔ `white` 배경 | 17.061:1 |
| Description·Value ↔ `white` 배경 | 6.619:1 |
| 이동 아이콘 ↔ `white` 배경 | 3.423:1 |
| 구분선·테두리 ↔ `white` 배경 | 1.151:1 (승인된 예외) |

구분선과 테두리는 행을 나누는 장식이며 각 행은 Title로 식별합니다. 적용 범위와 기록 방식은 [Accessibility의 시각 예외](../foundations/accessibility.md#시각-예외)를 따릅니다. Disabled는 수치 대비의 예외입니다.

### Focus indicator

Focused는 상태의 색과 크기를 유지한 채 행의 바깥 윤곽에 공통 focus ring을 더합니다.

| 항목 | 값 | 토큰 |
|---|---|---|
| Inner ring | 2px solid, `white` #FFFFFF | `stroke.width.strong`, `color.white` |
| Outer ring | 2px solid, `border.strong` #141115 | `stroke.width.strong`, `color.border.strong` |
| Ring 사이 간격 | 0px | `spacing.0` |
| 전체 외곽 범위 | 4px | `spacing.4` |
| 형태 | 행의 바깥 윤곽을 따름, 첫 행과 마지막 행은 group의 모서리를 따름 | `radius.md` |

- ring은 keyboard focus에만 표시합니다. 플랫폼별 적용은 [Accessibility의 Focus indicator](../foundations/accessibility.md#focus-indicator)를 따릅니다.
- 행 전체가 하나의 focus 대상입니다. Toggle에 별도 focus를 두지 않습니다.
- Disabled는 focus 순서에서 제외하고 ring을 표시하지 않습니다.
- group이 콘텐츠를 clip하므로 첫 행과 마지막 행의 ring이 잘리지 않도록 group 바깥에 4px 여백을 둡니다.

## 동작

| 입력·조건 | 결과 |
|---|---|
| Toggle 행을 탭·클릭·Space | 값을 바꾸고 바로 적용 |
| Navigation 행을 탭·클릭·Enter | 설정 화면이나 선택 표면을 엶 |
| 선택 표면에서 값을 고름 | 표면을 닫고 Value를 갱신한 뒤 행으로 focus를 되돌림 |
| 적용에 실패함 | 이전 값으로 되돌리고 이유를 가까운 문구로 알림 |
| Disabled | 입력·focus를 허용하지 않음 |

Toggle 행의 적용과 실패 처리는 [Toggle](./toggle.md)의 동작을 따릅니다. 선택 표면은 [Bottom Sheet](./bottom-sheet.md)를 사용하고 뒤를 덮는 층은 [Overlay](./overlay.md)의 Screen 조합을 씁니다.

## 접근성

- **행 전체가 하나의 control입니다.** Toggle 행은 switch, Navigation 행은 button으로 알리고, 행 안에 중첩된 control을 따로 두지 않습니다.
- **접근성 이름은 Title입니다.** Description이 있으면 설명으로 연결하고 이름에 합치지 않습니다.
- **현재 값을 state와 value로 전달합니다.** Toggle은 켜짐·꺼짐 state를, Navigation의 Value는 현재 값으로 제공합니다. 이동 아이콘은 접근성 트리에서 숨깁니다.
- **최소 hit area는 48 × 48입니다.** 최소 높이 72px과 행 전체 너비가 기준을 넘습니다 — [Accessibility](../foundations/accessibility.md) 참고.
- **Disabled만으로 이유를 설명하지 않습니다.** `프리미엄 플랜에서 사용할 수 있어요`처럼 바꿀 수 없는 이유를 Description에 적습니다.
- **group을 목록으로 알립니다.** 한 group의 Settings Cell을 하나의 목록으로 묶어 전체 개수와 현재 위치를 제공합니다.
- **Leading Avatar는 접근성 트리에서 숨깁니다.** 대상은 Title이 전달합니다.
- **글자 크기를 키워도 잘리지 않습니다.** 행의 높이가 늘어나는 것을 허용하고 Trailing을 밀어내지 않습니다.

## 확장

Settings Cell은 설정 한 줄의 표시와 실행만 소유하고, 설정 화면의 요구는 다음 규칙으로 확장합니다.

1. **새 Trailing은 하나의 행동만 가집니다.** 행 전체가 하나의 control이라는 규칙을 깨는 Trailing을 추가하지 않습니다.
2. **여러 값을 고르는 설정은 표면으로 옮깁니다.** 행 안에 선택지를 펼치지 않고 [Option Selector](./option-selector.md)를 가진 표면을 엽니다.
3. **위험한 설정은 확인을 거칩니다.** 계정 삭제처럼 되돌릴 수 없는 설정은 [Dialog](./dialog.md)로 한 번 더 묻습니다.
4. **group 제목과 설명은 설정 화면이 소유합니다.** Settings Cell에 제목용 변형을 만들지 않습니다.
5. **새 Leading이 필요하면 크기와 정렬을 함께 정합니다.** 콘텐츠 영역의 시작 위치가 모든 행에서 같아야 합니다.

## 사용 가이드

- **한 행에는 설정 하나만 둡니다.** 두 설정을 한 줄에 묶지 않습니다.
- **Title은 무엇을 바꾸는지 말합니다.** `알림`처럼 설정의 대상을 쓰고 마침표를 붙이지 않습니다 — [Writing Tone](../foundations/writing-tone.md) 참고.
- **Description은 켜면 무엇이 되는지 씁니다.** `학습 리마인더와 활동 알림을 받아요`처럼 결과를 적고, 기능 이름을 반복하지 않습니다.
- **즉시 적용되는 설정은 Toggle, 고를 것이 여럿인 설정은 Navigation을 씁니다.**
- **Value에는 현재 값만 적습니다.** `English`, `15분`처럼 지금 값을 보여주고 안내 문구를 넣지 않습니다.

색·간격·모서리·선 두께·동작은 [Color](../foundations/color.json), [Spacing](../foundations/spacing.json), [Radius](../foundations/radius.json), [Stroke](../foundations/stroke.json), [Motion](../foundations/motion.json), 타이포그래피는 [Typography](../foundations/typography.json), 아이콘은 [Iconography](../foundations/iconography.json), 접근성은 [Accessibility](../foundations/accessibility.md), 문구는 [Writing Tone](../foundations/writing-tone.md)을 참고합니다.
