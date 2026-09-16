# Avatar

사용자나 캐릭터를 원형 이미지로 나타내는 표시 요소입니다. 프로필, 대화 목록, 랭킹처럼 누구인지 빠르게 알아봐야 하는 자리에 씁니다. Avatar는 원형 표면과 그 안의 표현만 소유하고, 이름·상태·행동은 Avatar를 쓰는 상위 화면이 조합합니다.

## 구조

```text
Avatar
└── Content (셋 중 하나)
    ├── Image
    ├── Initials
    └── Placeholder icon
```

Avatar 안에는 Content 하나만 둡니다. 이름, 배지, 상태 점은 Avatar 바깥에서 상위 화면이 조합하며 Avatar의 크기에 포함하지 않습니다.

## 옵션

각 옵션은 독립적으로 조합합니다. 조합 전체를 별도 variant로 만들지 않습니다.

| 옵션 | 값 | 용도 |
|---|---|---|
| Size | xs / sm / md / lg / xl | 놓이는 자리의 밀도와 강조 수준 |
| Content | Image / Initials / Placeholder | 보여줄 표현 |

### Content 결정 순서

Content는 사용처가 고르는 값이 아니라 가진 데이터로 결정합니다.

| 조건 | Content |
|---|---|
| 이미지가 있고 불러오기에 성공함 | Image |
| 이미지가 없거나 불러오기에 실패했고 이름이 있음 | Initials |
| 이미지도 이름도 없음 | Placeholder |

이미지를 불러오는 동안에는 Initials 또는 Placeholder를 먼저 보여주고, 성공하면 Image로 바꿉니다. 빈 원이나 깨진 이미지 아이콘을 노출하지 않습니다.

### 조합 규칙

- 한 목록 안에서는 같은 Size를 사용합니다.
- Avatar 자체는 누를 수 없는 표시 요소입니다. 누를 수 있어야 하면 상위 control이 Avatar를 감싸고 그 control이 접근성 이름과 hit area를 소유합니다.
- Avatar 안에 텍스트 라벨, Button, 상태 점을 넣지 않습니다.
- 이미지의 원본 비율과 관계없이 원형 안을 채우고 가운데를 기준으로 잘라 냅니다.

## 공통 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| 모양 | 정원, 너비와 높이가 같음 | `radius.full` |
| 배경 | `gray.100` #F7F8F9 | `color.gray.100` |
| Image 채우기 | 원형 전체를 채우고 넘치는 부분은 잘라 냄 | — |
| Initials 색 | `fg.brand` #B94208 | `color.fg.brand` |
| Initials 정렬 | 가로·세로 중앙 | — |
| Placeholder icon | `8-ui/user`, `padding` 에셋 | `icon.$extensions.com.libitum.iconography.variants.padding` |
| Placeholder icon 색 | `fg.neutral-subtle` #868B94 | `color.fg.neutral-subtle` |
| 테두리 | 없음 | — |
| 그림자 | 없음 | — |

Initials와 Placeholder icon의 대비는 배경 `gray.100` 기준으로 각각 5.136:1, 3.220:1입니다. `brand.primary` #F46B18은 같은 배경에서 2.836:1이라 Avatar의 전경으로 쓰지 않습니다.

### Size

| Size | 지름 | 토큰 | Initials | Placeholder icon | 용도 |
|---|---:|---|---|---|---|
| xs | 24px | `spacing.24` | `typography.label.s` 10px / 14px / 0.8px | 16px `icon.size.xs` | 촘촘한 목록 행, 본문 안의 표시 |
| sm | 32px | `spacing.32` | `typography.label.m` 12px / 16px / 0.12px | 20px `icon.size.sm` | 대화 목록, 댓글 |
| md | 48px | `spacing.48` | `typography.heading.s` 18px / 24px / 0px | 24px `icon.size.md` | 카드, 랭킹 행 |
| lg | 64px | `spacing.64` | `typography.heading.m` 22px / 28px / -0.4px | 32px `icon.size.lg` | 프로필 요약 |
| xl | 96px | `spacing.96` | `typography.heading.l` 28px / 34px / -0.8px | 40px `icon.size.xl` | 프로필 화면의 대표 이미지 |

Placeholder icon은 `icon.size.*` 스케일을 Size 순서대로 한 단계씩 사용합니다. Initials는 Size가 커져도 항상 원 안에서 중앙에 놓이며 잘리지 않습니다.

### Initials

| 항목 | 규칙 |
|---|---|
| 글자 수 | 최대 2자 |
| 라틴 문자 이름 | 성과 이름의 첫 글자 2자를 대문자로 — `Kim Ray` → `KR` |
| CJK 이름 | 첫 글자 1자 — `김말랑` → `김` |
| 한 단어 이름 | 첫 글자 1자 |
| 숫자·기호·이모지로 시작하는 이름 | Initials를 만들지 않고 Placeholder를 사용 |

Initials는 이름을 줄여 보여주는 시각 표현일 뿐입니다. 보조 기술에는 줄인 글자가 아니라 전체 이름을 전달합니다. 로케일별 표기 판단은 [International Design](../foundations/international-design.md)을 따릅니다.

## 상태

Avatar는 누르거나 focus를 받는 상태가 없고 Content만 바뀝니다.

| 상태 | 값 |
|---|---|
| Image | 이미지를 원형에 채워 표시 |
| Initials | 배경 위에 이름 이니셜을 표시 |
| Placeholder | 배경 위에 사람 아이콘을 표시 |

이미지 로딩이 끝나 Content가 바뀔 때 위치·크기 animation을 사용하지 않습니다. 같은 자리에서 즉시 교체하고 레이아웃을 흔들지 않습니다.

## 동작

| 입력·조건 | 결과 |
|---|---|
| 이미지 불러오기 성공 | Placeholder 또는 Initials를 Image로 교체 |
| 이미지 불러오기 실패 | 이름이 있으면 Initials, 없으면 Placeholder로 되돌림 |
| 이름이 바뀜 | Initials를 다시 계산 |
| 글자 크기 확대 | 지름은 Size 값을 유지하고 Initials는 원 안에서 잘리지 않는 크기까지만 커짐 |
| Avatar를 감싼 control을 누름 | 해당 control의 동작을 실행. Avatar 자체는 반응하지 않음 |

지름을 Size 값보다 크게 늘리면 같은 줄의 텍스트 정렬이 흔들리므로, 글자 크기가 커질 때는 Avatar 대신 주변 레이아웃이 늘어납니다.

## 접근성

- **Avatar가 전달하는 정보를 이름으로 제공합니다.** 옆에 이름이 함께 보이면 Avatar는 장식으로 처리해 접근성 트리에서 숨기고, Avatar만 있으면 사용자 이름을 접근성 이름으로 제공합니다.
- **Initials를 그대로 읽히게 두지 않습니다.** `KR`이 아니라 `김말랑`처럼 전체 이름을 전달합니다.
- **Placeholder는 사진이 없다는 사실만 알립니다.** 아이콘 자체를 설명하지 않고 `프로필 사진 없음`처럼 상태를 전달하거나, 이름이 함께 보이면 장식으로 숨깁니다.
- **누를 수 있는 Avatar는 감싼 control이 책임집니다.** 최소 48 × 48 hit area와 focus ring, 행동의 목적을 담은 접근성 이름을 control이 제공합니다 — [Accessibility](../foundations/accessibility.md) 참고.
- **이미지에 의존해 정보를 전달하지 않습니다.** 이미지가 없어도 이름과 주변 문구만으로 누구인지 알 수 있어야 합니다.
- **대비를 유지합니다.** Initials와 Placeholder icon은 `gray.100` 배경 기준으로 대비를 확인하며, 다른 배경 위에 Avatar를 올릴 때도 원형 안의 배경은 `gray.100`을 유지합니다.

## 확장

Avatar는 원형 표면과 Content 하나만 소유하고, 애플리케이션의 요구는 다음 규칙으로 확장합니다.

1. **상태 점·배지는 상위 화면이 조합합니다.** 접속 상태, 연속 학습, 알림 개수는 Avatar의 옵션으로 넣지 않고 Avatar 바깥에 겹쳐 두는 별도 요소로 정의합니다. 이때 겹치는 위치와 최소 여백을 그 컴포넌트가 정합니다.
2. **여러 Avatar를 겹쳐 쌓는 배치는 전용 컴포넌트로 만듭니다.** 겹침 간격, 최대 표시 개수, `+3` 같은 나머지 표기, 겹칠 때 필요한 테두리를 Avatar Group에서 정의하고 Avatar의 값은 그대로 사용합니다.
3. **새 Size는 `spacing` 토큰에서 고릅니다.** Initials typography와 Placeholder icon 크기를 함께 정하고, 원 안에서 Initials가 잘리지 않는지 확인합니다.
4. **캐릭터·그룹처럼 다른 모양이 필요하면 Shape 옵션으로 추가합니다.** 정원 이외의 모양을 쓰려면 `radius` 토큰에서 값을 고르고 Image·Initials·Placeholder 세 Content에 모두 정의합니다.
5. **이미지 출처와 캐싱은 제품이 소유합니다.** 어떤 이미지를 언제 내려받고 얼마나 보관할지는 애플리케이션이 정하며 이 문서에서 다루지 않습니다.
6. **데이터에서 파생되는 표현은 규칙을 먼저 정의합니다.** 기본 이미지 자동 생성이나 이름으로 배경색을 정하는 규칙이 필요하면 사용할 토큰과 결정 규칙을 먼저 정하고 이 문서에 추가합니다.

## 사용 가이드

- **누구인지 알려야 할 때만 사용합니다.** 장식이 필요한 자리에는 Avatar 대신 일러스트나 아이콘을 사용합니다.
- **이름과 함께 두는 것을 기본으로 합니다.** Avatar만으로 사람을 구분하게 하지 않습니다.
- **한 목록에서 Size를 섞지 않습니다.** 같은 의미의 행은 같은 크기로 둡니다.
- **이미지를 강조하려고 테두리나 그림자를 더하지 않습니다.** 구분이 필요하면 주변 간격을 넓힙니다.
- **같은 색 표면 위에 두지 않습니다.** Avatar의 배경은 `gray.100` #F7F8F9입니다. 같은 색 표면 위에서는 Placeholder와 Initials의 원 경계가 보이지 않으므로 `white` #FFFFFF나 `elevation.surface.default` #FFFDFC처럼 다른 표면 위에 둡니다. 배경을 바꿀 수 없으면 Avatar 대신 이름만 보여주는 표현을 사용합니다.
- **Placeholder를 오류 표시로 쓰지 않습니다.** 이미지를 불러오지 못한 사실을 사용자에게 알릴 필요가 없다면 조용히 Initials나 Placeholder로 대체합니다.

색·폰트·간격·아이콘은 [Color](../foundations/color.json), [Typography](../foundations/typography.json), [Spacing](../foundations/spacing.json), [Radius](../foundations/radius.json), [Iconography](../foundations/iconography.json)를, 접근성과 이름 표기는 [Accessibility](../foundations/accessibility.md), [International Design](../foundations/international-design.md)을 참고합니다.
