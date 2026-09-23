# Accessibility

Web·iOS·Android·ReactLynx의 UI가 공통으로 따라야 할 접근성 최소 기준입니다. 컴포넌트의 시각 스펙과 구현은 이 기준을 충족해야 합니다.

## 기준

| 범위 | 기준 |
|---|---|
| Web | WCAG 2.2 Level AA |
| iOS | 이 문서와 Apple 플랫폼 지침 중 더 엄격한 기준 |
| Android | 이 문서와 Android 플랫폼 지침 중 더 엄격한 기준 |
| ReactLynx | 이 문서와 실제 host 플랫폼 기준 중 더 엄격한 기준 |

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)를 공통 기준으로 사용합니다.
- 플랫폼 기준은 [Apple Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons), [Android accessibility](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views), [Lynx Accessibility](https://lynxjs.org/next/guide/inclusion/accessibility.html)를 함께 확인합니다.
- 플랫폼 표준 control이 제공하는 semantics·focus·입력 동작을 우선합니다.
- 자동 검사 통과만으로 완료하지 않고 키보드·스크린리더·글자 크기 확대를 직접 검증합니다.

---

## Pointer target

모든 custom interactive element는 보이는 크기와 별개로 최소 **48 × 48 logical unit**의 hit area를 가집니다.

| 플랫폼 | 최소 hit area | 적용 |
|---|---:|---|
| Web | 48 × 48 CSS px | `min-width`·`min-height` 또는 확장 hit area |
| iOS | 48 × 48pt | 시각 bounds 바깥까지 tappable area 확장 |
| Android | 48 × 48dp | touch target 또는 semantics bounds 확장 |
| ReactLynx | 48 × 48 layout px | iOS·Android host에서 실제 focusable area 확인 |

공통 최소값은 `spacing.48`을 사용합니다. Web의 WCAG 2.2 AA 최소 24 CSS px와 iOS 권장 44pt보다 큰 값이며 Android 권장 48dp를 함께 충족합니다.

- **보이는 요소를 48까지 키울 필요는 없습니다.** 28px 아이콘도 투명 padding이나 부모 control로 48 × 48 hit area를 확보할 수 있습니다.
- **서로 다른 control의 hit area를 겹치지 않습니다.** 겹치는 영역의 동작이 위치나 렌더 순서에 따라 달라지면 안 됩니다.
- **전체 control을 누를 수 있게 합니다.** 아이콘이나 라벨 일부만 hit target으로 만들지 않습니다.
- **inline text link는 예외입니다.** 문장 흐름 안에 포함된 링크는 line-height를 유지하되 키보드와 보조 기술로 조작할 수 있어야 합니다.
- 브라우저·운영체제가 크기를 정하고 수정하지 않은 native control과 위치 자체가 본질인 지도·그래프는 예외로 둘 수 있습니다. 이 경우 같은 기능의 접근 가능한 대체 control을 제공합니다.

---

## Contrast

대비는 WCAG 2.2의 계산법으로 foreground와 실제 인접 background 사이에서 계산합니다.

| 대상 | 최소 대비 |
|---|---:|
| 일반 텍스트·텍스트 이미지 | 4.5:1 |
| 18pt(24px) 이상 일반 텍스트 | 3:1 |
| 14pt(18.67px) 이상 Bold 700·ExtraBold 800 텍스트 | 3:1 |
| control 경계·상태·의미 있는 아이콘과 그래픽 | 3:1 |
| focus indicator와 인접 색 | 3:1 |

- SemiBold 600은 큰 텍스트 예외의 Bold로 계산하지 않습니다.
- CJK 텍스트는 WCAG가 허용하는 동등 크기를 실제 font metrics로 확인합니다. 별도 확인 전에는 위 기준을 그대로 적용합니다.
- opacity가 있으면 원본 토큰이 아니라 background와 합성된 최종 색으로 계산합니다.
- 2.999:1처럼 기준 미만인 결과를 반올림해 통과시키지 않습니다.
- 이미지·gradient 위 요소는 가능한 모든 배경에서 확인하거나 대비를 보장하는 별도 surface를 둡니다.
- Disabled control은 수치 대비의 예외일 수 있지만, programmatic disabled state를 제공하고 사용할 수 없는 이유를 가까운 문구로 설명합니다.
- 기준을 충족하는 조합이 현재 토큰에 없으면 opacity나 임의 hex로 보정하지 않고 필요한 semantic color token을 먼저 보고합니다.
- 밝은 표면의 일반 텍스트는 `fg.neutral-muted` 이상을 사용합니다. `fg.neutral-subtle`은 의미 있는 아이콘·UI 그래픽에, `fg.neutral-subtlest`는 장식·Disabled·보조 정보 caption처럼 수치 대비 예외가 적용되는 표현에만 사용합니다. 보조 정보 caption은 [Caption 보조 정보 예외](#caption-보조-정보-예외)를 따릅니다.
- 밝은 표면의 브랜드 텍스트·아이콘은 `fg.brand`, 강한 브랜드 표면·그래픽은 `brand.strong`을 사용합니다.
- Loading·Pressed처럼 정보를 전달하는 상태에 opacity를 적용한 경우 합성 결과가 기준을 충족해야 합니다. 미달하면 opacity를 제거하고 통과하는 semantic token을 사용합니다.

### Brand Button 예외

Brand Button의 Default·Loading 상태에 한해 배경 `brand.primary` #F46B18과 라벨·아이콘·Spinner `white` #FFFFFF 조합을 승인된 예외로 사용합니다. 이 조합의 대비는 WCAG 계산 기준 3.016:1입니다. Pressed는 `brand.primary-pressed` #B94208과 `white`로 5.461:1이라 예외에 포함하지 않습니다.

- 예외는 [Button](../components/button.md)의 Brand 변형에서 라벨·아이콘·Spinner에만 적용합니다. 다른 컴포넌트나 상태로 확장하지 않습니다.
- Disabled 상태는 Button 스펙의 기존 Disabled 색과 semantics를 사용하며 이 예외에 포함하지 않습니다.
- 검증 결과는 `approved-exception`으로 기록하고, WCAG 2.2 Level AA를 충족한 것으로 기록하지 않습니다.
- 그 밖의 일반 텍스트가 4.5:1 미만이면 실패입니다. 이 예외는 위의 공통 대비 기준이나 다른 접근성 기준을 변경하지 않습니다.

### Caption 보조 정보 예외

`typography.caption`으로 표시하는 보조 정보는 텍스트 대비 기준을 적용하지 않는 승인된 예외입니다. 색은 수치 대비와 관계없이 `fg.*` 토큰이나 `gray.*` 토큰에서 고릅니다.

보조 정보는 가려져도 화면의 이해와 조작에 지장이 없는 정보입니다.

| 구분 | 대상 |
|---|---|
| 적용 | Timestamp, 글자 수, 출처, 부가 설명, 버전 표기, 온보딩 화면의 설명 문구 |
| 제외 | 오류·경고·성공처럼 결과를 알리는 문구 |
| 제외 | 가격·수량·마감처럼 결정에 필요한 값 |
| 제외 | 필수 입력·동의 조건처럼 진행에 필요한 안내 |
| 제외 | 링크·버튼처럼 조작할 수 있는 텍스트 |

- 예외는 `typography.caption` 스타일의 텍스트에만 적용합니다. 다른 스타일이나 caption 크기로 줄인 다른 텍스트로 확장하지 않습니다.
- 제외 항목은 caption으로 표시하더라도 일반 텍스트 기준 4.5:1을 적용합니다.
- 보조 기술에는 화면과 같은 내용을 그대로 제공합니다. 흐리게 표시했다고 접근성 트리에서 숨기지 않습니다.
- 검증 결과는 `approved-exception`으로 기록하고, WCAG 2.2 Level AA를 충족한 것으로 기록하지 않습니다.

### 시각 예외

다음 조합은 기준에 미달하지만 시각 디자인을 위해 승인된 예외입니다. 표에 적힌 컴포넌트·위치에만 적용하고 다른 곳으로 확장하지 않습니다.

| 대상 | 색 | 배경 | 대비 | 기준 | 보완 수단 |
|---|---|---|---:|---:|---|
| [Round Button](../components/round-button.md) Brand 아이콘 | `brand.primary` #F46B18 | `gray.100` #F7F8F9 | 2.836:1 | 3:1 | 접근성 이름 |
| [Page Indicator](../components/indicator/page-indicator.md) Active | `brand.primary` #F46B18 | `background.elevated` #FFF3EA | 2.766:1 | 3:1 | 알약 모양, 줄 전체의 위치 announcement |
| Page Indicator Inactive | `gray.400` #DCDEE3 | `white` #FFFFFF | 1.346:1 | 3:1 | 줄 전체의 위치 announcement |
| [Option Selector](../components/option-selector.md) Outlined 테두리 | `gray.400` #DCDEE3 | `white` #FFFFFF | 1.346:1 | 3:1 | 4.5:1 이상의 Label, Selected의 `brand.primary` 테두리와 Indicator |
| 선택지 사이 `or` 구분 문구 | `gray.400` #DCDEE3 | `white` #FFFFFF | 1.346:1 | 4.5:1 | 선택지마다 독립된 Label·semantics |
| 어두운 [Fog](../components/fog.md) 위 AI 생성 고지 | `gray.800` #555D6D | `gray.950` #1A1C20 | 2.578:1 | 4.5:1 | 보조 기술에 같은 고지 제공 |
| [Learning Unit](../components/learning-unit.md) Ring | `gray.400` #DCDEE3 | `white` #FFFFFF | 1.346:1 | 3:1 | Surface 색과 글리프, 상태 state |
| Learning Unit Default Surface | `gray.500` #D1D3D8 | `white` #FFFFFF | 1.498:1 | 3:1 | 잠금 글리프, disabled state |
| Learning Unit Default 아이콘 | `gray.700` #868B94 | `gray.500` #D1D3D8 | 2.286:1 | 3:1 | 잠금 글리프, disabled state |
| Learning Unit Available Surface | `brand.reward-disabled-surface` #FFF0E6 | `white` #FFFFFF | 1.114:1 | 3:1 | 단위 제목·진행 문구, 상태 state |
| Learning Unit Available 아이콘 | `brand.primary` #F46B18 | `brand.reward-disabled-surface` #FFF0E6 | 2.708:1 | 3:1 | 학습 유형은 접근성 이름으로 전달 |

- `or` 구분 문구는 장식으로 보고 접근성 트리에서 숨깁니다. 선택지의 관계는 group semantics로 전달합니다.
- AI 생성 고지는 흐리게 보여도 숨기지 않습니다. 보조 기술에는 고지 전체를 그대로 제공합니다.
- 흰 배경의 `brand.primary`는 3.016:1로 그래픽 기준을 충족합니다. 흰 배경이 아닌 곳에서 `brand.primary`를 그래픽에 쓰려면 이 표에 먼저 추가합니다.
- 검증 결과는 `approved-exception`으로 기록하고, WCAG 2.2 Level AA를 충족한 것으로 기록하지 않습니다.

---

## Color와 상태

- **정보·상태·선택 여부를 색만으로 전달하지 않습니다.** 라벨, 아이콘, 형태, 패턴 중 하나 이상을 함께 사용합니다.
- 오류와 성공 상태에는 색 외에 의미가 드러나는 문구나 접근성 상태를 제공합니다.
- 상태를 보조하는 점·아이콘이 라벨과 같은 의미를 반복하면 장식 요소로 처리하고 접근성 트리에서 숨깁니다.
- 현재 위치·선택·확장·완료 같은 상태는 보조 기술이 programmatically 확인할 수 있어야 합니다.
- 색각 시뮬레이션만으로 검증을 끝내지 않고, 색을 제거해도 상태를 구분할 수 있는지 확인합니다.

---

## Keyboard와 focus

- Pointer로 실행할 수 있는 모든 기능은 keyboard interface나 플랫폼 대응 입력으로 실행할 수 있어야 합니다.
- focus 순서는 화면의 읽기 순서와 일치해야 합니다. 임의의 양수 `tabindex`나 수동 순서로 시각 순서와 다르게 만들지 않습니다.
- focus를 받은 interactive element에는 항상 보이는 indicator가 있어야 합니다.
- custom focus indicator를 적용할 수 없거나 forced colors처럼 시스템 표시가 우선하는 환경에서는 브라우저·플랫폼 기본 indicator를 제거하지 않습니다.
- focus indicator는 sticky header, sheet, dialog 같은 다른 surface에 완전히 가려지지 않아야 합니다.
- 일반 화면에서 focus를 가두지 않습니다. Modal Dialog와 modal Bottom Sheet 안에서는 focus를 내부에 유지하고, 닫으면 열기 전 요소로 되돌립니다.
- Drag, swipe, long press가 유일한 조작 방법이면 안 됩니다. 같은 결과를 내는 단순한 control이나 accessibility action을 함께 제공합니다.
- Loading 중 focus를 불필요하게 잃지 않습니다. element가 유지된다면 이름을 보존하고 busy state를 알립니다.

### Focus indicator

Focused는 Default·Pressed·Loading의 색과 크기를 대체하지 않고, focusable hit area의 바깥 윤곽에 다음 두 겹의 ring을 더하는 결합 상태입니다.

| 층 | 값 | 토큰 |
|---|---|---|
| Inner ring | 2px solid, `white` #FFFFFF | `stroke.width.strong`, `color.white` |
| Outer ring | 2px solid, `border.strong` #141115 | `stroke.width.strong`, `color.border.strong` |
| Ring 사이 간격 | 0px | `spacing.0` |
| 전체 외곽 범위 | 4px | `spacing.4` |
| 형태 | focusable hit area의 바깥 윤곽과 같은 형태 | 해당 컴포넌트의 radius |

- 두 ring 색의 대비는 18.74:1입니다. 단색 배경에서는 두 색 중 하나가 인접 배경과 3:1 이상이 되도록 두 band를 각각 2px 두께로 유지합니다.
- ring은 레이아웃 크기와 hit area를 바꾸지 않습니다. 잘리거나 이웃 control에 가려지지 않도록 주변 공간과 clipping을 확인합니다.
- Web은 keyboard focus에 `:focus-visible`을 사용합니다. pointer 입력만으로 이동한 focus에는 custom ring을 강제하지 않습니다.
- iOS·Android의 keyboard·D-pad focus는 이 시각 스펙을 사용하되, 플랫폼이 더 강한 system indicator를 제공하면 이를 유지합니다.
- ReactLynx는 host별 keyboard focus 표시 지원을 확인합니다. screen reader의 accessibility focus와 keyboard focus를 같은 상태로 간주하지 않습니다. Lynx는 `:focus-visible`과 input의 `:focus` 스타일을 적용하지 않으므로 focus 상태를 class로 표시합니다 — [Consuming의 ReactLynx 구현 참고](../CONSUMING.md#reactlynx-구현-참고).
- Default·Pressed·Loading은 Focused와 결합할 수 있습니다. Disabled는 focus 순서에서 제외하며 ring을 표시하지 않습니다.
- 이미지·gradient 위에서는 두 색 기법만으로 통과를 가정하지 않고 실제 인접 픽셀과 대비를 확인합니다.

Web의 두 색 ring은 [W3C C40](https://www.w3.org/WAI/WCAG22/Techniques/css/C40), `:focus-visible` 적용은 [W3C C45](https://www.w3.org/WAI/WCAG22/Techniques/css/C45)를 참고합니다.

---

## Accessible semantics

모든 interactive element는 programmatically 확인 가능한 **name, role, state, value**를 제공합니다.

### Name

- 화면에 보이는 라벨이 있으면 그 라벨이 accessible name의 기준입니다.
- 아이콘만 있는 control은 행동의 목적을 나타내는 명시적인 accessible name을 가집니다.
- 같은 화면에서 같은 이름의 control이 서로 다른 대상을 조작한다면 대상이 구분되도록 문맥을 포함합니다.
- visible label과 accessible name의 목적이 달라지지 않게 합니다.

### Role·state·value

- native role을 우선하고, 정적인 element에 click handler만 추가해 button처럼 만들지 않습니다.
- selected, current, expanded, checked, disabled, busy 같은 상태를 시각 표현과 함께 노출합니다.
- 진행률·단계·개수처럼 값이 있는 element는 현재 값과 전체 범위를 함께 제공합니다.
- 동적으로 바뀐 중요한 결과는 focus를 강제로 옮기지 않고 플랫폼의 announcement 기능으로 알립니다.

### Accessibility tree

- 장식용 아이콘·점·이미지는 접근성 트리에서 숨깁니다.
- 라벨과 아이콘이 하나의 control이면 여러 focus node가 아니라 하나의 node로 묶습니다.
- 여러 점이나 단계를 하나의 상태로 읽어야 하는 Indicator는 container 하나만 노출합니다.
- 숨겨진 background와 비활성 modal 바깥 콘텐츠가 focus를 받지 않게 합니다.

---

## 플랫폼 매핑

| 플랫폼 | 적용 원칙 |
|---|---|
| Web | semantic HTML을 우선하고 부족한 name·state에만 ARIA를 사용합니다. keyboard focus에는 `:focus-visible` ring을 적용합니다. |
| iOS | UIKit·SwiftUI의 native control과 accessibility API로 label·trait·value를 연결하고, keyboard focus indicator를 검증합니다. |
| Android | View·Compose semantics로 content description, role, state, value를 연결하고, keyboard·D-pad focus indicator를 검증합니다. |
| ReactLynx | `accessibility-element`, `accessibility-label`과 지원되는 trait·order API를 사용하고, 상태 변화는 `accessibilityAnnounce`로 전달합니다. keyboard focus 표시는 iOS·Android host에서 각각 검증합니다. |

ReactLynx는 iOS와 Android의 접근성 동작이 다를 수 있으므로 한 플랫폼의 결과로 다른 플랫폼을 대신하지 않습니다.

---

## Text와 motion

- Web은 텍스트를 200% 확대해도 내용과 기능을 잃지 않아야 합니다.
- 앱은 운영체제의 접근성 글자 크기를 적용합니다. 긴 문구는 잘라내기 전에 reflow·scroll·container 확장을 우선합니다.
- 글자 크기가 바뀌면 고정 높이보다 콘텐츠가 온전히 보이는 것을 우선합니다. 예외가 필요한 compact control은 대체 accessible name으로 전체 내용을 제공합니다.
- 동작 줄이기 설정에서는 [Motion](./motion.json)의 reduced motion 정책을 적용합니다.

---

## 검증

다음 항목을 모두 확인합니다.

- hit area overlay로 모든 custom control의 48 × 48과 비중첩 확인
- 모든 텍스트·control 경계·상태·의미 있는 아이콘의 contrast 계산
- Brand Button의 `brand.primary`/`white` 조합은 Default·Loading에만 쓰였는지 확인하고 `approved-exception`으로 별도 기록
- 4.5:1 미만의 caption은 보조 정보인지 확인하고 `approved-exception`으로 별도 기록
- 시각 예외 표의 조합이 표에 적힌 위치에만 쓰였는지 확인하고 `approved-exception`으로 별도 기록
- Pointer 없이 keyboard만으로 전체 흐름 완료
- focus 순서, `:focus-visible`, 두 색 ring, Disabled 제외, modal 진입·복귀 확인
- iOS VoiceOver와 Android TalkBack에서 name·role·state·value 확인
- ReactLynx를 iOS·Android에서 각각 확인
- Web 200% 확대와 앱 최대 접근성 글자 크기에서 잘림·겹침 확인
- 색을 제거해도 상태·선택·오류를 구분할 수 있는지 확인
- Loading·Disabled·오류·빈 상태의 announcement 확인

관련 값은 [Spacing](./spacing.json), [Color](./color.json), [Typography](./typography.json), [Motion](./motion.json)을 참고합니다.
