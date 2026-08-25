# Dialog

화면 가운데에 떠서 **사용자가 선택하기 전까지 진행을 막는** 레이어입니다. 되돌릴 수 없는 동작의 확인, 진행 중인 작업이 사라지는 상황의 경고에 씁니다.

> [Bottom Sheet](./bottom-sheet.md)와의 차이는 **닫는 방법**입니다. 시트는 Scrim 탭·아래로 끌기로 닫히지만, Dialog는 **Scrim을 눌러도 닫히지 않습니다.** 사용자가 버튼 중 하나를 반드시 골라야 합니다. 그래서 Dialog는 아껴 씁니다.

---

## 구조

```
Scrim (화면 전체, 반투명 어두운 막)
└── Container (화면 가운데, 모서리 16)
    ├── Title        타이틀
    ├── Description  본문            (위 여백 8)
    └── Actions      버튼 1~2개      (위 여백 20)
```

---

## Scrim

| 항목 | 값 | 토큰 |
|---|---|---|
| 배경 | `gray.950` 45% — `rgba(26, 28, 32, .45)` | — |
| 범위 | 화면 전체 | — |
| 쌓임 순서 | `elevation.z.dialog` | — |

[Bottom Sheet](./bottom-sheet.md)와 같은 Scrim이지만 **탭해도 닫히지 않습니다.**

---

## Container

| 항목 | 값 | 토큰 |
|---|---|---|
| 배경 | #FFF3EA | `elevation.surface.floating` |
| 모서리 | 16px | `radius.lg` |
| 패딩 | 20px | `spacing.20` |
| 그림자 | `0 4px 16px rgba(26, 28, 32, .12)` | `elevation.shadow.s3` |
| 좌우 여백 | 32px | `spacing.32` |
| 최대 너비 | 320px | — |
| 정렬 | 화면 가로·세로 가운데 | — |

- 높이는 내용에 따라 결정됩니다.
- **닫기(X) 버튼을 두지 않습니다.** 선택을 강제하는 것이 이 컴포넌트의 목적입니다.

---

## Title

| 항목 | 스펙 |
|---|---|
| 타이틀 | `typography.heading.s` (18px / lh 24) · `fg.neutral` #1A1C20 |

- **무엇이 일어나는지 한 줄로** 말합니다 — `학습을 그만둘까요?`
- 타이틀은 필수입니다. 생략할 수 없습니다.
- 질문형으로 쓰고 마침표를 붙이지 않습니다.

---

## Description

위 여백 8px (`spacing.8`).

| 항목 | 스펙 |
|---|---|
| 본문 | `typography.body.m` (14px / lh 20) · `fg.neutral-subtlest` #B0B3BA |

- **결과를 알려줍니다** — 무엇을 잃는지, 되돌릴 수 있는지.
- 두세 줄을 넘기지 마세요. 넘어가면 Dialog가 아니라 화면으로 만들 일입니다.
- 타이틀에서 이미 다 말했다면 생략합니다.

---

## Actions

위 여백 20px (`spacing.20`).

[Button](./button.md)을 **M 사이즈(36px), Fill**로 씁니다.

| 개수 | 배치 |
|---|---|
| 1개 | Neutral 하나 |
| 2개 | 세로로 쌓고 간격 8px (`spacing.8`) |

**2개일 때 순서**

| 위치 | 역할 | 변형 |
|---|---|---|
| 위 | 사용자가 원래 하려던 것을 **계속**하는 쪽 | Neutral |
| 아래 | 그만두거나 되돌리는 쪽 | Subtle |

- **가로로 나란히 놓지 마세요.** 번역 시 라벨이 늘어나면 두 버튼의 폭이 어긋나고 잘립니다 — `foundations/international-design.md` 참고.
- **위험한 쪽을 기본값으로 두지 마세요.** 실수로 눌러도 손실이 없는 쪽이 위에 옵니다.

---

## 동작

| 입력 | 결과 |
|---|---|
| Scrim 탭 | **아무 일도 일어나지 않음** |
| 뒤로가기 · ESC | 아래쪽 버튼(취소)과 동일 |
| 버튼 탭 | 해당 동작 실행 후 닫힘 |

### 전환

| 대상 | 나타남 | 사라짐 |
|---|---|---|
| Scrim | 불투명도 0 → 1 | 1 → 0 |
| Container | 불투명도 0 → 1, 크기 0.96 → 1 | 역방향 |
| 시간 · 가속도 | `motion.duration.dialog`(250ms) · `motion.easing.enter` | 같은 시간 · `motion.easing.exit` |

동작 줄이기가 켜져 있으면 크기 변화를 없애고 불투명도만 전환합니다 — `foundations/motion.json` 참고.

---

## 사용 가이드

- **되돌릴 수 없거나 무언가를 잃는 동작에만** 씁니다. 그 외의 부가 작업은 [Bottom Sheet](./bottom-sheet.md)입니다.
- **한 번에 하나만** 띄웁니다. Dialog 위에 Dialog를 쌓지 마세요.
- **알림·성공 메시지에 쓰지 마세요.** 선택할 것이 없다면 Dialog가 아닙니다.
- **버튼 라벨에 결과를 담습니다.** `확인`/`취소`가 아니라 `그만두기`/`계속 학습하기`처럼 무엇이 일어나는지 말합니다 — `foundations/writing-tone.md`의 *Function Names* 참고.
- **접근성:** 열릴 때 focus를 Dialog 안으로 옮기고 밖으로 나가지 않게 가둡니다. 닫히면 원래 위치로 되돌리고, 배경 콘텐츠는 접근성 트리에서 숨깁니다 — [Accessibility](../foundations/accessibility.md) 참고.
