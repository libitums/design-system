# Special Unit

학습 맵에서 레슨이 아닌 단위 하나를 둥근 사각 블록으로 보여주고, 그 단위를 지금 시작할 수 있는지와 끝냈는지를 함께 알립니다. 메신저·전화·비주얼 노벨·문화·최종 테스트 단위에 쓰며, 원형인 [Learning Unit](./learning-unit.md)과 모양으로 구별됩니다. 단위의 제목·보조 라벨·Start 말풍선과 목록 배치는 상위 학습 목록이 소유합니다.

## 구조

```text
Special Unit
└── Halo (바깥 후광)
    └── Face (둥근 사각 면, Shade 포함)
        └── Icon
```

Special Unit은 Halo, Face, Icon만 포함합니다. 제목, 보조 라벨 「SPECIAL」, Start 말풍선, 연결선은 상위 학습 목록이 조합하며 Special Unit의 크기에 포함하지 않습니다. Start 말풍선은 [Tooltip](./tooltip.md)을 사용합니다.

## 옵션

| 옵션 | 값 | 용도 |
|---|---|---|
| Status | Default / Checking / Available / Active / Clear | 지금 시작할 수 있는지와 진행 정도 |

### 조합 규칙

- Status는 한 번에 하나만 가집니다. 여러 상태를 겹쳐 표현하지 않습니다.
- Icon은 모든 Special Unit과 모든 Status에서 `4-nature/star` 하나만 씁니다. 단위 종류별 아이콘, 최종 테스트 전용 아이콘, 잠금·tick 같은 상태 글리프를 두지 않습니다. 한 단위 안에 메신저와 비주얼 노벨이 섞일 수 있어 종류별 아이콘은 틀린 정보가 되기 때문입니다.
- 모서리 배지를 두지 않습니다. Narrative 배지, 자물쇠 배지, tick 배지 모두 Special Unit에 얹지 않습니다.
- 한 학습 목록에서는 모든 Special Unit이 같은 크기를 사용합니다.

## 공통 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| 전체 크기 | 124 × 124px. 모든 Status에서 Halo 크기를 유지 | 현재 대응 토큰 없음 |
| Halo 크기 | 124 × 124px | 현재 대응 토큰 없음 |
| Halo 모서리 | 40px | 현재 대응 토큰 없음 |
| Face 크기 | 104 × 104px | 현재 대응 토큰 없음 |
| Face 모서리 | 32px | 현재 대응 토큰 없음 |
| Halo ↔ Face 간격 | 10px | 현재 대응 토큰 없음 |
| Icon 크기 | 46 × 46px | 현재 대응 토큰 없음 |
| Icon 에셋 | `4-nature/star`, `padding` 변형 | `icon.$extensions.com.libitum.iconography.variants.padding` |
| Icon 채움·선 | 모두 Status의 Icon 색 | — |
| 테두리 | 없음 | — |
| hit area | 전체 크기 124 × 124px | `spacing.48` 이상 |

Face와 Icon은 Halo와 같은 중심에 둡니다. Halo가 없는 Status에서도 124 × 124px 자리를 그대로 차지해 Active로 바뀌어도 이웃 요소가 움직이지 않습니다. Status가 바뀌어도 크기·모서리·간격은 변하지 않습니다.

```text
Halo ↔ Face 간격 = (Halo 크기 − Face 크기) ÷ 2
```

### Shade

Face의 하단과 우측에 두께를 만드는 블록 모양의 입체 면입니다. 흐림 없이 Face와 같은 윤곽을 우측 아래로 옮겨 그립니다.

| 항목 | 값 | 토큰 |
|---|---|---|
| x 오프셋 | 5px | 현재 대응 토큰 없음 |
| y 오프셋 | 6px | 현재 대응 토큰 없음 |
| blur | 0px | 현재 대응 토큰 없음 |
| spread | 0px | 현재 대응 토큰 없음 |
| 색 | Status별 Shade 색 | 아래 상태 표 |
| 모서리 | Face와 같음 | — |

Shade는 이 컴포넌트의 고유 값으로 두고 [Elevation](../foundations/elevation.json)의 shadow 토큰으로 정의하지 않습니다.

- **성격이 다릅니다.** `elevation.shadow.s1~s3`는 표면이 다른 층 위에 떠 있음을 알리는 흐림 그림자입니다. Shade는 Face 자체의 두께를 그리는 형태의 일부이며 층을 나타내지 않습니다.
- **색이 Status를 따릅니다.** 오프셋·blur와 색이 한 값으로 묶인 shadow 토큰 하나로는 Status별 Shade를 표현할 수 없습니다. 색은 이미 있는 색 토큰을 그대로 씁니다.
- **사용처가 하나입니다.** 같은 블록 모양을 쓰는 두 번째 컴포넌트가 생기면 그때 오프셋을 토큰으로 옮깁니다 — 아래 [확장](#확장) 참고.

Shade는 Face 아래에 그리며 Halo 안쪽에 들어옵니다. Shade를 포함한 Face 영역은 109 × 110px입니다.

## 상태

| Status | 뜻 | Face | Shade | Icon | Halo |
|---|---|---|---|---|---|
| Default | 아직 열리지 않음 | `gray.500` #D1D3D8 | `gray.600` #B0B3BA | `white` #FFFFFF | 없음 |
| Checking | 상태를 확인하는 중 | `gray.300` #EEEFF1 | 없음 | `gray.400` #DCDEE3 | 없음 |
| Available | 지금 시작할 수 있음 | `brand.primary` #F46B18 | `brand.strong` #B94208 | `white` #FFFFFF | 없음 |
| Active | 지금 할 것 | `brand.primary` #F46B18 | `brand.strong` #B94208 | `white` #FFFFFF | `brand.reward-disabled-surface` #FFF0E6 |
| Clear | 끝냄 | `feedback.correct` #35A66F | `feedback.correct-text` #206541 | `white` #FFFFFF | 없음 |

- Default는 입력과 focus를 받지 않습니다. 잠긴 이유는 가까운 문구로 알립니다.
- Checking은 단위의 상태를 아직 알 수 없는 동안 자리만 표시합니다. 입력과 focus를 받지 않고, 상태가 정해지면 해당 Status로 바꿉니다. Checking에는 Shade가 없습니다.
- Available과 Active는 Face·Shade·Icon이 같고 Halo만 다릅니다. Active는 Halo와 상위 목록의 Start 말풍선으로 구분합니다.
- 색 전환은 `motion.duration.color` 150ms와 `motion.easing.easing`을 사용합니다. Shade 색은 Face 색과 같은 시간에 함께 바꿉니다.

### Pressed

Available·Active·Clear를 누르면 Face가 Shade 방향으로 내려앉습니다.

| 항목 | 값 | 토큰 |
|---|---|---|
| Face 이동 | 우측 5px · 아래 6px | 현재 대응 토큰 없음 |
| Shade 오프셋 | 0px로 줄어듦 | 현재 대응 토큰 없음 |
| 색 | 바꾸지 않음 | — |
| 시간 · 가속도 | 150ms, 손을 떼면 같은 시간으로 돌아옴 | `motion.duration.pressed`, `motion.easing.easing` |

Face가 이동하는 거리와 Shade 오프셋은 같으므로 Face는 Shade가 있던 자리에 정확히 놓입니다. Icon은 Face와 함께 움직입니다. Halo와 hit area는 움직이지 않습니다.

동작 줄이기가 켜져 있으면 이동과 Shade 변화 없이, Face 위에 `color.black`을 `opacity.pressed-shade` 8%로 덮어 눌림을 알립니다. [Learning Unit](./learning-unit.md)의 Pressed 막과 같습니다.

### 상위 목록 라벨 색

보조 라벨과 제목은 상위 학습 목록이 조합하며, 색은 Status를 따릅니다. 폰트와 배치는 상위 목록이 정합니다.

| Status | 보조 라벨 「SPECIAL」 | 제목 |
|---|---|---|
| Default | `fg.neutral-muted` #555D6D | `fg.neutral-muted` #555D6D |
| Checking | `fg.neutral-muted` #555D6D | `fg.neutral-muted` #555D6D |
| Available | `fg.brand` #B94208 | `fg.neutral` #1A1C20 |
| Active | `fg.brand` #B94208 | `fg.neutral` #1A1C20 |
| Clear | `feedback.correct-text` #206541 | `fg.neutral` #1A1C20 |

Checking은 상태를 알 수 없으므로 Default와 같은 라벨 색을 씁니다.

### Start 말풍선

Active에서만 상위 학습 목록이 [Tooltip](./tooltip.md)으로 「Start」를 띄웁니다.

| Tooltip 옵션 | 값 |
|---|---|
| Tone | Brand — `brand.strong` #B94208 배경, `fg.neutral-inverted` #FFFFFF Message |
| Placement · Alignment | Top · Center |
| Arrow | On |
| Open trigger | Programmatic |
| Dismiss | Sticky |

Bubble ↔ Trigger 간격은 Special Unit의 전체 크기 124 × 124px를 기준으로 잽니다. 말풍선은 상태를 처음 알리는 수단이 아닙니다. Active는 보조 기술의 state로 먼저 전달합니다.

### 대비

배경은 학습 맵의 `white` #FFFFFF 표면을 기준으로 계산합니다.

| 조합 | 대비 |
|---|---:|
| Available·Active Face ↔ `white` 표면 | 3.016:1 |
| Available·Active Icon ↔ Face | 3.016:1 |
| Available·Active Shade ↔ `white` 표면 | 5.461:1 |
| Clear Face ↔ `white` 표면 | 3.072:1 |
| Clear Icon ↔ Face | 3.072:1 |
| Clear Shade ↔ `white` 표면 | 7.002:1 |
| Available·Active 동작 줄이기 Pressed Icon ↔ Face 합성 #E06216 | 3.523:1 |
| Clear 동작 줄이기 Pressed Icon ↔ Face 합성 #319966 | 3.584:1 |
| Active Halo ↔ `white` 표면 | 1.114:1 (승인된 예외) |
| Active Face ↔ Halo | 2.708:1 (승인된 예외) |
| Default Face ↔ `white` 표면 | 1.498:1 (승인된 예외) |
| Default Shade ↔ `white` 표면 | 2.099:1 (승인된 예외) |
| Default Icon ↔ Face | 1.498:1 (승인된 예외) |
| Checking Face ↔ `white` 표면 | 1.151:1 (승인된 예외) |
| Checking Icon ↔ Face | 1.170:1 (승인된 예외) |
| 보조 라벨 `fg.neutral-muted` ↔ `white` 표면 | 6.619:1 |
| 보조 라벨 `fg.brand` ↔ `white` 표면 | 5.461:1 |
| 보조 라벨 `feedback.correct-text` ↔ `white` 표면 | 7.002:1 |
| 제목 `fg.neutral` ↔ `white` 표면 | 17.061:1 |
| 제목 `fg.neutral-muted` ↔ `white` 표면 | 6.619:1 |
| Start 말풍선 Message ↔ 배경 | 5.461:1 |

Default와 Checking은 입력을 받지 않는 상태이며 disabled state로 전달합니다. Halo는 Active를 보조하는 장식이고, Active는 current state와 Start 말풍선으로도 전달합니다. 기준에 미달하는 조합의 적용 범위와 기록 방식은 [Accessibility의 시각 예외](../foundations/accessibility.md#시각-예외)를 따릅니다.

### Focus indicator

Focused는 Status의 색과 크기를 유지한 채 Shade를 포함한 Face 영역 밖에 공통 focus ring을 더합니다.

| 항목 | 값 | 토큰 |
|---|---|---|
| Inner ring | 2px solid, `white` #FFFFFF | `stroke.width.strong`, `color.white` |
| Outer ring | 2px solid, `border.strong` #141115 | `stroke.width.strong`, `color.border.strong` |
| Ring 사이 간격 | 0px | `spacing.0` |
| 전체 외곽 범위 | 4px | `spacing.4` |
| 기준 윤곽 | Shade를 포함한 Face 영역 109 × 110px | — |
| 형태 | Face의 둥근 사각 윤곽을 따름, 모서리 32px | 현재 대응 토큰 없음 |

- ring은 Shade 범위 밖에 그려 Shade와 겹치지 않습니다. ring을 더한 범위 117 × 118px는 전체 크기 124 × 124px 안에 들어옵니다.
- Active에서는 ring이 Halo 위에 그려집니다. Outer ring과 Halo의 대비는 16.827:1입니다.
- ring은 keyboard focus에만 표시합니다. 플랫폼별 적용은 [Accessibility의 Focus indicator](../foundations/accessibility.md#focus-indicator)를 따릅니다.
- Default와 Checking은 focus 순서에서 제외하고 ring을 표시하지 않습니다.

## 동작

| 입력·조건 | 결과 |
|---|---|
| 탭·클릭·Enter·Space | 해당 단위를 시작 |
| Default에서 탭·클릭 | 아무것도 실행하지 않고 잠긴 이유를 알림 |
| Checking에서 탭·클릭 | 아무것도 실행하지 않음 |
| 상태 확인을 마침 | Checking에서 확인된 Status로 전환 |
| 단위를 끝냄 | Active에서 Clear로 전환하고 다음 단위를 Default에서 Available로 전환 |
| 진행 중 이탈 후 복귀 | Active를 유지하고 이어서 시작 |

한 학습 목록에서 Active는 Learning Unit과 Special Unit을 통틀어 한 번에 하나입니다. 상태가 바뀌면 화면의 다른 단위도 함께 갱신합니다.

## 접근성

### 상태 표시 예외

Special Unit은 Default와 Clear에서 글리프 없이 Face 색만으로 상태를 보입니다. 이는 [Accessibility의 Color와 상태](../foundations/accessibility.md#color와-상태)에서 Special Unit에 한정해 승인된 예외이며, 상태는 다음 보조 기술 state로 반드시 전달합니다.

| Status | 보조 기술 state |
|---|---|
| Default | disabled |
| Checking | disabled, busy(loading) |
| Available | 없음 |
| Active | current |
| Clear | completed |

- **알려진 한계가 있습니다.** Available(`brand.primary`)과 Clear(`feedback.correct`)는 밝기가 비슷해 색각 이상 사용자가 화면만으로 구분하기 어렵습니다. 두 상태는 보조 기술 state와 상위 목록의 라벨 색으로만 구분됩니다. Active는 Halo와 Start 말풍선으로 구분됩니다.
- **예외는 Special Unit에만 적용합니다.** 다른 컴포넌트, 특히 Learning Unit은 상태를 색만으로 알리지 않는 공통 기준을 그대로 따릅니다.

### 일반

- **접근성 이름은 보조 라벨과 단위의 제목입니다.** 보조 라벨, 제목 순서로 두고 상태는 state로 덧붙습니다. 화면에 보이는 텍스트를 그대로 씁니다. 읽히는 예: `special, A Call from Minseo, current`
- **별 아이콘은 접근성 트리에서 숨깁니다.** 모든 Special Unit에 같은 아이콘이므로 전달할 정보가 없습니다.
- **Special Unit 전체가 하나의 control입니다.** Halo·Face·Icon을 별도 node로 노출하지 않습니다.
- **최소 hit area는 48 × 48입니다.** 전체 크기 124px가 기준을 넘으며 이웃 단위와 hit area가 겹치지 않게 배치합니다 — [Accessibility](../foundations/accessibility.md) 참고.
- **Pressed 이동 중에도 hit area는 그대로입니다.** Face가 내려앉아도 누를 수 있는 영역은 전체 크기 124 × 124px로 고정합니다.
- **Default만으로 이유를 설명하지 않습니다.** 앞 단위를 끝내야 열린다는 사실을 가까운 문구로 알립니다.
- **Checking이 끝나면 바뀐 상태를 알립니다.** focus를 옮기지 않고 해당 단위의 state를 갱신합니다.
- **목록의 위치를 알립니다.** 단위 하나하나가 아니라 목록 semantics로 전체 개수와 현재 위치를 제공합니다.
- **글자 크기를 키워도 블록의 크기는 유지합니다.** 제목·보조 라벨은 늘어날 수 있으므로 상위 목록에서 줄바꿈을 허용합니다.

## 확장

Special Unit은 레슨이 아닌 단위 하나의 표시와 실행만 소유하고, 학습 목록의 요구는 다음 규칙으로 확장합니다.

1. **Special Unit의 글리프 생략 규칙을 Learning Unit에 쓰지 않습니다.** 레슨은 [Learning Unit](./learning-unit.md)의 원형·잠금 글리프·tick 글리프를 그대로 씁니다. 색만으로 상태를 보이는 예외는 Special Unit에 한정됩니다.
2. **단위 종류를 아이콘으로 나누지 않습니다.** 메신저·전화·비주얼 노벨·문화·최종 테스트를 구분해야 하면 상위 목록의 제목으로 알립니다. 아이콘을 바꾸거나 배지를 얹지 않습니다.
3. **제목·보조 라벨·Start 말풍선·연결선은 상위 학습 목록이 조합합니다.** Special Unit에 slot을 추가하지 않습니다.
4. **새 Status는 Face·Shade·Icon 색과 보조 기술 state를 함께 정합니다.** 대비를 계산해 대비 표에 넣고, 미달이면 시각 예외로 기록합니다.
5. **Shade를 다른 컴포넌트에도 쓰게 되면 토큰으로 옮깁니다.** 그때 오프셋·blur를 `elevation.shadow.s1~s3`와 구별되는 이름으로 정의하고 색은 Status별 색 토큰을 그대로 씁니다.
6. **새 크기는 Halo·Face·Icon·모서리·Shade 오프셋을 함께 정합니다.** focus ring 범위가 전체 크기 안에 들어오는지와 hit area 48 × 48을 다시 확인합니다.
7. **보상·잠금 해제 연출은 Special Unit이 소유하지 않습니다.** 장면 전체를 덮는 연출은 전용 컴포넌트로 정의합니다.

## 사용 가이드

- **레슨이 아닌 단위에만 씁니다.** 메신저·전화·비주얼 노벨·문화·최종 테스트 단위는 Special Unit, 레슨은 Learning Unit을 씁니다.
- **한 화면에서 Active는 하나만 둡니다.** Learning Unit과 Special Unit을 통틀어 이어서 할 단위가 분명해야 합니다.
- **Start 말풍선은 Active에만 띄웁니다.** 다른 Status에 말풍선을 붙이지 않습니다.
- **Checking을 오래 두지 않습니다.** 상태를 알 수 있게 되면 바로 해당 Status로 바꿉니다.
- **Clear를 되돌리지 않습니다.** 다시 들어가도 Clear를 유지합니다.
- **잠긴 단위를 숨기지 않습니다.** 앞으로 무엇이 남았는지 보이는 것이 학습 동기가 됩니다.
- **문구는 [Writing Tone](../foundations/writing-tone.md)을 따릅니다.** 「Start」·「SPECIAL」처럼 버튼·라벨 문구에는 마침표를 붙이지 않습니다. 보조 라벨과 말풍선 문구는 UI 언어로 쓰고, 학습 대상 언어의 제목에는 해당 `lang`을 지정합니다 — [International Design](../foundations/international-design.md) 참고.

색·간격·모서리·불투명도·동작은 [Color](../foundations/color.json), [Spacing](../foundations/spacing.json), [Radius](../foundations/radius.json), [Opacity](../foundations/opacity.json), [Motion](../foundations/motion.json), 그림자 구분은 [Elevation](../foundations/elevation.json), 아이콘은 [Iconography](../foundations/iconography.json)를, 접근성은 [Accessibility](../foundations/accessibility.md)를 참고합니다.
