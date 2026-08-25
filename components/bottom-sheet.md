# Bottom Sheet

화면 아래에서 올라와 **현재 화면을 떠나지 않고** 부가 작업을 처리하는 레이어입니다. 학습 중 오디오 다시 듣기, 문장 복습처럼 흐름을 끊지 않아야 하는 동작에 씁니다.

---

## 구조

```
Scrim (화면 전체, 반투명 어두운 막)
└── Sheet (하단 정렬, 상단 모서리 16)
    ├── Handle       40 × 6, 가운데
    ├── Header       오버라인 + 타이틀 · 닫기 버튼   (위 여백 20)
    ├── Description  본문                            (위 여백 20)
    └── Action       버튼                            (위 여백 20)
```

---

## Scrim

| 항목 | 값 | 토큰 |
|---|---|---|
| 배경 | `gray.950` 45% — `rgba(26, 28, 32, .45)` | — |
| 범위 | 화면 전체 | — |
| 쌓임 순서 | `elevation.z.sheet` | — |

Scrim을 누르면 시트를 닫습니다.

---

## Sheet

| 항목 | 값 | 토큰 |
|---|---|---|
| 배경 | #FFF3EA | `background.elevated` |
| 모서리 | **상단 두 모서리만 16px** (하단 0) | `radius.lg` |
| 가로 패딩 | 16px | `spacing.16` |
| 상단 패딩 | 12px | `spacing.12` |
| 하단 패딩 | 20px | `spacing.20` |
| 그림자 | `0 -10px 14px rgba(26, 28, 32, .2)` — 위쪽으로 | — |
| 정렬 | 화면 하단에 밀착 | — |

- 높이는 내용에 따라 결정됩니다. 화면 높이를 넘지 않게 하고, 넘으면 내부를 스크롤합니다.
- 하단 패딩에 `layout.safe-area.bottom`을 더합니다. 홈 인디케이터에 버튼이 가리지 않아야 합니다.
- 모서리 16px은 이 시스템에서 시트만 씁니다. 헤더·버튼·카드는 12px(`radius.md`)입니다.

### Handle

| 항목 | 값 | 토큰 |
|---|---|---|
| 크기 | 40 × 6 | — |
| 배경 | `gray.300` #EEEFF1 | — |
| 모서리 | 알약 | `radius.full` |
| 정렬 | 가로 가운데 | — |

아래로 끌어 닫을 수 있다는 것을 알리는 표시입니다. 끌어 닫기를 지원하지 않으면 Handle을 두지 마세요.

---

## Header

위 여백 20px (`spacing.20`). 양끝 정렬.

| 위치 | 요소 | 스펙 |
|---|---|---|
| 좌 · 위 | 오버라인 | `typography.label.m` (12px / lh 16) · `fg.brand` #B94208 |
| 좌 · 아래 | 타이틀 | `typography.heading.s` (18px / lh 24) · `fg.neutral` #1A1C20 |
| 우 | 닫기 버튼 | 아래 표 참고 |

- 오버라인과 타이틀 사이 간격 4px (`spacing.4`).
- 오버라인은 **이 시트가 무엇에 대한 것인지** 분류를 알려줍니다 — `lesson actions`.
- 타이틀은 **무엇을 물어보는지** 한 줄로 말합니다 — `Need a moment?`
- 오버라인은 생략할 수 있습니다. 타이틀은 필수입니다.

### 닫기 버튼

| 항목 | 값 | 토큰 |
|---|---|---|
| 크기 | 40 × 40 | — |
| 배경 | `gray.100` #F7F8F9 | — |
| 모서리 | 12px | `radius.md` |
| 아이콘 | 18 × 18. `8-ui/cross`, `fg.neutral-subtle` #868B94 | — |

| 상태 | 배경 | 아이콘 |
|---|---|---|
| Default | `gray.100` #F7F8F9 | `fg.neutral-subtle` #868B94 |
| Pressed | `gray.300` #EEEFF1 | `fg.neutral` #1A1C20 |

Pressed 규칙은 [Button](./button.md)의 Subtle과 같습니다.

### Focused

닫기 버튼은 Default·Pressed 표현을 유지하고 48 × 48 focusable hit area 바깥에 `white` #FFFFFF 2px inner ring과 `border.strong` #141115 2px outer ring을 표시합니다. 각 두께는 `stroke.width.strong`, ring 사이 간격은 `spacing.0`, 전체 외곽 범위는 `spacing.4`, 형태는 `radius.md`를 따릅니다 — [Accessibility](../foundations/accessibility.md) 참고.

---

## Description

위 여백 20px (`spacing.20`).

| 항목 | 스펙 |
|---|---|
| 본문 | `typography.body.m` (14px / lh 20) · `fg.neutral-muted` #555D6D |

타이틀을 보충하는 설명입니다. 없어도 되면 생략하고, 두세 줄을 넘기지 마세요 — `foundations/writing-tone.md`의 *Focus on One Purpose* 참고.

---

## Action

위 여백 20px (`spacing.20`).

[Button](./button.md)을 **M 사이즈(36px), Fill**로 씁니다. 기본은 Neutral입니다.

Action의 Focused는 [Button](./button.md)의 공통 Focused 스펙을 그대로 사용합니다. Disabled Action에는 ring을 표시하지 않습니다.

- 버튼은 **하나만** 둡니다. 두 개 이상 필요하면 세로로 쌓고 간격 8px(`spacing.8`), 강조가 높은 것을 위에 둡니다.
- 취소는 버튼으로 만들지 말고 닫기 버튼과 Scrim 탭에 맡깁니다.

---

## 사용 가이드

- **현재 흐름을 떠나지 않아야 할 때만** 씁니다. 화면을 완전히 바꿔야 하는 작업은 새 화면으로 보내세요.
- **판단을 강제하는 경고에는 쓰지 마세요.** 되돌릴 수 없는 동작의 확인은 Scrim 탭으로 닫히면 안 되므로 다이얼로그가 맞습니다.
- **닫는 방법을 셋 다 열어둡니다** — 닫기 버튼, Scrim 탭, 아래로 끌기.
- **열리면 focus를 Sheet 안으로 옮기고 닫으면 원래 위치로 되돌립니다.** 아래로 끌 수 없는 입력에도 닫기 버튼을 제공합니다 — [Accessibility](../foundations/accessibility.md) 참고.
- **내용이 길면 시트 안에서 스크롤**하고, Handle과 Header는 상단에 고정합니다.
- **문구는 `foundations/writing-tone.md`를 따릅니다.** 타이틀에는 마침표를 붙이지 않고, 버튼 라벨은 기능 이름이 아니라 목적을 말합니다.
