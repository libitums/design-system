# Status Indicator

학습 항목의 **현재 상태**를 알약 형태로 보여줍니다. 카드, 결과 화면, 프로필 요약에서 씁니다.

> **색만으로 상태를 나타내지 마세요.** 색맹·저시력 사용자에게는 색이 전달되지 않습니다. 항상 **점(또는 아이콘) + 라벨**을 함께 둡니다.

---

## 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| 모서리 | 알약 | `radius.full` |
| 가로 패딩 | 12px | `spacing.12` |
| 세로 패딩 | 8px | `spacing.8` |
| 점 ↔ 라벨 간격 | 8px | `spacing.8` |
| 점 | 8 × 8 원 | `radius.full` |
| 라벨 | 12px / lh 16 | `typography.label.m` |
| 높이 | 32px (8 + 16 + 8) | — |

너비는 라벨 길이에 따라 늘어납니다.

---

## 상태

세 층으로 이루어집니다 — **surface**(배경) / **base**(점) / **text**(라벨).

| 상태 | 배경 | 점 | 라벨 |
|---|---|---|---|
| Completed | `feedback.correct-surface` #EDFFF3 | `feedback.correct` #35A66F | `feedback.correct-text` #206541 |
| In progress | `feedback.warning-surface` #FFF4D6 | `feedback.warning` #FFC500 | `feedback.warning-text` #9A6800 |
| Needs retry | `feedback.incorrect-surface` #FFF0F1 | `feedback.incorrect` #DF4D54 | `feedback.incorrect-text` #A62E34 |
| Locked | `gray.200` #F3F4F5 | `gray.500` #D1D3D8 | `gray.700` #868B94 |

[Choice Button](../action-buttons.md#choice-button)의 Correct·Incorrect와 같은 3층 구조입니다. 같은 의미에는 같은 토큰 조합을 씁니다.

### 의미

| 상태 | 언제 |
|---|---|
| Completed | 끝냈고 더 할 일이 없음 |
| In progress | 시작했지만 아직 끝나지 않음 |
| Needs retry | 끝냈지만 기준에 못 미쳐 다시 해야 함 |
| Locked | 아직 열리지 않음. 선행 조건이 남아 있음 |

`Needs retry`는 실패가 아니라 **다음에 할 일**입니다. 문구도 그렇게 씁니다 — `foundations/writing-tone.md`의 *Positive Sentences* 참고.

---

## 사용 가이드

- **한 항목에 상태는 하나만** 붙입니다. 네 상태는 서로 배타적입니다.
- **점 대신 아이콘을 쓸 수 있습니다.** 이때도 크기 8px 자리를 유지하고, 색은 `base` 층을 따릅니다.
- **Locked에는 왜 잠겼는지 함께 알려주세요.** 인디케이터만으로는 무엇을 해야 열리는지 알 수 없습니다.
- **라벨 문구는 짧게.** 번역 시 짧은 문구일수록 크게 늘어나므로 알약 너비가 콘텐츠에 따라 늘어나게 두세요 — `foundations/international-design.md` 참고.
- **접근성:** 점은 장식이므로 스크린리더에서 숨기고, 라벨 텍스트만 읽히게 합니다. 상태가 어떤 항목의 것인지 문맥이 필요하면 `Chapter 3, Completed`처럼 항목명과 함께 알립니다.
