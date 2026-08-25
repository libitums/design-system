# Bottom Navigator

화면 하단에 고정되어 앱의 최상위 목적지를 오가는 탭 바입니다. 색상은 `foundations/color.json`, 모서리는 `foundations/radius.json`, 아이콘은 `foundations/iconography.json`의 토큰으로 매핑했습니다.

**아이콘만 사용하고 텍스트 라벨은 없습니다.**

---

## 구조

```
Bar (흰 배경, 상단 모서리 둥글게, 위쪽 그림자)
└── Cell × 4 — 가로 중앙 정렬, 간격 32px
    ├── default  아이콘만
    └── active   브랜드 컬러 알약 배경 + 흰 아이콘
```

---

## Bar

| 항목 | 값 | 토큰 |
|---|---|---|
| 배경 | #FFF3EA | `background.elevated` |
| 모서리 | 상단만 12px (하단 0) | `radius.md` |
| 패딩 | 24px | `spacing.24` |
| 셀 간격 | 32px | `spacing.32` |
| 정렬 | 가로 중앙 | — |
| 그림자 | `0 -4px 4px rgba(26, 28, 32, .08)` | `gray.950` 8% |

화면 가로를 꽉 채우고 하단에 고정합니다.

---

## Cell

| 항목 | 값 | 토큰 |
|---|---|---|
| 아이콘 | 20 × 20 | `icon.size.sm` |
| 높이 | 40px | — |
| 너비 | `아이콘 + 가로 패딩 × 2` → Default 40px / Active 60px | — |

네 셀 모두 같은 아이콘 크기와 높이를 씁니다. Active만 가로 패딩이 두 배라서 알약이 아이콘 좌우로 넓게 퍼집니다.

### 상태

| 상태 | 배경 | 아이콘 | 가로 / 세로 패딩 | 모서리 |
|---|---|---|---|---|
| Default | 없음 | `gray.500` #D1D3D8 | 10 / 10 | — |
| Pressed | 없음 | `fg.neutral-subtle` #868B94 | 10 / 10 | — |
| Active | `brand.primary` #F46B18 | `fg.neutral-inverted` #FFFFFF | 20 / 10 | `radius.full` |
| Active Pressed | `brand.primary-pressed` #B94208 | `fg.neutral-inverted` #FFFFFF | 20 / 10 | `radius.full` |
| Disabled | 없음 | `fg.disabled` #DCDEE3 | 10 / 10 | — |

- 한 번에 **하나의 셀만 Active**입니다.
- Active는 현재 위치를 나타내는 상태이고, Pressed는 누르는 순간의 피드백입니다. 이미 Active인 셀을 누르면 Active Pressed가 됩니다.
- Pressed에서 셀 너비가 변하지 않도록 배경이 아니라 아이콘 색만 바뀝니다.

### Focused

Focused는 Default·Pressed·Active·Active Pressed의 표현을 유지하고 각 Cell의 최소 48 × 48 focusable hit area 바깥에 공통 ring을 더합니다.

| 항목 | 값 | 토큰 |
|---|---|---|
| Inner ring | 2px solid, `white` #FFFFFF | `stroke.width.strong`, `color.white` |
| Outer ring | 2px solid, `border.strong` #141115 | `stroke.width.strong`, `color.border.strong` |
| Ring 사이 간격 | 0px | `spacing.0` |
| 전체 외곽 범위 | 4px | `spacing.4` |
| 형태 | Cell focusable hit area의 바깥 윤곽을 따르는 알약 | `radius.full` |

Disabled Cell은 focus 순서에서 제외하고 ring을 표시하지 않습니다. Web은 `:focus-visible`에 적용합니다 — [Accessibility](../foundations/accessibility.md) 참고.

---

## Badge

안 읽은 알림을 표시합니다. 아이콘 우측 상단에 걸치도록 배치하고, Active 셀에서는 알약 위에 겹칩니다.

| 종류 | 크기 | 배경 | 내용 |
|---|---|---|---|
| Dot | 8 × 8 | `feedback.incorrect` #DF4D54 | 없음 |
| Count | 높이 16px, 최소 너비 16px, 가로 패딩 4px | `feedback.incorrect` #DF4D54 | `fg.neutral-inverted` #FFFFFF + `typography.label.s` |

- 둘 다 모서리는 `radius.full`입니다.
- 개수를 정확히 보여줄 필요가 없으면 Dot을 씁니다.
- 99를 넘으면 `99+`로 표시합니다.

---

## 사용 가이드

- **셀 개수는 3~5개**로 유지합니다. 4개가 기준입니다.
- **최상위 목적지에만 씁니다.** 화면 안의 액션(저장, 공유, 제출)은 [Button](./button.md)을 쓰세요.
- **아이콘만 있으므로 접근성 이름이 반드시 필요합니다.** 각 셀에 플랫폼 대응 속성으로 목적지 이름을 붙이고, Active 셀에는 현재 선택 상태를 함께 알립니다 — [Accessibility](../foundations/accessibility.md) 참고.
- **Disabled는 예외적으로만 씁니다.** 잠긴 탭처럼 명확한 이유가 있을 때만 쓰고, 왜 갈 수 없는지 알려주세요.
- **아이콘은 `assets/icons`의 `padding` 변형을 씁니다.** 셀마다 아이콘의 광학 크기가 달라지지 않도록 고정 viewBox 변형이 필요합니다. 자세한 내용은 `foundations/iconography.json` 참고.
