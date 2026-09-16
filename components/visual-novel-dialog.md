# Visual Novel Dialog

장면 그림 위에 얹혀 이야기의 대사와 서술을 한 번에 한 덩어리씩 보여주는 패널입니다. 비주얼 노벨 형식의 학습 스토리에서 화자의 말, 상황 서술, 속마음을 번갈아 전달할 때 씁니다. Visual Novel Dialog는 패널과 그 안의 텍스트만 소유하고, 장면 그림·선택지·진행 제어는 상위 스토리 화면이 조합합니다.

## 구조

```text
Story scene (상위 화면이 소유)
├── Scene art
└── Visual Novel Dialog
    ├── Speaker row (선택)
    │   ├── Avatar (선택)
    │   └── Speaker name
    ├── Line
    └── Continue indicator (선택)
```

한 번에 한 덩어리의 텍스트만 보여줍니다. 지나간 대사를 패널 안에 쌓지 않고, 선택지는 패널 안에 넣지 않습니다.

## 옵션

각 옵션은 독립적으로 조합합니다. 조합 전체를 별도 variant로 만들지 않습니다.

| 옵션 | 값 | 용도 |
|---|---|---|
| Variant | Speech / Narration / Thought | 말한 것인지, 상황 서술인지, 속마음인지 |
| Surface | Opaque / Translucent | 장면 그림을 완전히 가릴지 비치게 둘지 |
| Avatar | On / Off | 화자의 얼굴을 함께 보여줄지 |
| Reveal | Instant / Typewriter | 대사를 한 번에 보여줄지 한 글자씩 보여줄지 |
| Advance | Tap / Auto | 다음 대사로 넘어가는 방식 |
| Continue indicator | On / Off | 다음 대사가 남아 있음을 알리는 표시 |
| Content language | UI language / Learning language | Line의 언어 semantics |

### 조합 규칙

- Narration은 Speaker row를 두지 않습니다. 서술은 화자가 없는 텍스트입니다.
- Translucent는 `opacity.surface` 90%만 사용합니다. 더 낮추면 밝은 장면 위에서 Narration Line의 대비가 4.5:1 아래로 떨어집니다.
- Translucent에서 Thought의 Speaker name과 테두리는 `brand.secondary`를 사용합니다. `brand.primary`는 밝은 장면과 합성했을 때 4.201:1로 기준에 미달합니다.
- Speech와 Thought는 Speaker name을 반드시 둡니다. 이름을 모르면 `???`처럼 이야기가 정한 임시 이름을 쓰고 빈 자리로 두지 않습니다.
- Avatar는 Speaker name이 있을 때만 켤 수 있습니다.
- Auto는 사용자가 끌 수 있어야 합니다. 끄는 방법이 없으면 Tap만 사용합니다.
- 선택지는 패널 안에 넣지 않고 [Option Selector](./option-selector.md)로 패널 아래에 둡니다. 선택지가 떠 있는 동안에는 Advance를 멈춥니다.
- 한 장면에서 Variant는 대사마다 바뀔 수 있지만 패널의 크기와 위치는 바뀌지 않습니다.

## 공통 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| 너비 | 부모가 제공하는 너비를 채움, 화면 기준으로는 좌우 여백 안쪽 | `layout.screen.padding-x` |
| 높이 | 콘텐츠에 맞게 늘어남, 아래 최소 높이 이상 | — |
| 가로 padding | 24px | `spacing.24` |
| 세로 padding | 20px | `spacing.20` |
| 모서리 | 16px | `radius.lg` |
| 배경 | Surface에 따라 `gray.950` #1A1C20 불투명 또는 90% | `color.gray.950`, `opacity.surface` |
| 그림자 | `elevation.shadow.s3` | `elevation.shadow.s3` |
| 쌓임 순서 | Scene art 위 | `elevation.z.floating` |
| Avatar ↔ Speaker name 간격 | 8px | `spacing.8` |
| Speaker row ↔ Line 간격 | 12px | `spacing.12` |
| Speaker name 폰트 | Pretendard Variable Medium 500, 14px / 20px / 0px | `typography.dialogue.speaker` |
| Line 폰트 | Pretendard Variable Medium 500, 16px / 24px / 0px | `typography.dialogue.body` |
| Line 최소 높이 | 2줄 | — |
| Avatar | `sm` 32px | — |

배경은 `gray.950` 한 가지를 쓰고 Surface로 불투명도만 바꿉니다. 색을 장면마다 바꾸지 않습니다.

Line의 자리는 항상 2줄 이상을 확보합니다. 대사 길이에 따라 패널 높이가 매번 달라지면 장면이 흔들리고, 다음 대사를 누를 위치도 계속 바뀝니다.

Avatar는 [Avatar](./avatar.md)의 `sm`을 사용합니다. 이미지가 없으면 Avatar 스펙의 결정 순서에 따라 Initials나 Placeholder를 보여줍니다.

### Surface

| Surface | 배경 | 토큰 | 용도 |
|---|---|---|---|
| Opaque | `gray.950` #1A1C20 불투명 | `color.gray.950` | 기본값. 장면 그림과 무관하게 같은 대비를 보장 |
| Translucent | `gray.950` #1A1C20 90% | `color.gray.950`, `opacity.surface` | 장면의 분위기를 이어가야 할 때 |

Translucent는 장면 그림이 패널 뒤로 비치므로 글자 대비가 장면에 따라 달라집니다. 가장 불리한 조건인 흰 장면과 합성한 값은 다음과 같습니다.

| 조합 | 흰 장면 위 대비 |
|---|---:|
| Speech Speaker name | 12.042:1 |
| Speech Line | 11.013:1 |
| Narration Line | 6.035:1 |
| Thought Line | 11.379:1 |
| Thought Speaker name·테두리 (`brand.secondary` #FF8D28) | 5.486:1 |

90%보다 낮은 불투명도는 사용하지 않습니다. 80%로 낮추면 흰 장면 위에서 Narration Line이 4.282:1이 되어 기준에 미달합니다.

### Variant

| Variant | 테두리 | Speaker name | Line | 용도 |
|---|---|---|---|---|
| Speech | 없음 | `gray.50` #F9F9FA | `gray.300` #EEEFF1 | 등장인물이 소리 내어 한 말 |
| Narration | 없음 | 두지 않음 | `gray.600` #B0B3BA | 상황과 배경을 설명하는 서술 |
| Thought | 1px, `brand.primary` #F46B18 (Translucent는 `brand.secondary` #FF8D28) | `brand.primary` #F46B18 (Translucent는 `brand.secondary` #FF8D28) | `brand.reward-disabled-surface` #FFF0E6 | 등장인물의 속마음 |

Thought의 테두리는 `stroke.width.thin`을 사용하며 패널 크기에 포함합니다.

### 대비

| 조합 | 대비 |
|---|---:|
| Speech Speaker name | 16.215:1 |
| Speech Line | 14.829:1 |
| Narration Line | 8.127:1 |
| Thought Speaker name·테두리 | 5.657:1 |
| Thought Line | 15.321:1 |

Line은 16px 일반 텍스트이므로 4.5:1, Thought의 테두리는 control 경계가 아닌 의미 있는 그래픽이므로 3:1을 적용합니다. 서술을 흐리게 보이려고 `gray.800` #555D6D를 쓰면 같은 배경에서 2.578:1로 기준에 미달하므로 사용하지 않습니다.

### Continue indicator

| 항목 | 값 | 토큰 |
|---|---|---|
| 아이콘 | `8-ui/arrow-down`, `padding` 에셋 | `icon.$extensions.com.libitum.iconography.variants.padding` |
| 크기 | 16 × 16px | `icon.size.xs` |
| 색 | 해당 Variant의 Line 색 | — |
| 위치 | 패널 안쪽 논리적 끝 가장자리, Line의 마지막 줄과 세로 중앙 정렬 | — |
| Line ↔ Continue indicator 간격 | 8px | `spacing.8` |
| 애니메이션 | 없음 | — |

Continue indicator는 다음 대사가 남아 있다는 표시일 뿐 누를 수 있는 control이 아닙니다. 진행은 상위 화면의 탭 영역이 담당하며, Continue indicator는 접근성 트리에서 숨깁니다.

깜빡이거나 움직이는 표현은 사용하지 않습니다. 읽는 중에 움직이는 요소가 있으면 글을 따라가기 어렵습니다.

## 상태

| 상태 | 값 |
|---|---|
| Revealing | Reveal이 Typewriter일 때 Line을 한 글자씩 드러내는 중 |
| Ready | Line을 모두 보여주고 다음 입력을 기다림 |

Continue indicator는 Ready에서만 표시합니다. Revealing 중에는 다음 대사가 준비되었다고 알리지 않습니다.

Variant가 바뀌어도 패널은 같은 자리에 머무릅니다. 색 전환은 `motion.duration.color` 150ms와 `motion.easing.easing`을 사용하고, 위치·크기 animation은 사용하지 않습니다.

## 동작

| 입력·조건 | 결과 |
|---|---|
| Revealing 중 탭·Space·Enter | 남은 글자를 모두 표시하고 Ready로 전환 |
| Ready에서 탭·Space·Enter | 다음 대사로 넘어감 |
| Advance가 Auto이고 Ready | 사용자가 정한 시간이 지나면 다음 대사로 넘어감 |
| 선택지가 표시됨 | Advance를 멈추고 선택을 기다림 |
| 마지막 대사에서 진행 | 장면을 끝내고 다음 화면으로 넘어감 |
| 동작 줄이기가 켜져 있음 | Typewriter를 끄고 Line을 즉시 모두 표시 |
| 글자 크기 확대·화면 회전 | 패널 높이를 다시 계산하고 Line을 자르지 않음 |

진행을 위한 탭 영역은 상위 스토리 화면이 소유합니다. 화면 전체를 탭 영역으로 쓰더라도 선택지, 메뉴, 소리 끄기 같은 control 위에서는 진행이 일어나지 않게 합니다.

## 접근성

- **대사 전체를 바로 제공합니다.** Typewriter로 보여주는 중에도 보조 기술에는 문장 전체를 제공합니다. 글자가 드러나는 과정을 한 글자씩 읽히지 않게 합니다.
- **화자와 대사를 함께 읽힙니다.** `아리아: 오늘 하늘이 참 예쁘다`처럼 Speaker name과 Line이 이어서 읽히도록 연결합니다. Narration은 화자 없이 본문만 읽힙니다.
- **Variant를 색만으로 구분하지 않습니다.** 속마음은 테두리와 색만이 아니라 Speaker name과 문맥으로도 구분되게 하고, 필요하면 보조 기술에 `속마음`처럼 종류를 함께 전달합니다.
- **자동 진행은 끌 수 있어야 합니다.** Auto는 사용자가 멈추거나 속도를 조절할 수 있어야 하며, 읽는 속도를 이유로 내용을 놓치지 않게 합니다.
- **진행을 keyboard로도 할 수 있어야 합니다.** 탭이 유일한 진행 방법이면 안 되며, Space·Enter로 같은 결과를 제공합니다.
- **학습 콘텐츠의 언어를 표시합니다.** Line이 학습 대상 언어이면 해당 텍스트에 올바른 `lang`을 지정하고, UI 문구에는 UI locale을 유지합니다.
- **확대와 번역 길이를 허용합니다.** 글자 크기를 키우면 패널이 늘어나고, Line을 잘라내거나 말줄임하지 않습니다.
- **Avatar는 장식으로 처리합니다.** Speaker name이 같은 정보를 전달하므로 접근성 트리에서 숨깁니다.

## 확장

Visual Novel Dialog는 한 덩어리의 텍스트만 소유하고, 이야기의 요구는 다음 규칙으로 확장합니다.

1. **선택지는 Option Selector를 조합합니다.** 패널 안에 선택지 slot을 만들지 않고, 패널 아래에 [Option Selector](./option-selector.md)를 두고 진행을 멈춥니다.
2. **지나간 대사는 별도 컴포넌트가 소유합니다.** 대사 기록을 다시 보는 화면이 필요하면 Dialog Log를 따로 정의하고, 패널 안에 지난 문장을 쌓지 않습니다.
3. **새 Variant는 표면·전경 토큰을 짝으로 추가합니다.** 회상이나 시스템 안내처럼 종류를 늘릴 때 Line 4.5:1, 의미 있는 테두리 3:1을 확인하고, 기준을 충족하는 토큰이 없으면 만들지 않고 보고합니다.
4. **소리·자동 재생·속도는 상위 화면이 소유합니다.** 음성 재생 버튼, 자동 진행 속도, 건너뛰기 같은 control은 패널 밖에 두고 이 문서의 Advance 규칙만 따릅니다.
5. **감정이나 상황에 따른 강조는 텍스트 안에서 하지 않습니다.** 글자 크기·굵기를 문장마다 바꾸지 않고, 필요하면 Variant를 추가하거나 장면 연출로 표현합니다.

## 사용 가이드

- **이야기의 한 덩어리만 보여줍니다.** 한 번에 읽을 수 있는 길이로 끊고, 긴 설명은 여러 대사로 나눕니다.
- **기본은 Opaque입니다.** 장면 분위기를 이어가야 할 때만 Translucent를 쓰고, 글자가 많은 장면이나 밝고 복잡한 그림 위에서는 Opaque로 되돌립니다.
- **패널 위치를 고정합니다.** 대사 길이나 Variant에 따라 패널이 오르내리면 다음을 누르기 어렵습니다.
- **Narration에 화자를 넣지 않습니다.** 서술에 이름이 필요하면 Speech로 바꿉니다.
- **Thought를 남용하지 않습니다.** 속마음이 이어지면 Speech와 구분이 흐려지므로 장면마다 한두 번으로 제한합니다.
- **대사 원문을 유지합니다.** 학습 콘텐츠이므로 UX writing 대상으로 고치거나 번역하지 않습니다.
- **UI 문구는 대사와 구분합니다.** 다음·건너뛰기 같은 문구는 [Writing Tone](../foundations/writing-tone.md)을 따르고 패널 밖에 둡니다.

색·폰트·간격·선 두께·레이아웃·표면·동작은 [Color](../foundations/color.json), [Typography](../foundations/typography.json), [Spacing](../foundations/spacing.json), [Stroke](../foundations/stroke.json), [Layout](../foundations/layout.json), [Radius](../foundations/radius.json), [Elevation](../foundations/elevation.json), [Motion](../foundations/motion.json)을, 접근성과 언어 처리는 [Accessibility](../foundations/accessibility.md), [International Design](../foundations/international-design.md)을 참고합니다.
