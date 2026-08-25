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
- ReactLynx는 host별 keyboard focus 표시 지원을 확인합니다. screen reader의 accessibility focus와 keyboard focus를 같은 상태로 간주하지 않습니다.
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
- Pointer 없이 keyboard만으로 전체 흐름 완료
- focus 순서, `:focus-visible`, 두 색 ring, Disabled 제외, modal 진입·복귀 확인
- iOS VoiceOver와 Android TalkBack에서 name·role·state·value 확인
- ReactLynx를 iOS·Android에서 각각 확인
- Web 200% 확대와 앱 최대 접근성 글자 크기에서 잘림·겹침 확인
- 색을 제거해도 상태·선택·오류를 구분할 수 있는지 확인
- Loading·Disabled·오류·빈 상태의 announcement 확인

관련 값은 [Spacing](./spacing.json), [Color](./color.json), [Typography](./typography.json), [Motion](./motion.json)을 참고합니다.
