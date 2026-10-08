# Motion

화면 전환과 상호작용의 시간·가속도·크기 변화를 정하는 원칙과 규칙입니다. 값은 [Motion 토큰](./motion.json)에 있고, 이 문서는 어떤 상황에 어떤 토큰을 쓰는지와 무엇을 움직이면 안 되는지를 정합니다.

> seed-design의 [Motion](https://seed-design.io/foundations/motion)을 기준으로 duration d1~d6과 easing 6종을 가져왔습니다. 눌림 축소 비율, 학습 흐름의 reveal·reward·loop 영역, reduced motion 정책은 libitum의 학습 경험에 맞춰 따로 정했습니다.

---

## 원칙

어학 학습은 집중이 끊기면 성립하지 않습니다. libitum의 motion은 눈을 끌기 위한 것이 아니라 **무엇이 바뀌었는지, 지금 어디까지 왔는지**를 알리기 위한 것입니다.

1. **기능이 먼저입니다.** 모든 motion은 상태 변화, 공간 관계, 진척 중 하나를 설명해야 합니다. 설명할 것이 없는 motion은 넣지 않습니다.
2. **학습을 끊지 않습니다.** motion이 끝나기를 기다리게 하지 않습니다. 전환 중에도 입력을 받고, 사용자가 다시 입력하면 진행 중인 전환을 중단하고 현재 값에서 이어갑니다. 문제를 푸는 동안 화면 주변 요소는 움직이지 않습니다.
3. **진척은 차오르고, 판정은 즉시 나타납니다.** 진행 바와 Page Indicator는 `motion.duration.progress`로 차오르며 진척감을 만듭니다. 정답·오답 판정은 색만 바꿔 바로 알립니다. 성취를 강조하는 expressive motion은 학습 단위 완료와 재화 획득에만 씁니다.
4. **장면은 멈춰 있습니다.** Visual Novel의 패널과 선택지는 자리를 지키고, 대사 글자만 드러납니다. 장면이 바뀔 때만 `motion.duration.page`로 전환합니다.
5. **줄여도 뜻은 남습니다.** 동작 줄이기에서는 이동·확대·회전을 없애되, 변화가 일어났다는 사실은 색과 불투명도로 계속 전달합니다.

---

## 분류

0.2초를 경계로 micro와 macro를 나누고, libitum은 여기에 expressive와 content 영역을 더합니다.

| 영역 | 범위 | 용도 | 기본 easing |
|---|---|---|---|
| Micro | 200ms 이하 (`d1`~`d4`) | 눌림, 색 변화, 값 갱신, Tooltip, Toggle Knob | `motion.easing.easing` |
| Macro | 250~300ms (`d5`~`d6`) | 시트, 다이얼로그, 화면 전환, 진행 바 | `motion.easing.enter` / `exit` |
| Expressive | 400~600ms (`d7`~`d8`) | 학습 단위 완료, 재화 획득 | `motion.easing.enter-expressive` / `exit-expressive` |
| Content | 내용이 길이를 정함 | Typewriter 대사, Spinner, 오디오 파형 | `motion.easing.linear` |

- Micro는 사용자의 입력에 대한 응답이므로 입력보다 늦게 느껴지면 안 됩니다. 200ms를 넘기지 않습니다.
- Macro는 공간 관계를 설명합니다. 이동 거리가 길수록 긴 시간을 씁니다 — 시트 300ms, 다이얼로그 250ms.
- Expressive는 한 화면에서 한 번만 씁니다. 매 문제의 정답마다 쓰지 않습니다.
- Content는 토큰이 전체 길이를 정하지 않습니다. Typewriter는 글자 수, Spinner는 대기 시간, 오디오 파형은 재생 길이가 정합니다. 오디오 파형처럼 재생과 동기화되는 motion은 토큰을 쓰지 않습니다.

---

## Duration

### Scale

| 토큰 | 값 | 영역 |
|---|---:|---|
| `motion.duration.d1` | 50ms | Micro |
| `motion.duration.d2` | 100ms | Micro |
| `motion.duration.d3` | 150ms | Micro |
| `motion.duration.d4` | 200ms | Micro |
| `motion.duration.d5` | 250ms | Macro |
| `motion.duration.d6` | 300ms | Macro |
| `motion.duration.d7` | 400ms | Expressive |
| `motion.duration.d8` | 600ms | Expressive |
| `motion.duration.d9` | 1000ms | Loop |

### 의미 토큰

컴포넌트는 scale 값을 직접 쓰지 않고 의미 토큰을 씁니다. 맞는 의미 토큰이 없을 때만 scale 값을 쓰고, 같은 용도가 두 번째 컴포넌트에서 나오면 의미 토큰을 추가합니다.

| 토큰 | 값 | 참조 | 용도 |
|---|---:|---|---|
| `motion.duration.color` | 150ms | `d3` | 배경·테두리·글자 색 전환. 그림자 변화도 같은 시간 |
| `motion.duration.pressed` | 150ms | `d3` | 눌림 피드백. 색 변화와 `scale.pressed` 축소 모두 |
| `motion.duration.reveal` | 50ms | `d1` | Typewriter가 글자 하나를 드러내는 간격 |
| `motion.duration.progress` | 250ms | `d5` | 진행 바 채움, Page Indicator 알약 변형 |
| `motion.duration.dialog` | 250ms | `d5` | Dialog와 그 Scrim의 등장·퇴장 |
| `motion.duration.sheet` | 300ms | `d6` | Bottom Sheet와 그 Scrim의 등장·퇴장 |
| `motion.duration.page` | 300ms | `d6` | 학습 세션 안의 문제·장면 전환, custom 화면 push·pop |
| `motion.duration.reward` | 400ms | `d7` | 학습 단위 완료, 재화 획득 |
| `motion.duration.spinner` | 1000ms | `d9` | Spinner 한 바퀴 |

---

## Easing

| 토큰 | 값 | 용도 |
|---|---|---|
| `motion.easing.linear` | `cubic-bezier(0, 0, 1, 1)` | Spinner 회전, Typewriter 글자 간격. 끝이 있는 전환에는 쓰지 않습니다 |
| `motion.easing.easing` | `cubic-bezier(0.35, 0, 0.35, 1)` | 기본값. 색 변화, 눌림, 값 갱신, Toggle Knob 이동 |
| `motion.easing.enter` | `cubic-bezier(0, 0, 0.15, 1)` | 나타남. 시트·다이얼로그·화면 등장, 진행 바 채움 |
| `motion.easing.exit` | `cubic-bezier(0.35, 0, 1, 1)` | 사라짐. 시트·다이얼로그·화면 퇴장 |
| `motion.easing.enter-expressive` | `cubic-bezier(0.03, 0.4, 0.1, 1)` | 강조된 나타남. `duration.reward`와 짝 |
| `motion.easing.exit-expressive` | `cubic-bezier(0.35, 0, 0.95, 0.55)` | 강조된 사라짐. enter-expressive로 나타난 요소에만 |

### 짝 규칙

- **나타남과 사라짐은 같은 시간을 씁니다.** 등장에 `enter`를 썼으면 퇴장은 같은 duration에 `exit`입니다. 퇴장만 짧게 줄이지 않습니다.
- **표면과 Scrim은 같은 시간에 움직입니다.** Scrim이 먼저 사라지거나 늦게 남지 않습니다.
- **expressive는 짝으로만 씁니다.** `enter-expressive`로 나타난 요소만 `exit-expressive`로 사라집니다. 일반 요소에 expressive 퇴장만 붙이지 않습니다.
- **같은 상태 변화의 속성은 같은 시간에 끝납니다.** Toggle의 Knob 이동과 Track 색, 진행 바의 채움과 진행률 숫자는 한 타이밍에 갱신합니다.

---

## Scale

크기 전환은 항상 요소의 중심을 고정하고 이웃 요소를 밀어내지 않습니다.

| 토큰 | 값 | 용도 |
|---|---:|---|
| `motion.scale.pressed` | 0.95 | Round Button, Learning Unit처럼 둥근 아이콘 control의 Pressed |
| `motion.scale.enter` | 0.96 | Dialog처럼 화면 가운데 떠 있는 표면이 나타나기 시작할 때 |
| `motion.scale.reward` | 0.8 | 성취를 강조하는 요소가 나타나기 시작할 때 |

- **텍스트 라벨이 있는 Button은 크기를 바꾸지 않습니다.** 라벨이 흔들리면 읽기 어렵습니다. Pressed는 배경을 한 단계 어둡게 바꿔 알립니다.
- **축소는 요소 전체에 한 번만 적용합니다.** 축소되는 control 안의 아이콘·배지는 함께 줄어들 뿐 따로 축소하지 않습니다.
- **Loading과 Disabled는 축소하지 않습니다.**
- **pressed 축소는 `motion.duration.pressed`로 들어가고 같은 시간으로 돌아옵니다.** 손을 뗀 뒤 크기가 더 늦게 돌아오지 않습니다.

---

## 움직일 수 있는 속성

| 속성 | 허용 | 조건 |
|---|---|---|
| 불투명도 | ○ | 모든 등장·퇴장. 동작 줄이기에서도 유지 |
| 색 | ○ | 배경·테두리·글자·아이콘. `motion.duration.color` |
| 그림자 | ○ | 상태 색 변화와 같은 시간에 함께 바꿈. 단독 animation 없음 |
| 크기 | ○ | `motion.scale.*`의 세 경우만. 중심 고정 |
| 위치 | ○ | 시트 올라옴, Toggle Knob, 화면 전환. 같은 층의 이웃 요소를 밀어내지 않음 |
| 너비 | ○ | 진행 바 채움, Page Indicator 알약만. 그 밖의 레이아웃 크기는 즉시 반영 |
| 회전 | △ | Spinner만. `motion.duration.spinner` · `motion.easing.linear` |
| Blur 반경 | × | Overlay의 blur는 불투명도로만 나타나고 사라짐 |
| 글자 크기·굵기 | × | 강조는 색과 Variant로 |
| 항목 추가·삭제 재배치 | × | 목록 항목은 즉시 나타나고 사라짐. 순차 등장(stagger)을 쓰지 않음 |

레이아웃을 바꾸는 속성은 진행 바와 Page Indicator의 너비 두 곳이 전부입니다. 둘 다 이웃 요소의 위치를 바꾸지 않는 고정 영역 안에서만 움직입니다.

---

## 학습 흐름

학습 세션에서 motion이 일어나는 순간과 쓰는 토큰입니다.

| 순간 | motion | duration | easing |
|---|---|---|---|
| 문제·대사가 표시됨 | 없음. 즉시 표시 | — | — |
| Typewriter 대사가 드러남 | 글자 하나씩. 탭하면 남은 글자 즉시 표시 | `reveal` × 글자 수 | `linear` |
| 답을 고르거나 입력함 | 색 전환 | `color` / `pressed` | `easing` |
| 판정이 나옴 | Answer Label 색 전환. 크기·위치 변화 없음 | `color` | `easing` |
| 진행률이 오름 | 진행 바 채움과 진행률 숫자 함께 갱신 | `progress` | `enter` |
| 다음 문제·장면으로 넘어감 | 화면 전환 | `page` | `enter` / `exit` |
| 학습 단위를 끝냄, 재화를 얻음 | 불투명도 0 → 1, `scale.reward` → 1 | `reward` | `enter-expressive` / `exit-expressive` |
| 학습을 그만두려 함 | Dialog | `dialog` | `enter` / `exit` |
| 부가 작업을 염 | Bottom Sheet | `sheet` | `enter` / `exit` |
| 응답을 기다림 | Spinner 회전 | `spinner` | `linear` |

- **판정에 expressive를 쓰지 않습니다.** 매 문제의 정답마다 강조하면 단위 완료의 의미가 사라집니다.
- **보상 motion 중에도 다음 입력을 받습니다.** 사용자가 다음 버튼을 누르면 보상 요소는 `exit-expressive`로 즉시 사라집니다.
- **Typewriter는 보조 기술에 글자 단위로 드러내지 않습니다.** 대사 전체를 바로 제공합니다 — [Visual Novel Dialog](../components/visual-novel-dialog.md) 참고.
- **Auto advance의 대기 시간은 motion 토큰이 아닙니다.** 사용자가 정하는 읽기 시간이며 끌 수 있어야 합니다.

---

## 컴포넌트 매핑

| 컴포넌트 | 대상 | duration | easing | 동작 줄이기 |
|---|---|---|---|---|
| [Button](../components/button.md) | 배경·라벨 색 | `color` / `pressed` | `easing` | 유지 |
| [Round Button](../components/round-button.md) | 색, Pressed `scale.pressed` | `pressed` | `easing` | 색만 유지 |
| [Learning Unit](../components/learning-unit.md) | 색, Pressed `scale.pressed` | `color` / `pressed` | `easing` | 색만 유지 |
| [Card](../components/card.md) | Pressed 배경 | `pressed` | `easing` | 유지 |
| [Option Selector](../components/option-selector.md) | 색 | `color` / `pressed` | `easing` | 유지 |
| [Stat Button](../components/stat-button.md) | 색 | `color` / `pressed` | `easing` | 유지 |
| [Settings Cell](../components/settings-cell.md) | 색 | `color` / `pressed` | `easing` | 유지 |
| [Text Field](../components/text-field.md) | Field 색 | `color` | `easing` | 유지 |
| [Chat Bubble](../components/chat-bubble.md) | 전송 상태 색 | `color` | `easing` | 유지 |
| [Answer Label](../components/indicator/answer-label.md) | 판정 색 | `color` | `easing` | 유지 |
| [Toggle](../components/toggle.md) | Knob 위치, Track 색 | `d3` / `color` | `easing` | 위치 즉시, 색 유지 |
| [Progress Header](../components/header/progress-header.md) | 진행 바 너비, 진행률 숫자 | `progress` | `enter` | 즉시 반영 |
| [Page Indicator](../components/indicator/page-indicator.md) | 알약 너비, 색 | `progress` | `enter` | 너비 즉시, 색 유지 |
| [Tooltip](../components/tooltip.md) | 불투명도 | `d2` | `enter` / `exit` | 유지 |
| [Fog](../components/fog.md) | 불투명도 | `color` | `easing` | 유지 |
| [Overlay](../components/overlay.md) | 불투명도 | 함께 쓰는 표면과 같음 / `color` | `enter` / `exit` | 유지 |
| [Bottom Sheet](../components/bottom-sheet.md) | Sheet 위치, Scrim 불투명도 | `sheet` | `enter` / `exit` | 위치 대신 불투명도 |
| [Dialog](../components/dialog.md) | Container 불투명도·`scale.enter`, Scrim 불투명도 | `dialog` | `enter` / `exit` | 크기 대신 불투명도만 |
| [Visual Novel Dialog](../components/visual-novel-dialog.md) | Typewriter 글자, Variant 색 | `reveal` / `color` | `linear` / `easing` | Reveal을 Instant로 |

컴포넌트 문서의 값과 이 표가 다르면 컴포넌트 문서를 먼저 고치고 표를 맞춥니다. 새 컴포넌트는 이 표에 행을 추가합니다.

---

## Reduced motion

사용자가 시스템에서 동작 줄이기를 켜면 다음 표를 따릅니다. 애니메이션을 완전히 없애지 않습니다 — 변화가 일어났다는 사실은 전달되어야 합니다.

| 분류 | 처리 |
|---|---|
| 색·불투명도 전환 | 원래 토큰 그대로 유지 |
| 이동·확대·회전 | 제거하고 불투명도 전환으로 대체. `motion.duration.d2` 100ms · `motion.easing.linear` |
| 진행 바·Page Indicator 너비 | 즉시 반영. 색 전환은 유지 |
| Toggle Knob | 위치 즉시 반영. Track 색 전환은 유지 |
| Typewriter | Instant로 처리. 글자를 한 번에 표시 |
| Expressive | `scale.reward`를 없애고 불투명도만 `d2` · `linear` |
| Spinner | 회전 유지. 진행 중임을 알리는 유일한 수단이므로 멈추지 않음 |
| 화면 전환 | 플랫폼 기본 reduce motion 전환(crossfade)을 따름 |

| 플랫폼 | 감지 |
|---|---|
| Web | `@media (prefers-reduced-motion: reduce)` |
| iOS | `UIAccessibility.isReduceMotionEnabled` |
| Android | `Settings.Global.ANIMATOR_DURATION_SCALE` 또는 `TRANSITION_ANIMATION_SCALE`이 0 |
| ReactLynx | host가 iOS·Android 설정값을 읽어 전달. 한 플랫폼의 결과로 다른 플랫폼을 대신하지 않음 |

---

## 플랫폼 매핑

| 플랫폼 | 적용 원칙 |
|---|---|
| Web | CSS `transition`·`animation`에 `--libitum-motion-*` 변수를 연결합니다. 위치·크기는 `transform`, 등장·퇴장은 `opacity`로 구현하고 레이아웃 속성은 진행 바·Page Indicator의 너비에만 씁니다. |
| iOS | UIKit·SwiftUI animation에 duration과 cubic-bezier timing curve를 그대로 전달합니다. 시스템 내비게이션 전환은 플랫폼 값을 유지합니다. |
| Android | View·Compose animation에 duration과 `CubicBezierEasing`을 그대로 전달합니다. 시스템 내비게이션 전환은 플랫폼 값을 유지합니다. |
| ReactLynx | CSS `transition`·`animation`과 token 상수를 사용하고, 지원되지 않는 속성이 있으면 색·불투명도 전환으로 대체합니다. iOS·Android host에서 각각 확인합니다. |

플랫폼이 제공하는 기본 전환(화면 push·pop, 시스템 시트)을 쓸 때는 플랫폼 값을 바꾸지 않습니다. 이 토큰은 libitum이 직접 그리는 전환에만 적용합니다.

---

## 검증

다음 항목을 모두 확인합니다.

- 모든 전환이 `motion.*` 토큰을 쓰고 임의의 ms·bezier 값이 없는지 확인
- Micro 전환이 200ms를 넘지 않는지 확인
- 나타남과 사라짐의 시간이 같고, 표면과 Scrim이 함께 움직이는지 확인
- 텍스트 라벨이 있는 Button이 눌릴 때 크기가 변하지 않는지 확인
- 전환 중에도 입력을 받고, 다시 입력하면 현재 값에서 이어가는지 확인
- Expressive가 한 화면에서 한 번만, 단위 완료·재화 획득에만 쓰였는지 확인
- Typewriter를 탭으로 건너뛸 수 있고 보조 기술에는 대사 전체가 바로 제공되는지 확인
- 동작 줄이기에서 이동·확대·회전이 사라지고 색·불투명도 전환은 남는지 확인
- 동작 줄이기에서 Typewriter가 Instant로, 진행 바가 즉시 반영으로 바뀌는지 확인
- iOS·Android·ReactLynx에서 각각 동작 줄이기 감지를 확인

관련 값은 [Motion 토큰](./motion.json), 표면과 쌓임 순서는 [Elevation](./elevation.json), 불투명도는 [Opacity](./opacity.json), 접근성 기준은 [Accessibility](./accessibility.md)를 참고합니다.
