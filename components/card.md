# Card

화면 여백 안쪽에 떠서 한 주제의 정보와 행동을 하나의 덩어리로 묶는 표면입니다. 오늘의 학습, 말하기 문장, 결과 요약처럼 서로 관련된 콘텐츠를 함께 보여줄 때 씁니다. Card는 표면과 영역 배치만 정의하고, 각 영역 안의 콘텐츠는 기존 컴포넌트를 조합합니다.

## 구조

```text
Card
├── Media (선택, Card 가장자리까지)
└── Content
    ├── Header (선택)
    │   ├── Title block
    │   │   ├── Overline (선택)
    │   │   └── Title
    │   └── Trailing (선택)
    ├── Body (선택)
    └── Footer (선택)
        └── Action 1~2개
```

Header와 Body 중 하나 이상은 반드시 있어야 합니다. 사용하지 않는 영역은 간격과 함께 제거하고 빈 자리를 남기지 않습니다.

## 옵션

각 옵션은 독립적으로 조합합니다. 조합 전체를 별도 variant로 만들지 않습니다.

| 옵션 | 값 | 용도 |
|---|---|---|
| Padding | M / L | 화면 안에서 Card가 차지하는 비중 |
| Interaction | Static / Interactive | Card 전체가 하나의 이동 행동인지 결정 |
| Media | None / Top | 이미지·일러스트를 Card 상단 가장자리까지 표시 |
| Header | None / Title / Overline + Title | Card의 주제와 분류 안내 |
| Trailing | None / Indicator / Action | Title 옆의 상태 표시나 보조 행동 |
| Footer | None / Action | Card 내용에 대한 주 행동 |

### 조합 규칙

- Interactive Card에는 Footer Action이나 Trailing Action을 두지 않습니다. Card 안에 다른 interactive element가 필요하면 Static Card를 사용합니다.
- Interactive Card의 Trailing에는 이동을 나타내는 `8-ui/arrow-right` 아이콘을 둡니다. 상태를 함께 알려야 하면 Body에 [Status Indicator](./indicator/status-indicator.md)를 둡니다.
- Trailing Indicator는 [Status Indicator](./indicator/status-indicator.md)처럼 누를 수 없는 요소만 둡니다. Trailing Action은 [Round Button](./round-button.md) 1개만 둡니다.
- Footer Action은 최대 2개입니다. 3개 이상의 행동이 필요하면 Card를 나누거나 [Bottom Sheet](./bottom-sheet.md)로 옮깁니다.
- Media는 Card 상단에만 둡니다. Content 중간이나 하단에 이미지가 필요하면 Body 안의 콘텐츠로 배치하고 Content padding을 유지합니다.
- Card 안에 Card를 넣지 않습니다. Card 안의 묶음은 간격으로 구분합니다.

## 공통 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| 너비 | 부모가 제공하는 너비를 채움, 화면 기준으로는 좌우 여백 안쪽 | `layout.screen.padding-x` |
| 높이 | 콘텐츠와 padding에 맞게 늘어남 | — |
| 배경 | `elevation.surface.default` #FFFDFC | `elevation.surface.default` |
| 모서리 | 사방 12px | `radius.md` |
| 그림자 | `0 1px 4px rgba(26, 28, 32, .08)` | `elevation.shadow.s1` |
| 테두리 | 없음 | — |
| 쌓임 순서 | 기본 페이지 레이아웃과 같은 층 | `elevation.z.default` |
| 이웃한 Card 사이 간격 | 16px | `layout.gap.block` |

Card는 `elevation.surface.basement` #FAF7F4 같은 화면 배경 위에 둡니다. 바텀 시트·다이얼로그처럼 이미 떠 있는 표면 안에는 Card를 두지 않습니다.

높이를 고정하지 않습니다. 같은 줄의 Card 높이를 맞춰야 하면 상위 레이아웃이 stretch로 맞추고, Card는 콘텐츠를 자르지 않습니다.

### Padding

| Padding | Content padding | 토큰 | 용도 |
|---|---|---|---|
| M | 사방 16px | `spacing.16` | 목록이나 한 화면에 여러 Card를 둘 때. 기본값 |
| L | 사방 24px | `spacing.24` | 말하기 문장처럼 화면의 중심이 되는 Card 하나 |

한 목록 안에서는 같은 Padding을 사용합니다.

### Content 간격

| 관계 | 간격 | 토큰 |
|---|---|---|
| Overline ↔ Title | 4px | `spacing.4` |
| Title block ↔ Trailing | 8px | `spacing.8` |
| Header ↔ Body | 12px | `spacing.12` |
| Body ↔ Footer | 20px | `spacing.20` |
| Footer Action 사이 | 8px | `spacing.8` |

### Header

| 항목 | 값 | 토큰 |
|---|---|---|
| Overline | Pretendard Variable Bold 700, 12px / 16px / 0.12px, `fg.brand` #B94208 | `typography.label.m`, `color.fg.brand` |
| Title | Pretendard Variable Bold 700, 18px / 24px / 0px, `fg.neutral` #1A1C20 | `typography.heading.s`, `color.fg.neutral` |
| Title 줄 수 | 제한 없음 | — |
| Trailing 정렬 | Title block의 첫 줄과 위쪽 정렬 | — |
| 이동 아이콘 | 20 × 20px, `padding` 에셋, `fg.neutral-subtle` #868B94 | `icon.size.sm`, `color.fg.neutral-subtle` |

Overline은 Card가 무엇에 대한 것인지 분류를 알려주고, Title은 Card의 주제를 한 줄로 말합니다. Overline은 생략할 수 있지만 Header를 쓰면 Title은 필수입니다.

### Body

Body는 콘텐츠 slot입니다. 텍스트만 둘 때는 다음 기본값을 사용하고, 그 밖의 콘텐츠는 해당 컴포넌트 스펙을 따릅니다.

| 항목 | 값 | 토큰 |
|---|---|---|
| 본문 | Pretendard Variable Medium 500, 14px / 20px / 0px, `fg.neutral-muted` #555D6D | `typography.body.m`, `color.fg.neutral-muted` |
| 너비 | Content padding 안쪽을 채움 | — |

### Footer

Action은 [Button](./button.md)을 **M 사이즈(36px), Fill**로 사용합니다. 2개면 세로로 쌓고 강조가 높은 Action을 위에 둡니다. 한 Card에서 Neutral 또는 Brand Action은 1개만 둡니다.

### Media

| 항목 | 값 | 토큰 |
|---|---|---|
| 위치 | Card 상단, 좌우·상단 padding 없이 가장자리까지 | — |
| 비율 | 사용처가 정한 고정 비율, 이미지는 비율 안을 채움 | — |
| 모서리 | 상단 두 모서리만 Card와 같은 12px, 하단 0px | `radius.md` |
| Media ↔ Content | Content padding을 그대로 적용 | — |

Media 위에 잠김·재생 같은 상태나 행동을 올려야 하면 [Overlay](./overlay.md)의 Area를 사용합니다.

Card는 Media의 상단 모서리를 맞추기 위해서만 clipping을 사용합니다. Content 영역은 clip하지 않아 안쪽 control의 focus ring이 잘리지 않게 합니다.

## 상태

Static Card는 상태가 없습니다. 안쪽 Button·Round Button은 각 컴포넌트의 상태를 따릅니다.

Interactive Card는 다음 상태를 가집니다.

| 상태 | 배경 | 그림자 | 콘텐츠 |
|---|---|---|---|
| Default | `elevation.surface.default` #FFFDFC | `elevation.shadow.s1` | 기본 색 유지 |
| Pressed | `gray.100` #F7F8F9 | `elevation.shadow.s1` | 기본 색 유지 |

Pressed의 배경 전환은 `motion.duration.pressed` 150ms와 `motion.easing.easing`을 사용합니다. 크기·위치 animation은 사용하지 않고, 동작 줄이기가 켜져 있어도 색 변화는 유지합니다.

Interactive Card에는 Disabled를 두지 않습니다. 아직 갈 수 없는 목적지는 Static Card로 표시하고 [Status Indicator](./indicator/status-indicator.md)의 Locked와 이유 문구를 함께 둡니다.

### Focus indicator

Interactive Card는 Default·Pressed 표현을 유지한 채 Card 바깥 윤곽에 공통 focus ring을 더합니다.

| 항목 | 값 | 토큰 |
|---|---|---|
| Inner ring | 2px solid, `white` #FFFFFF | `stroke.width.strong`, `color.white` |
| Outer ring | 2px solid, `border.strong` #141115 | `stroke.width.strong`, `color.border.strong` |
| Ring 사이 간격 | 0px | `spacing.0` |
| 전체 외곽 범위 | 4px | `spacing.4` |
| 형태 | Card의 바깥 윤곽을 따름 | `radius.md` |

- Web은 `:focus-visible`에 ring을 적용합니다.
- iOS·Android·ReactLynx의 keyboard focus 표시와 플랫폼별 적용은 [Accessibility의 Focus indicator](../foundations/accessibility.md#focus-indicator)를 따릅니다.
- 이웃한 Card 사이 간격 16px이 ring 범위 4px보다 넓으므로 ring이 다른 Card에 가려지지 않습니다. 상위 스크롤 영역이 ring을 자르지 않는지 확인합니다.

## 동작

| 입력·조건 | 결과 |
|---|---|
| Interactive Card 탭·클릭 | Card의 목적지로 이동 |
| Interactive Card에서 Enter, button role이면 Space도 | 탭·클릭과 같은 결과 |
| Static Card 탭·클릭 | 아무 동작 없음. 안쪽 control만 반응 |
| 긴 Title·본문·큰 글자 | 높이가 콘텐츠에 맞게 늘어나며 내용 전체 표시 |

Interactive Card는 Card 전체가 hit area입니다. 콘텐츠가 가장 적을 때도 높이는 Content padding과 Title만으로 48px 이상이 됩니다.

## 접근성

- **Static Card는 묶음으로 노출합니다.** Title을 화면 구조에 맞는 heading으로 제공하고, 여러 Card가 이어지면 목록으로 묶어 개수를 알 수 있게 합니다.
- **Interactive Card는 하나의 control로 노출합니다.** 다른 화면으로 이동하면 link, 현재 화면에서 동작을 실행하면 button role을 사용합니다. Card 안의 텍스트가 여러 focus node로 나뉘지 않게 합니다.
- **Interactive Card의 이름은 Title입니다.** Overline이나 상태가 목적지 구분에 필요하면 이름에 함께 넣고, 긴 본문은 이름이 아니라 설명으로 연결합니다.
- **interactive element를 중첩하지 않습니다.** Interactive Card 안에 Button, 링크, 입력을 두지 않습니다.
- **이동 아이콘과 장식용 Media는 접근성 트리에서 숨깁니다.** 정보가 있는 Media에는 내용을 설명하는 대체 텍스트를 제공합니다.
- **읽기 순서는 시각 순서와 같습니다.** Media, Header, Body, Footer 순서로 제공합니다.
- **학습 콘텐츠의 언어를 표시합니다.** Body에 학습 대상 언어의 문장이 있으면 해당 텍스트에 올바른 `lang`을 지정하고 Title·Action은 UI locale을 유지합니다.
- **확대와 번역 길이를 허용합니다.** 글자 크기 확대, 긴 번역, RTL에서 높이를 고정하거나 Title을 말줄임하지 않습니다. RTL에서는 Trailing과 이동 아이콘이 논리적 끝 가장자리로 이동하고 이동 아이콘을 좌우 반전합니다.

## 확장

Card는 표면을 소유하고, 콘텐츠는 slot에 조합해 확장합니다.

1. **새 콘텐츠는 slot에 조합합니다.** 문장, 오디오 재생, 녹음 버튼처럼 과제별 콘텐츠는 Body에 기존 컴포넌트를 배치하고 Card의 variant를 늘리지 않습니다.
2. **반복되는 조합은 전용 Card 스펙으로 이름을 붙입니다.** 여러 화면에서 같은 slot 조합이 반복되면 `Speak Card`처럼 Card를 기반으로 한 전용 스펙을 만듭니다. 전용 스펙은 slot 안의 콘텐츠·동작·문구만 정의하고 배경·모서리·그림자·Padding은 Card를 그대로 따릅니다.
3. **표면 값을 전용 Card에서 바꾸지 않습니다.** 다른 배경·모서리·그림자가 필요하면 먼저 [Bottom Sheet](./bottom-sheet.md)나 [Dialog](./dialog.md) 같은 다른 표면이 맞는지 검토합니다. 그래도 Card가 맞다면 모든 Card에 적용되는 옵션으로 이 문서에 추가합니다.
4. **새 상호작용은 별도 컴포넌트로 분리합니다.** 선택지처럼 Selected 상태가 필요하거나 끌어서 옮기는 Card는 Interaction 값을 늘리지 않고 전용 컴포넌트로 정의합니다.
5. **새 Padding은 spacing 토큰에서 고릅니다.** Padding을 추가해도 Content 간격과 Header·Body 폰트는 유지하고, 필요한 값이 토큰에 없으면 만들지 않고 보고합니다.

## 사용 가이드

- **한 Card에는 한 주제만 담습니다.** 서로 다른 목적의 정보와 행동은 Card를 나눕니다.
- **모든 항목을 Card로 감싸지 않습니다.** 짧은 텍스트 한 줄의 반복은 목록으로 보여주고, 묶음이 필요한 정보만 Card로 만듭니다.
- **화면의 중심 Card는 하나만 L로 둡니다.** 여러 Card가 모두 L이면 무엇이 중요한지 구분하기 어렵습니다.
- **Card 전체를 누를 수 있을 때는 안에 버튼을 두지 않습니다.** 행동이 여러 개면 Static Card와 Footer Action을 사용합니다.
- **그림자로만 누를 수 있음을 알리지 않습니다.** Interactive Card에는 이동 아이콘을 두고 Title로 목적지를 말합니다.
- **Title은 기능 이름보다 내용을 말합니다.** Title과 Action 문구는 [Writing Tone](../foundations/writing-tone.md)을 따르고 마침표를 붙이지 않습니다.
- **학습 콘텐츠는 원문을 유지합니다.** Body의 예문·지문은 UX writing 대상으로 고치거나 번역하지 않습니다.

색·폰트·간격·표면·동작은 [Color](../foundations/color.json), [Typography](../foundations/typography.json), [Spacing](../foundations/spacing.json), [Layout](../foundations/layout.json), [Radius](../foundations/radius.json), [Elevation](../foundations/elevation.json), [Iconography](../foundations/iconography.json), [Motion](../foundations/motion.json)을, 접근성과 언어 처리는 [Accessibility](../foundations/accessibility.md), [International Design](../foundations/international-design.md)을 참고합니다.
