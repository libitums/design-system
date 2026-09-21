# Font Delivery

웹과 모바일 앱에서 typography 토큰의 폰트를 제공하고, 폰트가 없거나 등록·로드에 실패했을 때의 fallback을 정의합니다.

## 플랫폼별 제공 방식

| 플랫폼 | Pretendard 배포물 | Jost 배포물 | 제공 방식 | Production 네트워크 의존 |
|---|---|---|---|---|
| Web | Variable Dynamic Subset WOFF2 | Variable subset WOFF2 | frontend static root에서 self-host | 없음 |
| iOS | `PretendardVariable.ttf` | `JostVariable.ttf` | 앱 번들에 포함하고 시작 시 등록 | 없음 |
| Android | `PretendardVariable.ttf` | `JostVariable.ttf` | `res/font/`에 포함하고 앱 리소스로 등록 | 없음 |
| ReactLynx | iOS·Android에 포함된 동일 TTF | iOS·Android에 포함된 동일 TTF | native host가 제공하는 local font를 등록·로드 | 없음 |

**Production에서는 Pretendard와 Jost를 런타임에 CDN이나 font provider에서 내려받지 않습니다.** 첫 화면, 오프라인, 느린 네트워크에서도 같은 기본 폰트를 사용하기 위해 Web은 자체 static asset, 앱은 앱 패키지에 포함된 asset을 사용합니다.

이 스펙 저장소에는 폰트 바이너리를 중복 저장하지 않습니다. 각 Web·앱 프로젝트의 빌드가 아래에 고정된 공식 배포물과 라이선스를 준비합니다.

---

## Font family와 플랫폼 adapter

`font.family.*`는 앞에서부터 사용할 수 있는 첫 번째 폰트를 선택하는 ordered fallback stack입니다.

### Default

```text
Pretendard Variable
→ Pretendard
→ -apple-system
→ BlinkMacSystemFont
→ system-ui
→ Roboto
→ Helvetica Neue
→ Segoe UI
→ Apple SD Gothic Neo
→ Noto Sans KR
→ Malgun Gothic
→ emoji fonts
→ sans-serif
```

- Web은 `font.family.default` 배열을 CSS `font-family` 순서로 사용합니다.
- iOS·Android·ReactLynx adapter는 등록된 `Pretendard Variable`을 Default로 연결합니다.
- native adapter는 `-apple-system`, `BlinkMacSystemFont`, `system-ui` 같은 CSS 이름을 플랫폼 API에 그대로 전달하지 않습니다.
- Pretendard 등록에 실패하면 해당 플랫폼의 기본 UI 폰트로 fallback합니다. 앱 실행을 중단하거나 원격 폰트 다운로드를 시도하지 않습니다.

### Accent

```text
Jost Variable
→ Jost
→ Default stack
```

- Web은 `font.family.accent` 배열을 CSS `font-family` 순서로 사용합니다.
- iOS·Android·ReactLynx adapter는 등록된 `Jost`를 Accent로 연결합니다.
- Jost는 한글 글리프가 없습니다. 한글은 글리프 단위로 Default의 Pretendard로 fallback합니다.
- Jost 등록에 실패하면 Accent 전체를 Default로 fallback합니다. 앱 실행을 중단하거나 원격 폰트 다운로드를 시도하지 않습니다.

---

## Pretendard 기준 배포물

| 항목 | 정책 |
|---|---|
| 기준 버전 | `1.3.9` 고정 |
| font-family | `Pretendard Variable` |
| weight 범위 | `45 920` |
| font-style | `normal` |
| 앱 파일 | `dist/public/variable/PretendardVariable.ttf` |
| Web 파일 | `dist/web/variable/pretendardvariable-dynamic-subset.css`와 참조 WOFF2 |
| 라이선스 | SIL Open Font License 1.1 |
| 공식 배포처 | [Pretendard v1.3.9](https://github.com/orioncactus/pretendard/tree/v1.3.9/packages/pretendard) |
| 라이선스 원문 | [Pretendard v1.3.9 LICENSE](https://github.com/orioncactus/pretendard/blob/v1.3.9/LICENSE) |

- 공식 `1.3.9` 배포물에서 파일을 가져오고 임의 변환·재생성하지 않습니다.
- 각 소비 프로젝트는 파일 출처, 버전, checksum을 dependency manifest나 빌드 기록에 남깁니다.
- `OFL.txt`를 소스의 폰트 디렉터리에 함께 보관하고, 배포물의 third-party notice에도 포함합니다.
- 버전을 바꿀 때는 Web과 앱을 같은 버전으로 함께 올리고 한글·영문 혼합 문구의 줄바꿈을 다시 확인합니다.

---

## Jost 기준 배포물

| 항목 | 정책 |
|---|---|
| 기준 버전 | `3.710` 고정 |
| font-family | Web `Jost Variable` · 앱 `Jost` |
| weight 범위 | `100 900` |
| 사용 weight | `500`, `700` |
| font-style | `normal` |
| 앱 파일 | Google Fonts `ofl/jost/Jost[wght].ttf` (commit `91b26e2e0231f5aa85f5470a7b23d6d732ab15fc`) |
| 앱 파일 SHA-256 | `6343b70971000b04c5d401c96ae08ce371086135e999d5e1e1413039c0213076` |
| Web 파일 | `@fontsource-variable/jost@5.3.0`의 `wght.css`와 참조 `*-wght-normal.woff2` |
| 라이선스 | SIL Open Font License 1.1 |
| 원 저작 | [indestructible-type/Jost](https://github.com/indestructible-type/Jost) |
| 앱 파일 배포처 | [google/fonts ofl/jost](https://github.com/google/fonts/tree/91b26e2e0231f5aa85f5470a7b23d6d732ab15fc/ofl/jost) |
| Web 파일 배포처 | [@fontsource-variable/jost 5.3.0](https://www.npmjs.com/package/@fontsource-variable/jost/v/5.3.0) |
| 라이선스 원문 | [Jost OFL.txt](https://github.com/google/fonts/blob/91b26e2e0231f5aa85f5470a7b23d6d732ab15fc/ofl/jost/OFL.txt) |

- 위 배포물에서 파일을 가져오고 글리프·메트릭을 변환·재생성하지 않습니다. 앱 파일은 플랫폼 규칙에 맞춰 파일명만 바꿉니다.
- Italic 파일은 typography 토큰이 사용하지 않으므로 포함하지 않습니다.
- Pretendard와 같은 방식으로 파일 출처, 버전, checksum을 남기고 라이선스 파일(Web `OFL.txt`, 앱 `Jost-OFL.txt`)을 폰트 디렉터리와 third-party notice에 포함합니다.
- Web과 앱은 같은 `3.710` 기반 파일을 사용합니다. 버전을 바꿀 때는 Web과 앱을 함께 올리고 Accent 문구의 너비를 다시 확인합니다.

---

## Web

Production에서는 외부 CDN에 런타임 의존하지 않고 frontend의 static root에서 제공합니다.

```text
/fonts/pretendard/1.3.9/
├── pretendardvariable-dynamic-subset.css
├── OFL.txt
└── woff2-dynamic-subset/
    └── PretendardVariable.subset.*.woff2

/fonts/jost/3.710/
├── wght.css
├── OFL.txt
└── files/
    └── jost-*-wght-normal.woff2
```

- 공식 `1.3.9` 배포물의 CSS와 WOFF2를 함께 복사합니다.
- Jost는 `@fontsource-variable/jost@5.3.0`의 `wght.css`와 `files/`의 `*-wght-normal.woff2`만 복사합니다. italic 파일과 선언은 포함하지 않습니다.
- CSS의 `src`는 위 `woff2-dynamic-subset/` 상대 경로만 가리키도록 조정합니다.
- `font-family`, `font-style`, `font-display`, `font-weight`, `unicode-range`는 공식 선언을 바꾸지 않습니다.
- `font-display: swap`을 유지합니다.

### Loading

```html
<link
  rel="preload"
  as="style"
  href="/fonts/pretendard/1.3.9/pretendardvariable-dynamic-subset.css"
>
<link
  rel="stylesheet"
  href="/fonts/pretendard/1.3.9/pretendardvariable-dynamic-subset.css"
>
<link rel="stylesheet" href="/fonts/jost/3.710/wght.css">
```

- **Stylesheet만 preload합니다.** `unicode-range`에 따라 필요한 조각만 선택되므로 개별 WOFF2 파일을 일괄 preload하지 않습니다.
- **Jost는 preload하지 않습니다.** Accent는 일부 문구에만 쓰이므로 첫 화면의 Pretendard 로드를 우선합니다.
- **텍스트를 숨기지 않습니다.** 로드 전에는 fallback으로 표시하고 Pretendard·Jost가 준비되면 교체합니다.
- CDN을 사용하는 개발 환경에서는 stylesheet 요청에 `crossorigin`을 붙이고 CDN origin을 `preconnect`할 수 있습니다. Production 기준은 same-origin self-host입니다.

---

## 모바일 앱 공통

```text
app font assets
├── PretendardVariable.ttf
├── JostVariable.ttf
├── OFL.txt          Pretendard
└── Jost-OFL.txt     Jost
```

- **전체 Variable TTF를 앱 패키지에 포함합니다.** Web용 WOFF2 dynamic subset 조각을 앱에서 사용하지 않습니다.
- **첫 화면을 그리기 전에 한 번 등록·로드합니다.** 화면 단위로 다시 처리하거나 화면이 나타난 뒤 원격에서 교체하지 않습니다.
- typography 토큰이 사용하는 `500`, `600`, `700`, `800` weight가 실제 기기에서 구분되어 렌더링되는지 검증합니다. Jost는 Accent가 사용하는 `500`, `700`을 검증합니다.
- 지원하는 최소 OS나 Lynx engine에서 Variable TTF의 weight가 올바르게 렌더링되지 않는 경우에만 공식 static OTF의 `Medium`, `SemiBold`, `Bold`, `ExtraBold`로 대체합니다. 필요한 4개 weight만 포함하고 Variable TTF와 중복 번들하지 않습니다.
- 등록 실패는 개발·모니터링 환경에 기록하고 플랫폼 기본 UI 폰트로 fallback합니다. 사용자에게 폰트 오류를 노출하거나 앱 실행을 중단하지 않습니다.
- 앱의 접근성 글자 크기 설정을 적용하고, 확대 시 줄바꿈·잘림·Hug 요소를 다시 검증합니다.

### iOS

기본 경로는 다음과 같이 유지합니다.

```text
ios/<AppTarget>/Fonts/
├── PretendardVariable.ttf
├── JostVariable.ttf
├── OFL.txt
└── Jost-OFL.txt
```

1. `PretendardVariable.ttf`와 `JostVariable.ttf`를 앱 target membership에 포함합니다.
2. `Info.plist`의 `UIAppFonts`에 `Fonts/PretendardVariable.ttf`, `Fonts/JostVariable.ttf` 상대 경로를 등록합니다.
3. 파일명이 아니라 등록된 font family·PostScript name을 확인해 typography adapter에 연결합니다. Jost의 family는 `Jost`입니다.
4. 앱 시작 검증에서 Pretendard의 `500`, `600`, `700`, `800`, Jost의 `500`, `700` weight 생성 여부를 확인합니다.
5. Pretendard가 등록되지 않으면 iOS system font로, Jost가 등록되지 않으면 Default로 fallback합니다.

iOS 앱 내부에서만 쓰는 번들 폰트에 system-wide Font capability를 요구하지 않습니다.

### Android

기본 경로는 다음과 같이 유지합니다.

```text
android/app/src/main/res/font/
├── pretendard_variable.ttf
└── jost_variable.ttf
```

1. 파일명은 Android resource 규칙에 맞춰 `pretendard_variable.ttf`, `jost_variable.ttf`로 둡니다.
2. native typography adapter는 `@font/pretendard_variable`을 Default family로, `@font/jost_variable`을 Accent family로 연결합니다.
3. 앱 시작 검증에서 Pretendard의 `500`, `600`, `700`, `800`, Jost의 `500`, `700` weight 생성 여부를 확인합니다.
4. Pretendard를 불러오지 못하면 Android 기본 `sans-serif` family로, Jost를 불러오지 못하면 Default로 fallback합니다.
5. Downloadable Fonts나 외부 font provider를 Production fallback으로 사용하지 않습니다.

`OFL.txt`와 `Jost-OFL.txt`는 Android resource 이름으로 변환하지 않고 프로젝트의 third-party license 디렉터리와 배포 notice에 보관합니다.

### ReactLynx

ReactLynx는 새 폰트 파일을 별도로 배포하지 않고 iOS·Android host에 포함된 동일 `PretendardVariable.ttf`와 `JostVariable.ttf`를 사용합니다.

- native host가 local font 경로·이름을 제공하고 Lynx의 등록·로드가 끝난 뒤 첫 화면을 렌더링합니다.
- `@font-face` 또는 `lynx.addFont()`의 `src`는 패키지에 포함된 local asset이나 host가 등록한 local font만 가리킵니다.
- Production의 `src`에 CDN·원격 URL을 사용하지 않습니다.
- Lynx `@font-face`는 `font-weight` descriptor를 지원하지 않으므로 weight별 face 선언에 의존하지 않습니다. typography 토큰의 `font-weight`가 Pretendard Variable TTF의 `500`, `600`, `700`, `800`과 Jost Variable TTF의 `500`, `700`을 실제로 선택하는지 iOS·Android에서 각각 검증합니다.
- custom font를 사용할 수 없는 경우 custom family를 제거하고 host 플랫폼의 기본 UI 폰트로 fallback합니다.
- `lynx.getTextInfo()`는 custom `@font-face` 측정에 사용할 수 없으므로 custom font의 사전 너비 계산 기준으로 사용하지 않습니다.

Lynx의 local font 경로와 등록 API는 사용하는 engine 버전의 호환성 표를 확인하고 앱 프로젝트에서 고정합니다.

---

## Layout stability와 검증

- typography 토큰의 `lineHeight`를 유지해 fallback 중에도 세로 리듬을 고정합니다.
- 텍스트 너비는 폰트마다 다르므로 Hug 요소에 폰트별 고정 너비를 저장하지 않습니다.
- Web은 CSS intrinsic sizing을 우선합니다. JavaScript로 너비를 계산한다면 `document.fonts.ready` 이후 다시 측정합니다.
- 앱은 실제 렌더러의 텍스트 측정을 사용하고 시스템 글자 크기가 바뀌면 다시 측정합니다.
- Button은 [Button 스펙](../components/button.md)의 실측 산식을 따릅니다.

다음 조건을 모두 확인합니다.

- Web font 차단과 느린 네트워크의 swap 전후
- iOS·Android 오프라인 최초 실행
- 앱 번들 폰트 등록 성공·실패
- `500`, `600`, `700`, `800` weight 구분
- ReactLynx iOS·Android의 동일 문구 줄바꿈
- Jost 로드·등록 실패 시 Accent의 Default fallback
- 한글·영문·숫자·emoji 혼합, Accent의 Jost·Pretendard 혼합
- 가장 긴 지원 문구와 접근성 글자 크기 확대

관련 토큰은 [Typography](./typography.json), 다국어 글꼴 적용은 [International Design](./international-design.md)을 참고합니다.
