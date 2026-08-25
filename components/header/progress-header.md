# Progress Header

학습 세션 중 화면 상단에 놓여, **지금 어디까지 왔는지**와 **나가는 길**을 함께 보여주는 헤더입니다.

색상은 `foundations/color.json`, 타이포그래피는 `foundations/typography.json`, 여백은 `foundations/spacing.json`의 토큰으로 매핑했습니다.

---

## 구조

```
Container (background.secondary, 패딩 16, 모서리 12)
├── Row 1  나가기 버튼 · 타이틀                    높이 24
├── Row 2  진행 바                                높이 8   (위 여백 16)
└── Row 3  활동명 · 진행률                        높이 14  (위 여백 8)
```

---

## Container

| 항목 | 값 | 토큰 |
|---|---|---|
| 배경 | #FAF7F4 | `background.secondary` |
| 패딩 | 16px | `spacing.16` |
| 모서리 | **네 모서리 모두 12px** | `radius.md` |
| 좌우 여백 | 16px | `layout.screen.padding-x` |

화면 끝에 붙지 않고 좌우 여백 안쪽에 떠 있는 카드 형태입니다. 상단 모서리까지 둥근 것은 의도된 것으로, 화면 상단에 밀착시키지 않습니다. (하단에 밀착하며 상단 모서리만 둥근 [Bottom Navigator](../bottom-navigator.md)와 대비됩니다.)

---

## Row 1 — 타이틀 줄

높이 24px.

| 위치 | 요소 | 스펙 |
|---|---|---|
| 좌 | 나가기 버튼 | 24 × 24. 아이콘 `8-ui/cross`, `fg.neutral-subtle` #868B94 |
| 중앙 | 타이틀 | `typography.heading.s` (18px / lh 24) · `fg.neutral` #1A1C20 |

- **타이틀은 행 전체를 기준으로 가운데 정렬**합니다. 나가기 버튼과의 사이를 나눠 갖는 게 아니라, 버튼과 무관하게 행의 중앙에 옵니다.
- 타이틀은 진행 단위를 나타냅니다 — `Chapter 4 / 12`.
- 우측에는 아무것도 두지 않습니다.

---

## Row 2 — 진행 바

위 여백 16px (`spacing.16`).

| 항목 | 값 | 토큰 |
|---|---|---|
| 높이 | 8px | `spacing.8` |
| 트랙 배경 | #EEEFF1 | `gray.300` |
| 채움 배경 | #F46B18 | `brand.primary` |
| 모서리 | 트랙·채움 모두 알약 | `radius.full` |
| 너비 | 가로 꽉 채움 | — |

**채움 너비는 Row 3의 진행률과 항상 같은 값에서 계산합니다.** 두 값을 따로 관리하지 마세요.

---

## Row 3 — 캡션

위 여백 8px (`spacing.8`). 높이 14px, 양끝 정렬.

| 위치 | 내용 | 스펙 |
|---|---|---|
| 좌 | 현재 활동명 (`Listening`) | `typography.label.s` (10px / lh 14 / 자간 0.8) · `fg.neutral-subtle` #868B94 |
| 우 | 진행률 (`33%`) | 동일 |

---

## 상태

### 나가기 버튼

[Bottom Navigator](../bottom-navigator.md)의 아이콘 셀과 같은 규칙입니다 — 배경 없이 아이콘 색만 바꿔서 버튼 크기가 흔들리지 않게 합니다.

| 상태 | 아이콘 |
|---|---|
| Default | `fg.neutral-subtle` #868B94 |
| Pressed | `fg.neutral` #1A1C20 |

Disabled는 정의하지 않습니다. **학습 중 이탈 경로는 언제나 열려 있어야 합니다.**

#### Focused

나가기 버튼은 Default·Pressed 표현을 유지하고 48 × 48 focusable hit area 바깥에 `white` #FFFFFF 2px inner ring과 `border.strong` #141115 2px outer ring을 표시합니다. 각 두께는 `stroke.width.strong`, ring 사이 간격은 `spacing.0`, 전체 외곽 범위는 `spacing.4`, 형태는 `radius.md`를 따릅니다 — [Accessibility](../../foundations/accessibility.md) 참고.

### 진행 바

| 상황 | 처리 |
|---|---|
| 0% | 채움을 그리지 않습니다 |
| 0% 초과 | 채움 너비의 **최소값은 8px**(= 바 높이). 그보다 작으면 알약 모양이 뭉개집니다 |
| 100% | 채움이 트랙을 완전히 덮습니다. 별도 표현은 없습니다 |

진행률이 바뀔 때 채움 너비는 `motion.duration.progress`(250ms) · `motion.easing.enter`로 전환합니다. 값이 튀지 않고 차오르는 느낌이 학습의 진척감을 만듭니다. Row 3의 진행률 숫자도 같은 타이밍에 갱신합니다.

나가기 버튼의 색 전환은 `motion.duration.color`(150ms) · `motion.easing.easing`입니다.

---

## 사용 가이드

- **학습 세션 중에만 씁니다.** 홈·설정처럼 진행이라는 개념이 없는 화면에는 쓰지 마세요.
- **나가기 버튼은 항상 좌측 고정**입니다. 학습 중 이탈 경로는 예측 가능해야 합니다.
- **나가기를 누르면 확인을 받으세요.** 진행 중인 학습이 사라질 수 있다면 [Button](../button.md)으로 확인 단계를 둡니다.
- **나가기 control은 전체 48 × 48 hit area와 접근성 이름을 제공합니다.** [Accessibility](../../foundations/accessibility.md)의 name·target 기준을 따릅니다.
- **타이틀은 짧게 유지합니다.** 좌우 버튼 사이 공간이 좁고, 번역 시 짧은 문구일수록 크게 늘어납니다 — `foundations/international-design.md`의 팽창률 참고.
- **진행률 숫자와 활동명 문구는 `foundations/writing-tone.md`를 따릅니다.** 수는 아라비아 숫자로 쓰고, 캡션에는 마침표를 붙이지 않습니다.
