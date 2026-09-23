# Learning Unit

학습 메인 화면에서 학습 단위 하나를 원형 control로 보여주고, 그 단위를 지금 시작할 수 있는지와 어디까지 해냈는지를 함께 알립니다. 학습 목록의 한 칸으로 쓰며, 단위의 제목·설명과 목록 배치는 상위 학습 목록이 소유합니다.

## 구조

```text
Learning Unit
├── Ring (바깥 테두리)
├── Surface (안쪽 원)
│   └── Icon
└── Narrative badge (선택, 바깥 원의 우측 하단)
```

Learning Unit은 Ring, Surface, Icon, Narrative badge만 포함합니다. 단위 제목, 진행 문구, 연결선은 상위 학습 목록이 조합하며 Learning Unit의 크기에 포함하지 않습니다.

## 옵션

각 옵션은 독립적으로 조합합니다. 조합 전체를 별도 variant로 만들지 않습니다.

| 옵션 | 값 | 용도 |
|---|---|---|
| Status | Default / Available / Active / Clear | 지금 시작할 수 있는지와 진행 정도 |
| Icon | 학습 유형 아이콘 | 무엇을 배우는 단위인지 |
| Narrative | None / Narrative | 이야기와 이어지는 단위인지 |

### 조합 규칙

- Status는 한 번에 하나만 가집니다. 여러 상태를 겹쳐 표현하지 않습니다.
- Icon은 학습 유형을 나타냅니다. 듣기는 `9-media/headset`, 발음은 `9-media/audio-waves`처럼 단위의 학습 유형마다 같은 아이콘을 씁니다.
- Default와 Clear는 학습 유형 아이콘 대신 상태 글리프를 표시합니다. 상태를 색만으로 알리지 않기 위한 규칙이므로 학습 유형 아이콘으로 바꾸지 않습니다.
- Narrative는 Status와 독립적으로 조합합니다. 잠긴 단위에서도 배지를 그대로 표시해 어떤 단위가 이야기와 이어지는지 미리 알 수 있게 합니다.
- 한 학습 목록에서는 모든 Learning Unit이 같은 크기를 사용합니다.

## 공통 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| 바깥 지름 | 100 × 100px | 현재 대응 토큰 없음 |
| Ring 두께 | 5px | 현재 대응 토큰 없음 |
| Ring ↔ Surface 간격 | 9px | 현재 대응 토큰 없음 |
| Surface 지름 | 72 × 72px | 현재 대응 토큰 없음 |
| Icon 크기 | 48 × 48px | 현재 대응 토큰 없음 |
| 모서리 | Ring·Surface 모두 완전한 원 | `radius.full` |
| 아이콘 에셋 | `padding` 변형 | `icon.$extensions.com.libitum.iconography.variants.padding` |
| 그림자 | 없음 | — |
| hit area | 바깥 지름 100 × 100px | `spacing.48` 이상 |

Narrative가 있으면 다음을 더합니다.

| 항목 | 값 | 토큰 |
|---|---|---|
| 배지 지름 | 32 × 32px | 현재 대응 토큰 없음 |
| 배지 안쪽 여백 | 6px | `spacing.6` |
| 배지 아이콘 | `9-media/clapper`, 20 × 20px | `icon.size.sm` |
| 배지 배경 | `white` #FFFFFF | `color.white` |
| 배지 테두리 | 1px, `gray.400` #DCDEE3 | `stroke.width.thin`, `color.gray.400` |
| 배지 아이콘 색 | `fg.neutral` #1A1C20 | `color.fg.neutral` |
| 배지 모서리 | 완전한 원 | `radius.full` |
| 배지 위치 | 바깥 원 윤곽의 우측 하단 45° 지점에 중심을 맞춤 | — |

Ring 두께는 바깥 지름 안쪽에 포함합니다. 세 값의 관계는 다음과 같습니다.

```text
Ring ↔ Surface 간격 = (바깥 지름 − Ring 두께 × 2 − Surface 지름) ÷ 2
```

Surface와 Icon은 바깥 원과 같은 중심에 둡니다. Status가 바뀌어도 세 값은 변하지 않습니다.

배지 지름도 아이콘과 여백에서 계산합니다.

```text
배지 지름 = 배지 아이콘 크기 + (배지 안쪽 여백 × 2)
```

배지는 바깥 원 밖으로 약 1.4px 벗어납니다. 상위 학습 목록은 이웃 단위와 겹치지 않도록 그만큼의 여백을 확보합니다. 배지는 Status의 색을 따르지 않으므로 네 Status 위에서 모두 같은 모양으로 보입니다.

## 상태

| Status | 뜻 | Ring | Surface | Icon |
|---|---|---|---|---|
| Default | 아직 열리지 않음 | `gray.400` #DCDEE3 | `gray.500` #D1D3D8 | `8-ui/lock`, `gray.700` #868B94 |
| Available | 지금 시작할 수 있음 | `gray.400` #DCDEE3 | `brand.reward-disabled-surface` #FFF0E6 | 학습 유형 아이콘, `brand.primary` #F46B18 |
| Active | 지금 진행 중 | `gray.400` #DCDEE3 | `brand.primary` #F46B18 | 학습 유형 아이콘, `white` #FFFFFF |
| Clear | 끝냄 | `feedback.correct` #35A66F | `feedback.correct` #35A66F | `8-ui/tick`, `white` #FFFFFF |

- Default는 입력과 focus를 받지 않습니다. 잠긴 이유는 가까운 문구로 알립니다.
- Available과 Active는 Surface 색만 다릅니다. 둘의 구분은 상위 목록의 단위 제목·진행 문구와 보조 기술의 state로 전달합니다.
- Pressed는 [Round Button](./round-button.md)과 같이 중심점을 유지한 채 95%로 축소합니다. 색은 바꾸지 않습니다.
- 색 전환은 `motion.duration.color` 150ms, Pressed는 `motion.duration.pressed` 150ms와 `motion.easing.easing`을 사용합니다. 동작 줄이기가 켜져 있어도 색 변화는 유지합니다.

### 대비

| 조합 | 대비 |
|---|---:|
| Active Surface ↔ `white` 표면 | 3.016:1 |
| Active Icon ↔ Surface | 3.016:1 |
| Clear Surface·Ring ↔ `white` 표면 | 3.072:1 |
| Clear Icon ↔ Surface | 3.072:1 |
| Ring `gray.400` ↔ `white` 표면 | 1.346:1 (승인된 예외) |
| Default Surface ↔ `white` 표면 | 1.498:1 (승인된 예외) |
| Default Icon ↔ Surface | 2.286:1 (승인된 예외) |
| Available Surface ↔ `white` 표면 | 1.114:1 (승인된 예외) |
| Available Icon ↔ Surface | 2.708:1 (승인된 예외) |
| 배지 아이콘 ↔ 배지 배경 | 17.061:1 |
| 배지 테두리 ↔ `white` 표면 | 1.346:1 (승인된 예외) |

Ring은 장식 테두리이고 상태는 Surface 색과 글리프, 보조 기술의 state로 전달합니다. 기준에 미달하는 조합의 적용 범위와 기록 방식은 [Accessibility의 시각 예외](../foundations/accessibility.md#시각-예외)를 따릅니다.

### Focus indicator

Focused는 Status의 색과 크기를 유지한 채 바깥 원 밖에 공통 focus ring을 더합니다.

| 항목 | 값 | 토큰 |
|---|---|---|
| Inner ring | 2px solid, `white` #FFFFFF | `stroke.width.strong`, `color.white` |
| Outer ring | 2px solid, `border.strong` #141115 | `stroke.width.strong`, `color.border.strong` |
| Ring 사이 간격 | 0px | `spacing.0` |
| 전체 외곽 범위 | 4px | `spacing.4` |
| 형태 | 바깥 원의 윤곽을 따름 | `radius.full` |

- Web은 `:focus-visible`에 ring을 적용합니다. ReactLynx는 [Consuming의 ReactLynx 구현 참고](../CONSUMING.md#reactlynx-구현-참고)를 따릅니다.
- Default는 focus 순서에서 제외하고 ring을 표시하지 않습니다.
- 목록에서 Learning Unit 사이 간격이 ring 범위 4px보다 좁지 않게 배치합니다.

## 동작

| 입력·조건 | 결과 |
|---|---|
| 탭·클릭·Enter·Space | 해당 단위의 학습을 시작 |
| Default에서 탭·클릭 | 아무것도 실행하지 않고 잠긴 이유를 알림 |
| 학습을 끝냄 | Active에서 Clear로 전환하고 다음 단위를 Default에서 Available로 전환 |
| 진행 중 이탈 후 복귀 | Active를 유지하고 이어서 시작 |

한 학습 목록에서 Active는 한 번에 하나입니다. 상태가 바뀌면 화면의 다른 단위도 함께 갱신합니다.

## 접근성

- **접근성 이름은 단위의 이름입니다.** `1단원`이 아니라 `1단원 쇼핑 표현 듣기`처럼 무엇을 배우는 단위인지 알립니다. 화면에 제목이 있으면 그 텍스트를 이름의 앞에 그대로 둡니다.
- **상태는 이름이 아니라 state로 전달합니다.** Default는 disabled, Active는 현재 항목(Web은 `aria-current`), Clear는 완료 여부를 함께 제공합니다.
- **상태를 색만으로 알리지 않습니다.** Default는 잠금 글리프, Clear는 tick 글리프로 구분하고, Available과 Active는 단위 제목·진행 문구와 state로 구분합니다.
- **학습 유형 아이콘과 배지는 접근성 트리에서 숨깁니다.** 학습 유형과 이야기 연결 여부는 이름이 전달합니다.
- **Narrative는 접근성 이름에 덧붙입니다.** `1단원 쇼핑 표현 듣기, 이야기 연결`처럼 단위 이름 뒤에 둡니다. 문구는 UI 언어로 씁니다 — [International Design](../foundations/international-design.md) 참고.
- **배지는 누를 수 없습니다.** Learning Unit 전체가 하나의 control이며 배지에 별도 hit area나 focus를 두지 않습니다.
- **최소 hit area는 48 × 48입니다.** 바깥 지름 100px이 기준을 넘으며 이웃 단위와 hit area가 겹치지 않게 배치합니다 — [Accessibility](../foundations/accessibility.md) 참고.
- **Default만으로 이유를 설명하지 않습니다.** 앞 단위를 끝내야 열린다는 사실을 가까운 문구로 알립니다.
- **목록의 위치를 알립니다.** 단위 하나하나가 아니라 목록 semantics로 전체 개수와 현재 위치를 제공합니다.
- **글자 크기를 키워도 원의 크기는 유지합니다.** 제목·진행 문구는 늘어날 수 있으므로 상위 목록에서 줄바꿈을 허용합니다.

## 확장

Learning Unit은 단위 하나의 표시와 실행만 소유하고, 학습 목록의 요구는 다음 규칙으로 확장합니다.

1. **제목·진행 문구·연결선은 상위 학습 목록이 조합합니다.** Learning Unit에 slot을 추가하지 않고 목록에서 배치를 정의합니다.
2. **진행률 표시가 필요하면 Ring을 진행 바로 정의합니다.** Ring 두께와 지름을 그대로 두고 채움 각도와 남은 구간의 색을 이 문서에 추가하여 정의합니다.
3. **새 Status는 Surface 색과 글리프를 함께 정합니다.** 색만 다른 Status를 늘리지 않고, 보조 기술에 전달할 state도 같이 정의합니다.
4. **배지를 늘리지 않습니다.** 단위에 붙는 표시가 더 필요하면 배지를 하나 더 얹지 않고 상위 학습 목록의 제목·보조 문구로 알립니다.
5. **새 크기는 바깥 지름·Ring 두께·Surface 지름을 함께 정합니다.** 위 산식으로 간격을 계산하고 hit area 48 × 48을 다시 확인합니다.
6. **보상·잠금 해제 연출은 Learning Unit이 소유하지 않습니다.** 장면 전체를 덮는 연출은 전용 컴포넌트로 정의합니다.

## 사용 가이드

- **한 화면에서 Active는 하나만 둡니다.** 이어서 할 단위가 무엇인지 분명해야 합니다.
- **학습 유형 아이콘은 단위마다 일관되게 씁니다.** 같은 유형의 단위가 서로 다른 아이콘을 쓰지 않습니다.
- **Clear를 되돌리지 않습니다.** 복습으로 다시 들어가도 Clear를 유지하고, 복습 여부는 별도 표시로 알립니다.
- **단위 제목은 [Writing Tone](../foundations/writing-tone.md)을 따릅니다.** 기능 이름보다 무엇을 배우는지 말하고 마침표를 붙이지 않습니다.
- **Narrative는 이야기와 이어지는 단위에만 씁니다.** 강조하고 싶은 단위에 장식으로 붙이지 않습니다.
- **잠긴 단위를 숨기지 않습니다.** 앞으로 무엇이 남았는지 보이는 것이 학습 동기가 됩니다.

색·간격·모서리·동작은 [Color](../foundations/color.json), [Spacing](../foundations/spacing.json), [Radius](../foundations/radius.json), [Motion](../foundations/motion.json), 아이콘은 [Iconography](../foundations/iconography.json)를, 접근성은 [Accessibility](../foundations/accessibility.md)를 참고합니다.
