# Overlay

아래 콘텐츠를 어둡게 덮어 그 위의 요소에 주의를 모으는 반투명 층입니다. 바텀 시트·다이얼로그 뒤의 화면 전체를 덮을 때와, 이미지·영상처럼 경계가 있는 영역 위에 상태나 행동을 올릴 때 씁니다. Overlay는 덮는 층만 소유하고, 그 위에 올리는 콘텐츠와 닫는 동작은 Overlay를 쓰는 상위 컴포넌트가 정합니다.

## 구조

```text
Overlay host (Overlay를 쓰는 상위 컴포넌트)
├── Target (덮이는 콘텐츠: 화면 또는 영역)
├── Overlay
└── Foreground (선택, Overlay 위에 올리는 요소)
```

Overlay host는 Bottom Sheet·Dialog처럼 modal 표면을 여는 컴포넌트이거나, 이미지·영상 영역을 가진 컴포넌트입니다. Foreground는 Overlay의 크기나 색에 영향을 주지 않습니다.

## 옵션

각 옵션은 독립적으로 조합합니다. 조합 전체를 별도 variant로 만들지 않습니다.

| 옵션 | 값 | 용도 |
|---|---|---|
| Scope | Screen / Area | 화면 전체를 덮음 / 부모가 정한 영역만 덮음 |
| Blur | Off / On | Target을 흐리게 해 Foreground에 주의를 모음 |
| Dismiss | None / Tap | Overlay를 눌렀을 때 상위 표면을 닫을지 결정 |

### 조합 규칙

- Screen은 Bottom Sheet·Dialog 같은 modal 표면과 함께만 사용합니다. 표면 없이 화면 전체를 어둡게 하지 않습니다.
- Area는 [Card](./card.md)의 Media처럼 이미지·영상·일러스트로 경계가 분명한 영역에만 사용합니다.
- Dismiss Tap은 Screen에서 닫을 수 있는 표면에만 사용합니다. [Bottom Sheet](./bottom-sheet.md)는 Tap, [Dialog](./dialog.md)는 None입니다.
- Area는 Dismiss None만 사용합니다. Area에서 필요한 행동은 Foreground의 Button으로 제공합니다.
- Foreground는 자체 표면이 있는 요소만 둡니다. Overlay 위에 텍스트를 직접 올리지 않습니다.
- Screen Overlay는 한 번에 하나만 표시합니다. modal 표면 위에 다른 modal 표면을 열면 Overlay를 새 표면 바로 아래로 옮기고 겹쳐 쌓지 않습니다.

## 공통 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| 색 | `gray.950` #1A1C20 | `color.gray.950` |
| 불투명도 | 45%, 색과 합성한 값 `rgba(26, 28, 32, .45)` | `opacity.scrim` |
| Blur | Blur On에서 Target에 4px backdrop blur | 현재 대응 토큰 없음 |
| 테두리·그림자 | 없음 | — |

Blur는 Foreground의 대비를 보장하지 않습니다. Foreground의 대비는 Blur Off 기준으로 확인합니다. Blur를 지원하지 않는 환경이나 사용자가 투명도 줄이기를 켠 환경에서는 Blur를 적용하지 않고 같은 색만 유지합니다.

### Scope

| Scope | 범위 | 쌓임 순서 |
|---|---|---|
| Screen | 화면 전체, safe area까지 덮음 | 함께 쓰는 표면 바로 아래. Bottom Sheet는 `elevation.z.sheet`, Dialog는 `elevation.z.dialog` 층 |
| Area | 부모 영역 전체, 부모의 모서리를 따라 clip | 부모 영역 안에서 Target 위, Foreground 아래 |

### Area Foreground

| 항목 | 값 | 토큰 |
|---|---|---|
| 정렬 | 영역의 가로·세로 중앙 | — |
| 영역 가장자리와의 최소 여백 | 16px | `spacing.16` |
| Foreground 사이 간격 | 8px | `spacing.8` |
| Foreground 개수 | 최대 2개 | — |

Foreground가 영역보다 커지면 영역을 넓히거나 Foreground를 영역 밖으로 옮깁니다. Foreground를 자르거나 겹쳐 두지 않습니다.

## 상태

Overlay는 누르거나 focus를 받는 상태가 없고, 표시 여부만 가집니다.

| 상태 | 값 |
|---|---|
| Hidden | Overlay가 없고 Target을 조작할 수 있음 |
| Visible | Target 위에 Overlay를 표시하고 Target의 입력을 막음 |

### 전환

| 대상 | 나타남 | 사라짐 |
|---|---|---|
| Overlay | 불투명도 0 → 1 | 불투명도 1 → 0 |
| Screen 시간·가속도 | 함께 쓰는 표면과 같은 시간(Bottom Sheet `motion.duration.sheet`, Dialog `motion.duration.dialog`) · `motion.easing.enter` | 같은 시간 · `motion.easing.exit` |
| Area 시간·가속도 | `motion.duration.color` 150ms · `motion.easing.enter` | 같은 시간 · `motion.easing.exit` |

Blur는 Overlay와 함께 나타나고 사라지며 blur 반경은 animation하지 않습니다. 동작 줄이기가 켜져 있어도 불투명도 전환은 유지합니다 — [Motion](../foundations/motion.json) 참고.

## 동작

| 입력·조건 | 결과 |
|---|---|
| Overlay 탭, Dismiss Tap | 함께 쓰는 표면을 닫고 Overlay를 Hidden으로 전환 |
| Overlay 탭, Dismiss None | 아무 일도 일어나지 않음 |
| Visible 상태에서 Target 조작 | Target의 pointer·keyboard 입력을 모두 막음 |
| 뒤로가기·ESC | Screen은 상위 표면의 규칙을 따름. Area는 Overlay에 영향 없음 |

Dismiss Tap은 유일한 닫기 방법이 아닙니다. 같은 결과를 닫기 버튼, 뒤로가기, ESC로도 제공합니다.

## 접근성

- **Overlay는 장식 층입니다.** 접근성 트리에서 숨기고 focus를 받지 않습니다.
- **Screen의 Target은 비활성화합니다.** Overlay가 보이는 동안 뒤 화면을 focus 순서와 보조 기술에서 제외합니다. focus를 표면 안으로 옮기고 닫으면 원래 위치로 되돌리는 규칙은 [Bottom Sheet](./bottom-sheet.md)와 [Dialog](./dialog.md)를 따릅니다.
- **Area의 가려진 control도 제외합니다.** Overlay 아래에 있어 조작할 수 없는 control은 focus 순서에서 제외합니다.
- **어둡게 덮는 것만으로 상태를 알리지 않습니다.** 잠김·일시정지처럼 Overlay가 뜻하는 상태는 Foreground의 라벨이나 아이콘으로 함께 알립니다.
- **Foreground의 대비는 자체 표면에서 계산합니다.** Overlay 위에 텍스트를 직접 올리면 가능한 모든 Target에서 대비를 보장할 수 없으므로 표면이 있는 요소를 사용합니다 — [Accessibility](../foundations/accessibility.md) 참고.
- **투명도 줄이기 설정을 따릅니다.** iOS의 투명도 줄이기처럼 플랫폼 설정이 켜져 있으면 Blur를 끕니다.

## 확장

Overlay는 덮는 층 하나만 정의하고, 새 요구는 옵션으로 추가합니다.

1. **새 사용처는 Overlay를 재사용합니다.** 컴포넌트마다 별도의 어두운 막을 정의하지 않고 Scope와 Dismiss를 골라 사용합니다.
2. **새 강도나 색은 토큰을 먼저 만듭니다.** 더 옅거나 짙은 Overlay, 밝은 Overlay가 필요하면 opacity와 overlay color 토큰을 foundations에 먼저 추가한 뒤 Tone 옵션으로 확장합니다. 토큰이 없으면 임의 값을 쓰지 않고 보고합니다.
3. **Gradient는 Shape 옵션으로 추가합니다.** 이미지 아래쪽 텍스트를 읽히게 하는 gradient는 전체를 덮는 Overlay와 목적이 다르므로 Shape(Solid / Gradient) 옵션으로 추가하고, 가장 밝은 Target에서도 Foreground 대비를 확인합니다. 스크롤이 이어진다는 것을 알리는 가장자리 흐림은 Overlay가 아니라 [Fog](./fog.md)를 사용합니다.
4. **Blur 강도를 바꿀 때는 blur 토큰을 먼저 정의합니다.** Blur 값을 사용처마다 다르게 두지 않습니다.
5. **새 Scope는 쌓임 순서와 입력 차단 범위를 함께 정의합니다.** 헤더 아래만 덮는 영역처럼 Scope를 추가하면 어느 층 사이에 두고 어디까지 입력을 막는지 이 문서에 적습니다.

## 사용 가이드

- **주의를 옮길 대상이 있을 때만 사용합니다.** Foreground나 modal 표면 없이 화면을 어둡게 하지 않습니다.
- **Overlay로 Disabled를 표현하지 않습니다.** 사용할 수 없는 control은 각 컴포넌트의 Disabled 상태와 이유 문구로 알립니다.
- **Blur는 Target이 복잡해 Foreground가 묻힐 때만 켭니다.** 기본값은 Off입니다.
- **Area Overlay 위의 행동은 1~2개로 줄입니다.** 행동이 많아지면 [Bottom Sheet](./bottom-sheet.md)로 옮깁니다.
- **Target의 핵심 정보를 오래 가리지 않습니다.** 학습 콘텐츠를 덮는 Overlay는 필요한 순간에만 표시하고 바로 걷을 수 있게 합니다.

색·간격·쌓임 순서·동작은 [Color](../foundations/color.json), [Spacing](../foundations/spacing.json), [Elevation](../foundations/elevation.json), [Motion](../foundations/motion.json)을, 접근성은 [Accessibility](../foundations/accessibility.md)를 참고합니다.
