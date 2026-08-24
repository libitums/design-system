# Action Buttons

사용자의 행동을 유도하는 버튼 3계열입니다. 색상은 `foundations/color.json`, 타이포그래피는 `foundations/typography.json`, 모서리는 `foundations/radius.json`의 토큰으로 매핑했습니다.

| 계열 | 용도 | 특징 |
|---|---|---|
| [Solid Button](#solid-button) | 일반 화면의 표준 액션 | 평면. 4가지 강조 단계 |
| [Shadow Button](#shadow-button) | 학습 흐름의 핵심 액션 | 하드 섀도우. 눌리는 느낌 |
| [Choice Button](#choice-button) | 문제 보기 선택 | 배지 + 라벨. 정오답 피드백 |

---

## 공통 규칙

| 항목 | 값 | 토큰 |
|---|---|---|
| 모서리 | 12px | `radius.md` |
| 테두리 | **2px**, 높이 안쪽 (`border-box`) | — |
| 라벨 폰트 | Pretendard Variable Bold | `font.family.default` / `font.weight.bold` |
| 아이콘·스피너 ↔ 라벨 간격 | 6px | — |

세 가지 상태 규칙이 모든 계열에 동일하게 적용됩니다.

- **Pressed = 배경 한 단계 어둡게** (+ Shadow 계열은 섀도우 제거)
- **Disabled 라벨 = `gray.400` #DCDEE3** (전 계열 공통)
- **Loading = Default과 같은 색 유지 + 스피너.** 스피너 색은 **라벨 색의 35% 불투명도**, 두께 2px, 크기 S·M 12px / L·XL 16px. 라벨은 지우지 않습니다.

### 사이즈 스케일

**높이가 확정값입니다.** 세로 패딩은 `(높이 − line-height) ÷ 2`로 결정됩니다.

| 사이즈 | 높이 | 가로 패딩 | 세로 패딩 | 라벨 토큰 | 폰트 |
|---|---|---|---|---|---|
| S | **32px** | 12 | 8 | `typography.label.m` | 12px / lh 16 |
| M | **40px** | 16 | 10 | `typography.label.l` | 14px / lh 20 |
| L | **48px** | 20 | 14 | `typography.label.l` | 14px / lh 20 |
| XL | **56px** | 24 | 16 | `typography.label.xl` | 16px / lh 24 |

세 계열이 이 스케일을 공유합니다. 테두리는 높이 안쪽에 그리므로 계열과 무관하게 높이가 같습니다.

---

## Solid Button

평면 버튼. 강조 순서는 `solid > outline > subtle > text`입니다.

| 변형 | 예시 라벨 | 용도 |
|---|---|---|
| `solid` | Continue | 화면의 주 액션 |
| `outline` | View details | 보조 액션 |
| `subtle` | Save for later | 낮은 강조의 보조 액션 |
| `text` | Skip lesson | 최소 강조. 건너뛰기·취소 |

**solid** — 테두리 없음

| 상태 | 배경 | 라벨 |
|---|---|---|
| Default | `gray.800` #555D6D | `gray.50` #F9F9FA |
| Pressed | `gray.950` #1A1C20 | `gray.50` #F9F9FA |
| Disabled | `gray.50` #F9F9FA | `gray.400` #DCDEE3 |
| Loading | `gray.800` #555D6D | `gray.50` #F9F9FA · 스피너 `gray.50` 35% |

**outline**

| 상태 | 배경 | 테두리 | 라벨 |
|---|---|---|---|
| Default | `white` #FFFFFF | `border.default` #848184 | `gray.700` #868B94 |
| Pressed | `gray.100` #F7F8F9 | `border.default` #848184 | `gray.800` #555D6D |
| Disabled | `gray.50` #F9F9FA | `border.disabled` #B7B4B8 | `gray.400` #DCDEE3 |
| Loading | `white` #FFFFFF | `border.default` #848184 | `gray.700` #868B94 · 스피너 `gray.700` 35% |

**subtle** — 테두리 없음

| 상태 | 배경 | 라벨 |
|---|---|---|
| Default | `gray.100` #F7F8F9 | `gray.700` #868B94 |
| Pressed | `gray.300` #EEEFF1 | `gray.900` #2A3038 |
| Disabled | `gray.50` #F9F9FA | `gray.400` #DCDEE3 |
| Loading | `gray.100` #F7F8F9 | `gray.700` #868B94 · 스피너 `gray.700` 35% |

**text** — 배경·테두리 없음. 가로 패딩은 스케일의 절반, 세로 패딩은 동일

| 상태 | 라벨 |
|---|---|
| Default | `brand.primary` #F46B18 |
| Pressed | `brand.primary-pressed` #B94208 |
| Disabled | `gray.400` #DCDEE3 |
| Loading | `brand.primary` #F46B18 · 스피너 `brand.primary` 35% |

---

## Shadow Button

하드 섀도우(blur·spread 0)를 가진 입체 버튼. 학습 흐름의 핵심 액션에 사용합니다.

| 항목 | 값 |
|---|---|
| 섀도우 | `4px 4px 0` — **Default에만 적용** |
| Pressed·Disabled·Loading | 섀도우 제거 (눌려 들어가는 느낌) |

| 변형 | 예시 라벨 | 용도 |
|---|---|---|
| `primary` | Play now | 진행 — 시작, 다음 단계 |
| `secondary` | Done 5 | 결과 확인 |
| `tertiary` | Claim reward | 보상 수령 |
| `icon` | ▶ ↻ ● | 오디오 재생·재생성·녹음 |

**primary**

| 상태 | 배경 | 테두리 | 라벨 | 섀도우 |
|---|---|---|---|---|
| Default | `gray.800` #555D6D | `border.strong` #141115 | `white` | `4px 4px 0` `gray.800` #555D6D |
| Pressed | `gray.950` #1A1C20 | `border.strong` #141115 | `white` | 없음 |
| Disabled | `gray.100` #F7F8F9 | `border.disabled` #B7B4B8 | `gray.400` #DCDEE3 | 없음 |
| Loading | `gray.800` #555D6D | `border.strong` #141115 | `white` · 스피너 `white` 35% | 없음 |

**secondary**

| 상태 | 배경 | 테두리 | 라벨 | 섀도우 |
|---|---|---|---|---|
| Default | `white` #FFFFFF | `border.default` #848184 | `gray.700` #868B94 | `4px 4px 0` `gray.400` #DCDEE3 |
| Pressed | `gray.300` #EEEFF1 | `gray.700` #868B94 | `gray.900` #2A3038 | 없음 |
| Disabled | `gray.100` #F7F8F9 | `border.disabled` #B7B4B8 | `gray.400` #DCDEE3 | 없음 |
| Loading | `white` #FFFFFF | `border.default` #848184 | `gray.700` #868B94 · 스피너 `gray.700` 35% | 없음 |

**tertiary**

| 상태 | 배경 | 테두리 | 라벨 | 섀도우 |
|---|---|---|---|---|
| Default | `brand.secondary` #FF8D28 | `brand.reward-border` #C94B09 | `white` | `4px 4px 0` `brand.primary` #F46B18 |
| Pressed | `brand.primary` #F46B18 | `brand.reward-border` #C94B09 | `white` | 없음 |
| Disabled | `brand.reward-disabled-surface` #FFF0E6 | `brand.reward-disabled-text` #D89A70 | `brand.reward-disabled-text` #D89A70 | 없음 |
| Loading | `brand.secondary` #FF8D28 | `brand.reward-border` #C94B09 | `white` · 스피너 `white` 35% | 없음 |

**icon** — 정사각. 사이즈 스케일의 높이를 한 변으로 씁니다 (기본 L 48px)

| 상태 | 배경 | 테두리 | 아이콘 | 섀도우 |
|---|---|---|---|---|
| Default | `feedback.warning` #FFC500 | `border.strong` #141115 | `gray.950` #1A1C20 | `4px 4px 0` `border.strong` #141115 |
| Pressed | `feedback.warning-text` #9A6800 | `border.strong` #141115 | `white` | 없음 |
| Disabled | `gray.50` #F9F9FA | `border.disabled` #B7B4B8 | `gray.400` #DCDEE3 | 없음 |
| Loading | `feedback.warning` #FFC500 | `border.strong` #141115 | 스피너 `gray.950` 35% | 없음 |

---

## Choice Button

문제의 보기를 선택하는 버튼. 왼쪽에 원형 배지(보기 기호, `radius.full`), 오른쪽에 라벨이 옵니다. 좌측 정렬, 가로 꽉 채움.

### 사이즈

배지가 라벨보다 크므로 **배지가 세로 패딩을 결정**합니다 (`세로 패딩 = (높이 − 배지) ÷ 2`).

| 사이즈 | 높이 | 가로 패딩 | 세로 패딩 | 배지 | 배지 ↔ 라벨 |
|---|---|---|---|---|---|
| S | 32px | 12 | 6 | 20px | 12px |
| M | 40px | 16 | 8 | 24px | 12px |
| L | 48px | 20 | 10 | 28px | 12px |

### 상태

| 상태 | 배경 | 테두리 | 배지 | 배지 기호 | 라벨 |
|---|---|---|---|---|---|
| Default | `white` #FFFFFF | `border.strong` #141115 | 투명 + 테두리 #141115 | `gray.950` #1A1C20 | `gray.950` #1A1C20 |
| Pressed | `gray.300` #EEEFF1 | `border.strong` #141115 | 투명 + 테두리 #141115 | `gray.950` #1A1C20 | `gray.950` #1A1C20 |
| Selected | `gray.100` #F7F8F9 | `border.strong` #141115 | 채움 #141115 | `white` | `gray.950` #1A1C20 |
| Loading | `gray.100` #F7F8F9 | `border.strong` #141115 | 채움 #141115 | 스피너 `white` 35% | `gray.950` #1A1C20 |
| Disabled | `gray.100` #F7F8F9 | `border.disabled` #B7B4B8 | 투명 + 테두리 #B7B4B8 | `gray.400` #DCDEE3 | `gray.400` #DCDEE3 |
| Correct | `feedback.correct-surface` #EDFFF3 | `feedback.correct` #35A66F | 채움 #35A66F | `white` (✓) | `feedback.correct-text` #206541 |
| Incorrect | `feedback.incorrect-surface` #FFF0F1 | `feedback.incorrect` #DF4D54 | 채움 #DF4D54 | `white` (×) | `feedback.incorrect-text` #A62E34 |

- Correct·Incorrect에서는 배지의 보기 기호(A, B…)가 **✓ / ×로 교체**됩니다.
- Loading은 답을 제출하고 채점을 기다리는 상태입니다. Selected를 유지한 채 배지 기호만 스피너로 바꿉니다.
- Correct·Incorrect는 `surface`(배경) / `base`(테두리·배지) / `text`(라벨) 3단 구조로 대칭입니다.

---

## 사용 가이드

- **한 화면에 강조 최상위 버튼은 하나만** 둡니다. Solid `solid` 또는 Shadow `primary` 중 하나입니다.
- **Shadow 계열은 학습 흐름 전용**입니다. 설정·목록 같은 일반 화면에는 Solid 계열을 쓰고, 두 계열을 한 화면에 나란히 놓지 마세요.
- **Disabled에도 이유를 알려주세요.** 버튼만 비활성화하지 말고 왜 누를 수 없는지 근처에 문구로 안내합니다.
- **Loading 중에도 라벨을 유지**합니다. 스피너만 남기면 무엇을 기다리는지 알 수 없습니다. (`icon` 변형은 라벨이 없으므로 예외)
- **라벨 문구는 `foundations/writing-tone.md`를 따릅니다.** 특히 *Function Names*(기능 이름보다 목적)와 *Periods*(버튼에는 마침표 없음)를 확인하세요.
