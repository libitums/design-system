# Fog

스크롤 영역의 가장자리를 배경색으로 서서히 흐리게 해 콘텐츠가 그 방향으로 더 이어진다는 것을 알리는 gradient 층입니다. 가로로 넘기는 목록, 긴 대화·지문처럼 스크롤되는 영역의 끝에 씁니다. Fog는 흐림 층만 소유하고, 스크롤 가능 여부와 콘텐츠는 Fog를 쓰는 스크롤 컨테이너가 정합니다.

## 구조

```text
Scroll container
├── Content (스크롤되는 콘텐츠)
└── Fog (방향마다 1개, 스크롤 viewport 가장자리에 고정)
```

Fog는 콘텐츠와 함께 스크롤되지 않고 viewport의 가장자리에 머뭅니다. Fog의 크기는 Content의 레이아웃에 영향을 주지 않습니다.

## 옵션

각 옵션은 독립적으로 조합합니다. 조합 전체를 별도 variant로 만들지 않습니다.

| 옵션 | 값 | 용도 |
|---|---|---|
| Direction | Top / Bottom / Start / End | 콘텐츠가 더 이어지는 방향 |
| Size | S / M / L | 흐림이 차지하는 길이 |
| Color | 놓인 표면의 배경 토큰 | Fog가 녹아드는 끝 색 |

### 조합 규칙

- Fog 하나는 한 방향만 흐립니다. 두 방향이 필요하면 방향마다 Fog를 하나씩 둡니다.
- 한 스크롤 축에는 Fog를 최대 2개(Top + Bottom 또는 Start + End)까지 둡니다.
- 한 스크롤 컨테이너 안의 Fog는 같은 Size와 Color를 사용합니다.
- Color는 Fog가 놓인 표면의 배경 토큰과 같게 합니다. 다르면 Fog의 끝에 경계선이 보입니다.
- 스크롤할 수 없는 영역에는 Fog를 두지 않습니다. 넘치는 콘텐츠를 잘라 감추는 용도로 쓰지 않습니다.

## 공통 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| 위치 | 스크롤 viewport의 해당 가장자리에 고정 | — |
| 교차 축 크기 | Top·Bottom은 viewport 너비, Start·End는 viewport 높이를 채움 | — |
| Gradient | linear, 콘텐츠 쪽 Color 불투명도 0% → 가장자리 쪽 Color 불투명도 100% | — |
| 모서리 | 스크롤 컨테이너의 모서리를 따라 clip | — |
| 쌓임 순서 | Content 위, 컨테이너 안의 고정 헤더·Button 아래 | — |
| pointer 입력 | 받지 않고 아래 Content로 통과 | — |
| 테두리·그림자 | 없음 | — |

Gradient의 투명한 쪽은 Color와 같은 색의 불투명도 0%로 만듭니다. `transparent`처럼 다른 색의 투명값을 쓰면 렌더러에 따라 중간 구간이 탁해집니다.

### Direction

| Direction | 위치 | Gradient 방향 |
|---|---|---|
| Top | viewport 위쪽 가장자리 | 아래쪽 투명 → 위쪽 Color |
| Bottom | viewport 아래쪽 가장자리 | 위쪽 투명 → 아래쪽 Color |
| Start | viewport 논리적 시작 가장자리 | 끝 쪽 투명 → 시작 쪽 Color |
| End | viewport 논리적 끝 가장자리 | 시작 쪽 투명 → 끝 쪽 Color |

Start와 End는 물리적 좌우가 아니라 읽기 방향을 따릅니다. LTR에서 Start는 왼쪽, RTL에서는 오른쪽입니다.

### Size

| Size | 길이 | 토큰 | 용도 |
|---|---:|---|---|
| S | 40px | `spacing.40` | 가로 목록, 높이가 낮은 영역 |
| M | 80px | `spacing.80` | 세로 스크롤 영역의 기본값 |
| L | 120px | 현재 대응 토큰 없음 | 화면 대부분을 차지하는 긴 지문·대화 |

Fog의 길이는 viewport 길이의 절반을 넘지 않게 합니다. 화면 회전이나 글자 확대로 viewport가 좁아져 절반을 넘으면 한 단계 작은 Size를 사용합니다.

### Color

| 놓인 표면 | Color |
|---|---|
| 흰 표면 | `white` #FFFFFF |
| 기본 콘텐츠 표면 | `elevation.surface.default` #FFFDFC |
| 화면 배경 | `elevation.surface.basement` #FAF7F4 |
| 바텀 시트·다이얼로그 같은 떠 있는 표면 | `elevation.surface.floating` #FFF3EA |
| 어두운 장면 | `gray.950` #1A1C20 |

이미지·gradient처럼 단색이 아닌 배경 위에서는 끝 색을 하나로 정할 수 없으므로 Fog를 쓰지 않습니다.

## 상태

| 상태 | 조건 |
|---|---|
| Hidden | 해당 방향으로 더 볼 콘텐츠가 없음 |
| Visible | 해당 방향으로 viewport 밖의 콘텐츠가 남아 있음 |

Hidden과 Visible은 불투명도로 전환하며 `motion.duration.color` 150ms와 `motion.easing.easing`을 사용합니다. 위치·크기 animation은 사용하지 않고, 동작 줄이기가 켜져 있어도 불투명도 전환은 유지합니다.

## 동작

| 입력·조건 | 결과 |
|---|---|
| Content가 viewport보다 짧음 | 모든 Fog를 Hidden으로 둠 |
| 스크롤 시작 위치 | Top·Start는 Hidden, Bottom·End는 Visible |
| 스크롤 중간 | 콘텐츠가 남은 방향의 Fog를 모두 Visible |
| 한쪽 끝까지 스크롤 | 그 방향의 Fog를 Hidden으로 전환 |
| Fog 위를 탭·클릭 | Fog 아래의 Content가 입력을 받음 |
| Content 크기 변경·글자 확대 | 스크롤 가능 여부와 각 Fog의 상태를 다시 계산 |

## 접근성

- **Fog는 장식 층입니다.** 접근성 트리에서 숨기고 focus를 받지 않습니다.
- **focus를 받은 요소가 Fog에 가려지지 않게 합니다.** keyboard로 focus를 옮기면 해당 요소가 Fog 밖에 오도록 스크롤 컨테이너에 Fog 길이만큼 scroll padding을 둡니다.
- **끝까지 스크롤하면 Fog를 걷습니다.** Fog 아래의 텍스트는 대비가 낮아지므로 마지막 콘텐츠까지 온전한 대비로 읽을 수 있어야 합니다.
- **스크롤할 수 있다는 정보를 Fog에만 맡기지 않습니다.** 목록은 목록 semantics로 전체 개수와 현재 위치를 제공합니다.
- **RTL에서는 Start·End가 반대쪽 가장자리로 이동합니다.** 물리적 Left·Right로 고정하지 않습니다.

## 확장

Fog는 한 방향의 흐림 층 하나만 정의하고, 새 요구는 다음 규칙으로 추가합니다.

1. **새 표면은 Color 표에 추가합니다.** 해당 표면의 배경 토큰을 그대로 쓰고 임의 hex를 만들지 않습니다.
2. **새 Size는 spacing 토큰에서 고릅니다.** 필요한 길이가 토큰에 없으면 만들지 않고 보고합니다.
3. **이미지 위의 가독성용 gradient는 Fog가 아닙니다.** 이미지 아래쪽 텍스트를 읽히게 하는 gradient는 [Overlay](./overlay.md)의 Shape 확장으로 다룹니다.
4. **접힌 콘텐츠의 더 보기는 Fog로 만들지 않습니다.** 스크롤 없이 콘텐츠를 접었다 펼치는 경우에는 펼치기 control을 가진 전용 컴포넌트를 정의합니다.
5. **gradient 곡선을 바꿀 때는 모든 Direction에 함께 적용합니다.** linear 대신 여러 stop을 쓰는 곡선이 필요하면 stop 위치를 이 문서에 정의하고 방향마다 다르게 두지 않습니다.

## 사용 가이드

- **콘텐츠가 더 있다는 것을 알려야 할 때만 사용합니다.** 스크롤 영역마다 기본으로 붙이지 않습니다.
- **마지막 콘텐츠를 가리지 않습니다.** 끝까지 스크롤하면 해당 방향의 Fog를 반드시 숨깁니다.
- **Fog 위에 다른 요소를 올리지 않습니다.** Button이나 라벨이 필요하면 Fog 밖에 둡니다.
- **표면 색이 바뀌는 곳에서는 Color도 함께 바꿉니다.** 흰 표면에 화면 배경색 Fog를 쓰면 경계가 보입니다.

색·간격·표면·동작은 [Color](../foundations/color.json), [Spacing](../foundations/spacing.json), [Elevation](../foundations/elevation.json), [Motion](../foundations/motion.json)을, 접근성과 방향 처리는 [Accessibility](../foundations/accessibility.md), [International Design](../foundations/international-design.md)을 참고합니다.
