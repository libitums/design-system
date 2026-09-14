# Text Field

이름·이메일 주소처럼 한 줄의 일반 텍스트를 입력하는 control입니다. Label, 앞뒤 보조 요소, 도움말, 글자 수를 필요한 만큼 조합할 수 있습니다. 짧은 숫자만 입력할 때는 Compact Numeric Input을, 인증번호·날짜처럼 별도 형식이나 여러 칸이 필요한 값에는 전용 입력을 씁니다.

## 구조

```text
Text Field
├── Label row (선택)
│   ├── Label
│   └── Qualifier (선택)
├── Field
│   ├── Leading (선택)
│   ├── Value 또는 Placeholder
│   └── Trailing (선택)
└── Supporting row (선택)
    ├── Helper 또는 Error message
    └── Counter (선택)
```

Label row와 Supporting row는 선택이지만 사용하면 Text Field의 한 부분으로 Field와 programmatically 연결합니다. 화면 흐름상 Label을 컴포넌트 밖에 두는 경우에도 같은 연결을 유지합니다. Placeholder는 Label을 대신하지 않습니다.

## 옵션

각 옵션은 독립적으로 조합합니다. 옵션 조합을 별도 variant로 만들지 않습니다.

| 옵션 | 값 | 용도 |
|---|---|---|
| Label | None / Label / Label + Qualifier | 입력 목적과 선택 여부 안내 |
| Leading | None / Icon / Prefix | 검색 아이콘, 통화 기호처럼 값 앞의 고정 정보 |
| Trailing | None / Icon / Suffix / Action | 단위, 상태, 값 지우기, 비밀번호 보기·숨기기 |
| Supporting | None / Helper / Error | 입력 조건이나 오류 해결 방법 안내 |
| Counter | Off / On | 현재 글자 수와 최대 글자 수 안내 |
| Input purpose | Text / Email / Password / Search / URL / Telephone | keyboard·자동 완성·보안 동작 결정 |
| Editability | Enabled / ReadOnly / Disabled | 편집 가능 여부 결정 |

### 조합 규칙

- Leading에는 Icon과 Prefix 중 하나만 둡니다.
- Trailing에는 Icon, Suffix, Action 중 하나만 둡니다. 2개 이상의 action이 필요하면 Field 밖에 별도 Button을 둡니다.
- Helper와 Error message를 함께 쌓지 않습니다. Error에서는 Helper를 Error message로 교체합니다.
- Counter는 Helper 또는 Error message와 함께 쓸 수 있습니다. Supporting row에서 문구는 남은 너비를 채우고 Counter는 오른쪽에 고정합니다.
- Leading·Trailing이 없으면 해당 slot과 간격을 함께 제거합니다. 빈 프레임으로 자리를 남기지 않습니다.
- Prefix·Suffix는 표시용 고정 텍스트이며 입력 value에 포함하지 않습니다. 제출 값에 필요하면 제품 로직에서 명시적으로 합칩니다.
- 필수·선택 여부는 native semantics로 제공하고, 화면에도 필요하면 Qualifier에 `필수` 또는 `선택`이라고 씁니다. 색이나 `*`만으로 구분하지 않습니다.
- ReadOnly는 Value 선택과 복사를 허용하지만 편집하지 않습니다. Disabled와 같은 상태로 취급하지 않습니다.

### 옵션별 예시

| 목적 | 권장 조합 | 예시 문구·동작 |
|---|---|---|
| 이름 | Label + Placeholder | Label `이름`, Placeholder `예: 김말랑` |
| 이메일 주소 | Label + Helper | Helper `로그인할 때 사용할 이메일 주소를 입력해 주세요.` |
| 비밀번호 | Label + Trailing Action | Action 이름을 값에 따라 `비밀번호 보기` / `비밀번호 숨기기`로 변경 |
| 검색 | Leading Icon + Trailing Action | Leading은 장식용 검색 아이콘, 값이 있을 때만 `검색어 지우기` Action 표시 |
| 글자 수 제한 | Supporting + Counter | Helper와 `12/30`을 같은 줄에 표시 |
| 고정 단위 | Suffix | 입력 value와 분리된 `분`, `회` 같은 단위 표시 |

## 공통 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| 너비 | 부모가 제공하는 너비를 채움 | — |
| 최소 높이 | 56px, 글자 크기 확대 시 콘텐츠에 맞게 확장 | — |
| 정렬 | Value 또는 Placeholder를 세로 중앙 정렬 | — |
| 가로 padding | 좌우 16px | `spacing.16` |
| Label row ↔ Field 간격 | 8px | `spacing.8` |
| Label row 내부 간격 | 8px | `spacing.8` |
| Field ↔ Supporting row 간격 | 8px | `spacing.8` |
| Leading·Trailing ↔ Value 간격 | 8px | `spacing.8` |
| 텍스트 | 한 줄 | — |
| Value·Placeholder 폰트 | Pretendard Variable Medium 500, 14px / 20px / 0px | `typography.body.m` |
| Label 폰트 | Pretendard Variable Bold 700, 14px / 20px / 0px | `typography.label.l` |
| Qualifier·Prefix·Suffix 폰트 | Pretendard Variable Medium 500, 14px / 20px / 0px | `typography.body.m` |
| Label | `fg.neutral` #1A1C20 | `color.fg.neutral` |
| Qualifier | `fg.neutral-muted` #555D6D | `color.fg.neutral-muted` |
| 보조 Icon 크기 | 20 × 20px, `padding` 에셋 | `icon.size.sm`, `icon.$extensions.com.libitum.iconography.variants.padding` |
| 보조 Icon 기본색 | `fg.neutral-subtle` #868B94 | `color.fg.neutral-subtle` |
| 모서리 | 16px | `radius.lg` |
| 테두리 | 1px, 레이아웃 크기에 포함 | `stroke.width.thin` |
| Helper·Error message·Counter 폰트 | Pretendard Variable Medium 500, 12px / 18px / 0px | `typography.body.s` |
| Helper·Counter | `fg.neutral-muted` #555D6D | `color.fg.neutral-muted` |
| Supporting row 내부 간격 | 8px | `spacing.8` |
| 그림자 | 없음 | — |

Field는 56px을 최소 높이로 사용합니다. Web 200% 확대와 앱의 접근성 글자 크기에서는 높이를 고정하지 않고 텍스트와 padding이 잘리지 않도록 늘립니다.

### Trailing Action

Trailing Action은 Field 안에서 input과 분리된 interactive element입니다.

| 항목 | 값 | 토큰 |
|---|---|---|
| 보이는 Icon | 20 × 20px, `padding` 에셋 | `icon.size.sm`, `icon.$extensions.com.libitum.iconography.variants.padding` |
| hit area | 최소 48 × 48px | `spacing.48` |
| Default Icon | `fg.neutral-subtle` #868B94 | `color.fg.neutral-subtle` |
| Pressed Icon | `fg.neutral` #1A1C20 | `color.fg.neutral` |
| Disabled Icon | `fg.disabled` #DCDEE3 | `color.fg.disabled` |
| 배경·테두리·그림자 | 없음 | — |
| Focus ring 형태 | 48 × 48px 원형 hit area의 바깥 윤곽 | `radius.full` |

Trailing Action은 자체 keyboard focus를 받으며 input 다음 순서에 둡니다. Action이 focus를 받으면 48 × 48 hit area에 공통 focus ring을 표시하고 Field는 `Focused` 테두리를 유지합니다. Field가 ring을 자르지 않도록 clipping을 사용하지 않습니다.

## 상태

상태는 하나의 배타적인 목록이 아니라 다음 축을 조합합니다.

| 축 | 값 | 의미 |
|---|---|---|
| Content | Empty / Filled | 현재 값의 유무 |
| Interaction | Unfocused / Focused | 현재 입력 focus의 유무 |
| Validation | None / Error | 검증 결과 |
| Availability | Enabled / ReadOnly / Disabled | 편집 가능 여부 |

Figma의 Default는 `Empty + Unfocused + None + Enabled`, Filled는 `Filled + Unfocused + None + Enabled` 조합입니다.

### 시각 상태

| 상태 | 배경 | Value 또는 Placeholder | 테두리 | Error message |
|---|---|---|---|---|
| Empty | `white` #FFFFFF | Placeholder `fg.neutral-muted` #555D6D | `border.default` #848184 | — |
| Filled | `white` #FFFFFF | Value `fg.neutral` #1A1C20 | `gray.900` #2A3038 | — |
| Focused | `white` #FFFFFF | Placeholder `fg.neutral-muted` #555D6D 또는 Value `fg.neutral` #1A1C20 | `brand.strong` #B94208 | — |
| Error | `feedback.incorrect-surface` #FFF0F1 | Value `feedback.incorrect-text` #A62E34 | `feedback.incorrect` #DF4D54 | `feedback.incorrect-text` #A62E34 |
| ReadOnly | `gray.100` #F7F8F9 | Value `fg.neutral` #1A1C20 | `border.default` #848184 | Helper가 있으면 유지 |
| Disabled | `gray.50` #F9F9FA | Value 또는 Placeholder `fg.disabled` #DCDEE3 | `border.disabled` #B7B4B8 | — |

시각 상태 우선순위는 Disabled → ReadOnly → Error → Focused → Content 순서입니다. Error가 focus를 받으면 Error의 배경·Value·테두리·문구를 유지하고 공통 focus ring을 더합니다. Empty와 Filled도 Focused와 조합할 수 있습니다. Prefix·Suffix는 각 상태의 Value 색을 따릅니다. 비interactive Icon은 기본 `fg.neutral-subtle`, Error에서 `feedback.incorrect-text`, Disabled에서 `fg.disabled`를 사용합니다.

Placeholder는 입력 형식의 짧은 예시로만 씁니다. `예: 김말랑`처럼 실제 값과 구분하고 현재 값으로 제출하거나 보조 기술의 value로 알리지 않습니다.

### Focus indicator

Focused의 브랜드 테두리와 별개로 keyboard focus가 보일 때 focusable hit area 바깥에 공통 focus ring을 표시합니다.

| 항목 | 값 | 토큰 |
|---|---|---|
| Inner ring | 2px solid, `white` #FFFFFF | `stroke.width.strong`, `color.white` |
| Outer ring | 2px solid, `border.strong` #141115 | `stroke.width.strong`, `color.border.strong` |
| Ring 사이 간격 | 0px | `spacing.0` |
| 전체 외곽 범위 | 4px | `spacing.4` |
| 형태 | Field의 바깥 윤곽을 따름 | `radius.lg` |

- Web은 `:focus-visible`에 ring을 적용합니다. Pointer로 Field를 눌러 편집할 때는 브랜드 테두리만 표시할 수 있습니다.
- Error가 keyboard focus를 받아도 Error 시각 상태를 유지하고 ring을 더합니다.
- Disabled는 focus 순서에서 제외하고 ring을 표시하지 않습니다.

## 동작

| 입력·조건 | 결과 |
|---|---|
| 탭·클릭 | Field에 focus를 옮기고 편집을 시작 |
| 값 입력 | Value를 갱신하고 Filled 상태로 전환 |
| 값을 모두 지움 | Empty 상태로 전환하고 Placeholder가 있으면 표시 |
| Focus가 들어옴 | Content 상태를 유지하고 Focused 시각 상태를 결합 |
| Focus가 나감 | 제품 흐름이 정한 시점이면 값을 검증하고, 실패 시 Error를 표시 |
| 제출 | 값을 검증하고 실패 시 Error를 표시한 뒤 해당 Field로 이동할 수 있게 함 |
| ReadOnly | Value 선택·복사를 허용하되 편집과 값 지우기 Action을 허용하지 않음 |
| Disabled | 입력·선택·focus를 허용하지 않음 |

사용자가 입력을 시도하기 전에는 새 Error를 먼저 표시하지 않습니다. Error를 고치는 중에는 제품의 검증 조건을 만족하는 즉시 Error를 해제할 수 있습니다. 검증 시점과 입력 조건은 제품 흐름에서 정하되 같은 화면의 Field끼리 일관되게 적용합니다.

Field의 색 전환은 `motion.duration.color` 150ms와 `motion.easing.easing`을 사용합니다. 동작 줄이기가 켜져 있어도 색 변화는 유지합니다.

## 접근성

- **플랫폼의 native text input을 우선합니다.** Web은 용도에 맞는 `input` type·`autocomplete`·`inputmode`를 사용하고, 앱은 대응하는 native control과 keyboard 설정을 사용합니다.
- **접근성 이름을 반드시 제공합니다.** 화면에 보이는 외부 Label을 연결하는 방식을 우선하고 Placeholder를 Label로 사용하지 않습니다.
- **Error를 색만으로 알리지 않습니다.** Error message를 Field와 programmatically 연결하고 invalid state를 제공합니다. 제출 뒤 새 오류가 생기면 오류 요약이나 적절한 announcement로 알립니다.
- **오류 문구에는 해결 방법을 담습니다.** `올바른 형식으로 입력해 주세요.`보다 `이메일 주소를 name@example.com 형식으로 입력해 주세요.`처럼 필요한 형식을 구체적으로 알립니다.
- **Trailing Action에는 행동의 목적을 이름으로 제공합니다.** `버튼`이나 `아이콘`이 아니라 `검색어 지우기`, `비밀번호 보기`처럼 결과를 알립니다.
- **장식용 Icon은 접근성 트리에서 숨깁니다.** Prefix·Suffix가 값의 의미에 꼭 필요하면 Label이나 설명에도 같은 정보를 제공해 읽기 순서에 포함합니다.
- **Counter는 현재 값과 전체 범위를 함께 알립니다.** 시각적으로 `12/30`을 쓰더라도 보조 기술에는 `30자 중 12자 입력`처럼 의미가 드러나게 전달합니다.
- **Input purpose를 native 속성에 연결합니다.** 시각 표현만 바꾸지 않고 용도에 맞는 keyboard, 자동 완성, 보안 입력을 제공합니다.
- **최소 hit area는 48 × 48입니다.** Field의 56px 최소 높이가 세로 기준을 충족하며 전체 Field를 하나의 control로 사용합니다.
- **붙여넣기와 하드웨어 키보드 입력도 검증합니다.** 보이는 keyboard 종류만으로 입력값을 제한하지 않습니다.

## 사용 가이드

- **일반적인 한 줄 텍스트에 사용합니다.** 여러 줄 설명은 Text Area, 선택지는 Select를 사용합니다. 검색 결과·제안·최근 검색어와 결합하면 전용 Search Field를 사용합니다.
- **Label에 입력 목적을 씁니다.** Placeholder가 사라져도 무엇을 입력해야 하는지 알 수 있어야 합니다.
- **Placeholder는 짧은 형식 예시로만 사용합니다.** 지시문·도움말·필수 조건은 외부 Label이나 설명으로 제공합니다.
- **Leading과 Trailing은 입력을 이해하거나 조작하는 데 필요할 때만 사용합니다.** 장식만을 위한 아이콘을 추가하지 않습니다.
- **Clear Action은 값이 있을 때만 표시합니다.** 실행하면 input focus를 유지하고 빈 값을 보조 기술에 알립니다.
- **비밀번호 Action의 이름은 현재 결과를 말합니다.** 가려진 상태에서는 `비밀번호 보기`, 보이는 상태에서는 `비밀번호 숨기기`를 사용합니다.
- **Counter만으로 제한 초과를 알리지 않습니다.** 초과 입력을 허용한다면 Error message와 invalid state를 함께 제공합니다.
- **Disabled만으로 이유를 설명하지 않습니다.** 입력할 수 없는 이유를 가까운 문구로 안내합니다.
- **오류는 사용자가 고칠 수 있게 씁니다.** 문제만 알리지 말고 필요한 값이나 형식을 함께 안내합니다.
- **여러 줄 입력은 이 컴포넌트를 늘려 만들지 않습니다.** Text Area를 별도 컴포넌트로 정의합니다.

짧은 숫자 전용 입력은 [Compact Numeric Input](./compact-numeric-input.md)을, 공통 색·폰트·focus 기준은 [Color](../foundations/color.json), [Typography](../foundations/typography.json), [Motion](../foundations/motion.json), [Accessibility](../foundations/accessibility.md)을 참고합니다.
