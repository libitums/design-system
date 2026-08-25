# Back Header

이전 화면으로 돌아가는 경로와 **지금 보고 있는 것이 무엇인지**를 함께 보여주는 헤더입니다.

색상은 `foundations/color.json`, 타이포그래피는 `foundations/typography.json`, 여백은 `foundations/spacing.json`의 토큰으로 매핑했습니다.

---

## 구조

```
Container (패딩 16 / 12, 하단 모서리 12)
├── 좌  뒤로가기 아이콘 · 타이틀 + 서브타이틀     간격 16
└── 우  정보 아이콘
```

양끝 정렬(`space-between`)입니다.

---

## Container

| 항목 | 값 | 토큰 |
|---|---|---|
| 배경 | #FFF3EA | `background.elevated` |
| 가로 패딩 | 16px | `spacing.16` |
| 세로 패딩 | 12px | `spacing.12` |
| 모서리 | **하단 두 모서리만 12px** (상단 0) | `radius.md` |
| 높이 | 64px (12 + 40 + 12) | — |
| 너비 | 화면 가로 꽉 채움 | — |
| 쌓임 순서 | 고정 바 | `elevation.z.sticky` |

화면 최상단에 밀착합니다. Elevated 배경이라 아래 콘텐츠가 스크롤되며 헤더를 통과하지 않고, 하단 모서리의 곡선이 콘텐츠와의 경계를 만듭니다. 하단에 밀착하며 상단 모서리만 둥근 [Bottom Navigator](../bottom-navigator.md)와 대칭이고, 네 모서리가 모두 둥근 [Progress Header](./progress-header.md)와는 다릅니다.

콘텐츠가 헤더 아래로 스크롤될 때 경계를 더 분명히 하려면 `elevation.shadow.s1`을 더합니다. 기본은 그림자 없음입니다.

---

## 좌측 — 뒤로가기 + 제목

아이콘과 텍스트 블록 사이 간격 16px (`spacing.16`).

| 요소 | 스펙 |
|---|---|
| 뒤로가기 아이콘 | 24 × 24 (`icon.size.md`). `8-ui/arrow-left-03`, `fg.neutral-subtle` #868B94 |
| 타이틀 | `typography.label.l` (14px / lh 20) · `fg.neutral` #1A1C20 |
| 서브타이틀 | `typography.body.s` (12px / lh 18) · `fg.neutral-muted` #555D6D |

- 타이틀과 서브타이틀 사이 간격은 4px (`spacing.4`).
- 타이틀은 **어디에 있는지**(`Episode 04`), 서브타이틀은 **무엇을 하는지**(`Listening "저기요"`)를 나타냅니다.
- **아이콘과 제목 묶음 전체가 하나의 터치 영역**입니다. 아이콘만 누를 수 있게 하지 마세요.

---

## 우측 — 정보

| 요소 | 스펙 |
|---|---|
| 정보 아이콘 | 24 × 24 (`icon.size.md`). `8-ui/info-02`, `fg.neutral-subtle` #868B94 |

이 화면에서 무엇을 하는지 설명이 필요할 때만 둡니다. 쓰지 않으면 자리를 비우고, 타이틀은 그대로 좌측 정렬을 유지합니다.

---

## 상태

[Progress Header](./progress-header.md)의 나가기 버튼과 같은 규칙입니다. 배경 없이 아이콘 색만 바꿔서 크기가 흔들리지 않게 합니다.

| 상태 | 아이콘 |
|---|---|
| Default | `fg.neutral-subtle` #868B94 |
| Pressed | `fg.neutral` #1A1C20 |

- 뒤로가기는 아이콘과 제목 묶음을 함께 누른 상태로 처리합니다. Pressed에서 **타이틀·서브타이틀 색은 바뀌지 않습니다** — 아이콘만 반응합니다.
- 뒤로가기에 Disabled는 없습니다. 돌아갈 길은 언제나 열려 있어야 합니다.

### Focused

뒤로가기 control과 정보 control은 각각 자신의 최소 48 × 48 focusable hit area 바깥에 `white` #FFFFFF 2px inner ring과 `border.strong` #141115 2px outer ring을 표시합니다. 각 두께는 `stroke.width.strong`, ring 사이 간격은 `spacing.0`, 전체 외곽 범위는 `spacing.4`, 형태는 `radius.md`를 따릅니다. 뒤로가기 control은 아이콘과 제목 묶음 전체를 하나의 focus node로 유지합니다 — [Accessibility](../../foundations/accessibility.md) 참고.

---

## 사용 가이드

- **Progress Header와 함께 쓰지 마세요.** 학습 세션 중에는 Progress Header, 그 밖의 하위 화면에서는 Back Header를 씁니다.
- **서브타이틀은 생략할 수 있습니다.** 타이틀만으로 충분하면 한 줄로 두고, 이때도 헤더 높이는 64px을 유지합니다.
- **제목이 길면 한 줄로 자르고 말줄임(`…`)** 합니다. 두 줄로 늘리면 헤더 높이가 변해 아래 콘텐츠가 밀립니다.
- **번역 시 제목이 크게 늘어납니다.** 짧은 문구일수록 팽창률이 높습니다 — `foundations/international-design.md` 참고.
- **뒤로가기 control은 전체 48 × 48 hit area와 접근성 이름을 제공합니다.** 아이콘과 제목을 별도 focus node로 나누지 않습니다 — [Accessibility](../../foundations/accessibility.md) 참고.
- **제목 문구는 `foundations/writing-tone.md`를 따릅니다.** 수는 아라비아 숫자로 쓰고(`Episode 04`), 제목에는 마침표를 붙이지 않습니다.
