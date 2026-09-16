# Tooltip

트리거 요소 옆에 떠서 짧은 보조 설명이나 힌트를 주는 말풍선입니다. 아이콘 버튼의 뜻, 처음 보는 기능의 짧은 안내, 학습 화면의 힌트에 씁니다. Tooltip은 말풍선과 배치 규칙만 소유하고, 트리거와 여는 조건은 Tooltip을 쓰는 상위 화면이 정합니다.

## 구조

```text
Tooltip host
├── Trigger (상위 화면이 소유)
└── Tooltip
    ├── Bubble
    │   └── Message
    └── Arrow (선택)
```

Bubble은 Message만 포함합니다. 제목, 이미지, 여러 문단, Button은 Bubble에 넣지 않습니다.

## 옵션

각 옵션은 독립적으로 조합합니다. 조합 전체를 별도 variant로 만들지 않습니다.

| 옵션 | 값 | 용도 |
|---|---|---|
| Placement | Top / Bottom / Start / End | 트리거를 기준으로 한 기본 배치 |
| Alignment | Start / Center / End | 교차 축에서 트리거와 맞추는 위치 |
| Arrow | On / Off | 어느 트리거의 설명인지 가리키는 꼬리 |
| Tone | Brand / Neutral | 말풍선 표면의 강조 수준 |
| Open trigger | Pointer / Focus / Press / Programmatic | Tooltip을 여는 입력 |
| Dismiss | Auto / Sticky | 사용자의 조작 없이 닫히는지 여부 |

### 조합 규칙

- Placement와 Alignment는 논리 방향입니다. RTL에서 Start·End는 반대쪽 가장자리가 됩니다.
- Arrow Off는 트리거가 여럿 붙어 있지 않아 대상이 분명할 때만 사용합니다.
- Pointer는 hover를 쓸 수 있는 환경에서만 사용합니다. 터치 환경에서는 Press나 Programmatic으로 대체합니다.
- Focus는 항상 함께 지원합니다. Pointer나 Press만으로 열리는 Tooltip은 keyboard 사용자에게 닫힌 채로 남습니다.
- Auto는 Programmatic으로 연 안내에만 사용합니다. Pointer·Focus·Press로 연 Tooltip은 Sticky로 두고 사용자의 조작으로 닫습니다.
- Bubble 안에는 interactive element를 넣지 않습니다. 링크·Button이 필요하면 Tooltip이 아니라 전용 Popover를 정의합니다.
- 한 화면에 Tooltip은 하나만 표시합니다. 새 Tooltip을 열면 기존 Tooltip을 닫습니다.

## 공통 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| 너비 | Message에 맞게 줄어듦 | — |
| 최대 너비 | 240px 또는 부모가 제공하는 가용 너비 중 작은 값 | — |
| 가로 padding | 12px | `spacing.12` |
| 세로 padding | 8px | `spacing.8` |
| Message 폰트 | Pretendard Variable Medium 500, 14px / 20px / 0px | `typography.body.m` |
| Message 줄 수 | 최대 2줄 | — |
| 모서리 | 12px | `radius.md` |
| Bubble ↔ Trigger 간격 | 8px | `spacing.8` |
| 테두리 | 없음 | — |
| 그림자 | 없음 | — |
| 쌓임 순서 | 트리거가 속한 층 바로 위 | `elevation.z.floating` |

Message가 한 줄이면 Bubble의 높이는 36px입니다. 두 줄을 넘는 내용은 Tooltip에 담지 않고 화면 본문이나 Bottom Sheet로 옮깁니다.

Tooltip은 트리거가 속한 층 위에 뜹니다. 바텀 시트나 다이얼로그 안의 트리거에서 열면 해당 표면 위에 두고, 표면 밖으로 나가지 않게 합니다.

### Arrow

| 항목 | 값 | 토큰 |
|---|---|---|
| 크기 | 밑변 12px × 높이 6px | `spacing.12`, `spacing.6` |
| 색 | Bubble 배경과 같은 색 | — |
| 위치 | Bubble에서 트리거를 향하는 면, Alignment를 따라 이동 | — |
| Arrow 끝 ↔ Trigger 간격 | 2px | `spacing.2` |
| 가장자리 최소 여백 | Bubble 모서리에서 12px | `spacing.12` |

Arrow는 항상 트리거의 중심을 향합니다. Bubble이 화면 안으로 밀려 트리거 중심을 벗어나면 Arrow만 트리거 쪽으로 이동하고, 모서리에서 12px보다 가까워지면 Arrow를 Off로 전환합니다.

### Tone

| Tone | 배경 | Message·Arrow | 대비 | 용도 |
|---|---|---|---|---|
| Brand | `brand.strong` #B94208 | `fg.neutral-inverted` #FFFFFF | 5.461:1 | 학습 힌트처럼 사용자가 놓치면 안 되는 안내 |
| Neutral | `gray.950` #1A1C20 | `fg.neutral-inverted` #FFFFFF | 16.215:1 | 아이콘 뜻풀이 같은 일반 보조 설명 |

Message는 14px 일반 텍스트이므로 4.5:1 기준을 적용합니다. `brand.primary` #F46B18은 흰 Message와 3.016:1로 기준에 미달하므로 Tooltip 배경으로 쓰지 않습니다. [Accessibility의 Brand Button 예외](../foundations/accessibility.md#brand-button-예외)는 Button 전용이며 Tooltip에 적용하지 않습니다.

### Placement와 Alignment

| 항목 | 규칙 |
|---|---|
| 기본 배치 | Placement가 정한 방향에 Bubble ↔ Trigger 간격만큼 띄워 배치 |
| Alignment Start | 교차 축에서 트리거의 시작 가장자리에 맞춤 |
| Alignment Center | 교차 축에서 트리거의 중앙에 맞춤 |
| Alignment End | 교차 축에서 트리거의 끝 가장자리에 맞춤 |
| Flip | 기본 배치에서 Bubble이 화면이나 스크롤 영역 밖으로 나가면 반대 방향으로 뒤집음 |
| Shift | 뒤집어도 교차 축이 잘리면 잘리지 않을 만큼만 교차 축으로 밀어 넣음 |
| 최소 여백 | 화면 가장자리에서 16px | `layout.screen.padding-x` |

Flip과 Shift는 Placement·Alignment 값을 바꾸지 않고 표시 위치만 조정합니다. 같은 트리거에서 다시 열면 원래 값으로 계산합니다.

## 상태

Tooltip은 누르거나 focus를 받는 상태가 없고 표시 여부만 가집니다.

| 상태 | 값 |
|---|---|
| Hidden | 표시하지 않음. 레이아웃 공간도 차지하지 않음 |
| Visible | 트리거 옆에 표시하고 트리거의 설명으로 연결 |

### 전환

| 대상 | 나타남 | 사라짐 |
|---|---|---|
| Bubble·Arrow | 불투명도 0 → 1 | 불투명도 1 → 0 |
| 시간 · 가속도 | `motion.duration.d2` 100ms · `motion.easing.enter` | 같은 시간 · `motion.easing.exit` |

위치·크기 animation은 사용하지 않습니다. 동작 줄이기가 켜져 있어도 불투명도 전환은 유지합니다 — [Motion](../foundations/motion.json) 참고.

## 동작

| 입력·조건 | 결과 |
|---|---|
| Pointer가 트리거 위로 들어옴 | Tooltip을 표시 |
| Pointer가 트리거와 Tooltip 밖으로 나감 | Tooltip을 숨김 |
| Pointer가 Tooltip 위로 이동 | 표시를 유지 |
| 트리거가 keyboard focus를 받음 | Tooltip을 표시 |
| 트리거가 focus를 잃음 | Tooltip을 숨김 |
| Press로 연 트리거를 다시 누름 | Tooltip을 숨김 |
| ESC · 뒤로가기 | Tooltip을 숨기고 focus는 트리거에 유지 |
| 트리거 밖을 탭·클릭 | Tooltip을 숨김 |
| 스크롤·화면 회전·글자 크기 변경 | 위치를 다시 계산하고 필요하면 Flip·Shift를 적용 |
| 트리거가 화면 밖으로 벗어남 | Tooltip을 숨김 |

Pointer로 연 Tooltip은 트리거에서 Tooltip으로 pointer를 옮기는 동안 사라지지 않습니다. Auto로 닫는 Programmatic Tooltip은 사용자가 읽을 시간을 확보하고, 읽는 중 닫히지 않도록 pointer·focus가 올라가면 타이머를 멈춥니다.

## 접근성

- **Tooltip을 트리거의 설명으로 연결합니다.** Web은 트리거에 `aria-describedby`로 Bubble을 연결하고, 앱은 대응하는 접근성 설명 API를 사용합니다. 트리거에 보이는 이름이 없으면 설명이 아니라 접근성 이름을 먼저 제공합니다.
- **ESC로 닫을 수 있어야 합니다.** pointer를 옮기지 않고도 Tooltip을 걷을 수 있어야 하며, 닫아도 focus는 트리거에 남습니다.
- **Tooltip 위에 pointer를 올려도 유지합니다.** 내용을 읽거나 확대해서 보는 동안 사라지지 않아야 합니다.
- **시간만으로 닫지 않습니다.** 사용자가 읽는 속도는 저마다 다르므로 Auto는 Programmatic 안내에만 쓰고, pointer·focus가 올라가면 타이머를 멈춥니다.
- **Tooltip에만 있는 정보를 두지 않습니다.** Tooltip을 열지 못하는 환경에서도 같은 내용을 화면 본문이나 접근성 이름으로 알 수 있어야 합니다.
- **터치 환경을 따로 정의합니다.** hover가 없으므로 Press나 Programmatic으로 열고, 길게 누르기만으로 여는 방식은 단독으로 쓰지 않습니다.
- **Bubble은 focus를 받지 않습니다.** Bubble 안에 interactive element를 두지 않고, Bubble이 트리거의 hit area를 가리지 않게 합니다.
- **확대와 번역 길이를 허용합니다.** 글자 크기를 키워도 Bubble이 늘어나고, 화면 밖으로 나가면 Flip·Shift로 조정합니다. 내용을 잘라내지 않습니다.
- **학습 콘텐츠의 언어를 표시합니다.** Message가 학습 대상 언어이면 해당 텍스트에 올바른 `lang`을 지정합니다.

## 확장

Tooltip은 짧은 설명 하나만 소유하고, 애플리케이션의 요구는 다음 규칙으로 확장합니다.

1. **내용이 길거나 조작이 필요하면 Tooltip이 아닙니다.** 제목·본문·Action이 함께 필요하면 Popover를, 화면 흐름을 멈춰야 하면 [Bottom Sheet](./bottom-sheet.md)나 [Dialog](./dialog.md)를 사용합니다. Bubble에 slot을 추가하지 않습니다.
2. **여러 단계 안내는 상위 흐름이 소유합니다.** 온보딩 코치마크는 Tooltip을 그대로 쓰되 단계 이동·건너뛰기·배경 가리기는 [Overlay](./overlay.md)와 [Step Indicator](./indicator/step-indicator.md)를 조합한 상위 흐름에서 정의합니다.
3. **표시 조건과 기억은 제품 상태가 소유합니다.** "한 번만 보여주기", "N일 뒤 다시 보여주기" 같은 규칙은 Tooltip의 옵션으로 넣지 않고 제품의 저장 상태로 관리합니다.
4. **새 Tone은 표면·전경 토큰을 짝으로 추가합니다.** 배경과 Message 조합이 4.5:1 이상이어야 하며, 기준을 충족하는 토큰이 없으면 임의 hex나 opacity를 만들지 않고 보고합니다.
5. **새 Placement는 Flip·Shift·Arrow 규칙을 함께 정의합니다.** 모서리 배치처럼 방향을 늘릴 때 어느 방향으로 뒤집고 Arrow를 어디에 두는지 이 문서에 적습니다.
6. **Size를 추가하면 모든 값을 토큰에서 고릅니다.** padding·Message typography·Arrow 크기를 함께 정의하고, 최대 너비와 줄 수 기준도 같이 정합니다.

## 사용 가이드

- **짧은 보조 설명에만 사용합니다.** 사용자가 반드시 읽어야 하는 정보, 오류, 확인이 필요한 안내는 화면 본문이나 Dialog로 전달합니다.
- **Tooltip으로 라벨을 대신하지 않습니다.** 아이콘만 있는 버튼에는 접근성 이름을 먼저 붙이고, Tooltip은 보충 설명으로 씁니다.
- **한 화면에 Tooltip을 남발하지 않습니다.** 동시에 하나만 열고, 화면에 들어가자마자 여러 개를 띄우지 않습니다.
- **Arrow로 대상을 분명히 합니다.** 트리거가 촘촘히 붙어 있으면 Arrow를 켜고, 어느 트리거의 설명인지 보이게 합니다.
- **문구는 한 문장으로 씁니다.** 마침표 없이 짧게 쓰고 기능의 이름보다 목적을 말합니다 — [Writing Tone](../foundations/writing-tone.md) 참고.
- **트리거를 가리지 않습니다.** Tooltip이 트리거나 그다음 조작할 요소를 덮으면 Placement를 바꿉니다.

색·폰트·간격·쌓임 순서·동작은 [Color](../foundations/color.json), [Typography](../foundations/typography.json), [Spacing](../foundations/spacing.json), [Radius](../foundations/radius.json), [Elevation](../foundations/elevation.json), [Motion](../foundations/motion.json)을, 접근성과 언어 처리는 [Accessibility](../foundations/accessibility.md), [International Design](../foundations/international-design.md)을 참고합니다.
