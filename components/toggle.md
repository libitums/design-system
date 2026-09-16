# Toggle

설정을 켜고 끄는 control입니다. 알림 받기, 소리 끄기처럼 두 상태만 있고 누르는 즉시 적용되는 설정에 씁니다. 제출 버튼을 눌러야 반영되는 선택에는 Toggle을 쓰지 않습니다.

## 구조

```text
Toggle
├── Track
└── Knob
```

Toggle은 Track과 Knob만 포함합니다. 설명 라벨과 보조 문구는 상위 설정 행이 조합하며 Toggle의 크기에 포함하지 않습니다.

## 옵션

각 옵션은 독립적으로 조합합니다. 조합 전체를 별도 variant로 만들지 않습니다.

| 옵션 | 값 | 용도 |
|---|---|---|
| Size | sm / md / lg | 놓이는 자리의 밀도 |
| Availability | Enabled / Disabled | 지금 바꿀 수 있는지 |

### 조합 규칙

- Toggle 안에 `켜짐`·`꺼짐` 같은 글자나 아이콘을 넣지 않습니다. 상태는 Knob의 위치와 Track 색으로 나타내고, 뜻은 바깥 라벨이 설명합니다.
- 한 설정 목록에서는 같은 Size를 사용합니다.
- 세 가지 이상의 값을 고르는 설정에는 사용하지 않습니다. [Option Selector](./option-selector.md)를 사용합니다.
- 되돌리기 어려운 동작에는 사용하지 않습니다. 확인이 필요하면 [Dialog](./dialog.md)로 한 번 더 묻습니다.

## 공통 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| Track 모서리 | 알약 | `radius.full` |
| Knob 모서리 | 원형 | `radius.full` |
| Knob 색 | `white` #FFFFFF | `color.white` |
| Knob 그림자 | `0 1px 4px rgba(26, 28, 32, .08)` | `elevation.shadow.s1` |
| Knob 여백 | Track 안쪽 사방 4px | `spacing.4` |
| 테두리 | 없음 | — |
| hit area | 최소 48 × 48px | `spacing.48` |

Track의 크기는 Knob에서 계산합니다.

```text
Track 높이 = Knob 크기 + (spacing.4 × 2)
Track 너비 = (Knob 크기 × 2) + (spacing.4 × 2)
Knob 이동 거리 = Track 너비 − Knob 크기 − (spacing.4 × 2)
```

Knob은 Off에서 시작 가장자리, On에서 끝 가장자리에 붙습니다. 이동 거리는 Knob 크기와 같습니다.

### Size

| Size | Knob | Track | 용도 |
|---|---|---:|---|
| sm | 12px `spacing.12` | 32 × 20px | 촘촘한 목록 행, 보조 설정 |
| md | 16px `spacing.16` | 40 × 24px | 설정 화면의 기본값 |
| lg | 24px `spacing.24` | 56 × 32px | 화면에서 강조해야 하는 단일 설정 |

세 Size 모두 보이는 크기가 48px보다 작으므로 투명 padding이나 상위 행으로 48 × 48 hit area를 확보합니다. 보이는 Track을 48px까지 키우지 않습니다.

## 상태

상태는 켜짐 여부와 사용 가능 여부를 조합합니다.

| 축 | 값 |
|---|---|
| Selection | Off / On |
| Availability | Enabled / Disabled |

| 상태 | Track | Knob | Knob 위치 |
|---|---|---|---|
| Off | `gray.700` #868B94 | `white` #FFFFFF | 시작 가장자리 |
| On | `brand.primary` #F46B18 | `white` #FFFFFF | 끝 가장자리 |
| Disabled + Off | `gray.700` #868B94, `opacity.disabled` 35% | `white` #FFFFFF, `opacity.disabled` 35% | 시작 가장자리 |
| Disabled + On | `brand.primary` #F46B18, `opacity.disabled` 35% | `white` #FFFFFF, `opacity.disabled` 35% | 끝 가장자리 |

Disabled는 Track과 Knob에 같은 불투명도를 적용해 Toggle 전체를 흐리게 만듭니다. 색을 따로 바꾸지 않아 켜짐·꺼짐을 그대로 읽을 수 있습니다.

### 대비

| 조합 | 대비 |
|---|---:|
| Off Track ↔ `white` 표면 | 3.423:1 |
| On Track ↔ `white` 표면 | 3.016:1 |
| Knob ↔ Off Track | 3.423:1 |
| Knob ↔ On Track | 3.016:1 |

Track은 control의 경계이고 Knob의 위치가 상태를 나타내므로 두 곳 모두 3:1을 적용합니다. `gray.500` #D1D3D8처럼 옅은 회색은 흰 표면과 1.498:1, 흰 Knob과도 1.498:1이라 Track과 Knob이 모두 사라지므로 사용하지 않습니다. Disabled는 수치 대비의 예외입니다.

### Focus indicator

Focused는 Off·On의 색과 크기를 유지한 채 hit area 바깥에 공통 focus ring을 더합니다.

| 항목 | 값 | 토큰 |
|---|---|---|
| Inner ring | 2px solid, `white` #FFFFFF | `stroke.width.strong`, `color.white` |
| Outer ring | 2px solid, `border.strong` #141115 | `stroke.width.strong`, `color.border.strong` |
| Ring 사이 간격 | 0px | `spacing.0` |
| 전체 외곽 범위 | 4px | `spacing.4` |
| 형태 | Track의 바깥 윤곽을 따름 | `radius.full` |

- Web은 `:focus-visible`에 ring을 적용합니다.
- Disabled는 focus 순서에서 제외하고 ring을 표시하지 않습니다.

## 동작

| 입력·조건 | 결과 |
|---|---|
| 탭·클릭 | Off와 On을 전환하고 설정을 바로 적용 |
| Space·Enter | 탭·클릭과 같은 결과 |
| 가로로 밀기 | 민 방향의 상태로 전환. 되돌아오면 원래 상태 유지 |
| Disabled | 입력·focus를 허용하지 않음 |
| 적용에 실패함 | 이전 상태로 되돌리고 이유를 가까운 문구로 알림 |

Toggle은 누르는 즉시 적용합니다. 확인 단계를 두거나 저장 버튼을 기다리지 않습니다. 서버 반영에 시간이 걸리면 Toggle을 먼저 바꾸고, 실패하면 원래 상태로 되돌린 뒤 이유를 알립니다.

Knob의 이동과 Track의 색 전환은 `motion.duration.pressed` 150ms와 `motion.easing.easing`을 사용합니다. 동작 줄이기가 켜져 있으면 이동 animation을 없애고 위치와 색을 즉시 바꿉니다.

## 접근성

- **플랫폼의 switch를 사용합니다.** Web은 `role="switch"`와 checked state를, 앱은 대응하는 native switch와 접근성 trait을 사용합니다. 정적인 요소에 탭 동작만 붙이지 않습니다.
- **접근성 이름은 설정의 이름입니다.** `켜기`가 아니라 `소리 알림`처럼 무엇을 켜고 끄는지 알리고, 현재 상태는 이름이 아니라 state로 전달합니다.
- **상태를 색만으로 알리지 않습니다.** Knob의 위치가 상태를 함께 나타내며, 보조 기술에는 켜짐·꺼짐 state를 제공합니다.
- **최소 hit area는 48 × 48입니다.** 보이는 Track은 그대로 두고 주변 투명 영역이나 설정 행 전체로 확보합니다 — [Accessibility](../foundations/accessibility.md) 참고.
- **라벨을 눌러도 전환되게 합니다.** 설정 행 전체를 hit area로 쓸 때는 행의 어느 곳을 눌러도 같은 결과가 나와야 합니다.
- **Disabled만으로 이유를 설명하지 않습니다.** 바꿀 수 없는 이유를 가까운 문구로 알립니다.
- **전환 결과를 알립니다.** 화면의 다른 내용이 함께 바뀌면 그 변화를 announcement로 전달합니다.

## 확장

Toggle은 두 상태의 전환만 소유하고, 설정 화면의 요구는 다음 규칙으로 확장합니다.

1. **라벨·설명·아이콘은 상위 설정 행이 조합합니다.** Toggle에 slot을 추가하지 않고, 설정 행에서 Toggle을 오른쪽 끝에 두는 배치를 정의합니다.
2. **적용이 오래 걸리면 상위 행이 진행을 알립니다.** Toggle 안에 Spinner를 넣지 않고 행 단위로 진행 상태를 표시합니다.
3. **새 Size는 `spacing` 토큰에서 Knob 크기를 고릅니다.** Track은 공통 스펙의 산식으로 계산하고, hit area 48 × 48을 다시 확인합니다.
4. **강조 색이 다른 Toggle이 필요하면 Tone 옵션으로 추가합니다.** Track 색과 Knob 색 조합이 표면 대비 3:1, Knob 대비 3:1을 모두 만족해야 합니다.
5. **세 가지 이상의 상태는 Toggle을 늘려 만들지 않습니다.** 중간 상태나 부분 선택이 필요하면 전용 컴포넌트로 정의합니다.

## 사용 가이드

- **즉시 적용되는 설정에만 사용합니다.** 제출이 필요한 선택은 [Option Selector](./option-selector.md)를 사용합니다.
- **라벨은 켜면 무엇이 되는지 말합니다.** `알림 받기`처럼 켜진 상태의 결과를 쓰고, 부정문(`알림 끄기`)은 피합니다 — [Writing Tone](../foundations/writing-tone.md) 참고.
- **Toggle 옆에 상태 글자를 반복하지 않습니다.** `켜짐`이라고 덧붙이지 않아도 Knob 위치로 알 수 있습니다.
- **한 행에 Toggle은 하나만 둡니다.** 여러 설정을 한 줄에 몰아넣지 않습니다.
- **기본값을 사용자에게 유리한 쪽으로 정합니다.** 데이터 사용이나 알림처럼 부담이 되는 설정은 꺼짐을 기본으로 둡니다.

색·간격·모서리·그림자·동작은 [Color](../foundations/color.json), [Spacing](../foundations/spacing.json), [Radius](../foundations/radius.json), [Elevation](../foundations/elevation.json), [Opacity](../foundations/opacity.json), [Motion](../foundations/motion.json)을, 접근성은 [Accessibility](../foundations/accessibility.md)를 참고합니다.
