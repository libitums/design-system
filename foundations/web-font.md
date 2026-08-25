# Web Font

웹에서 typography 토큰의 폰트를 제공하고, 폰트가 없거나 로드에 실패했을 때의 fallback을 정의합니다.

## Font family stack

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

**웹폰트가 로드되면 Pretendard Variable을 우선합니다.** 로드 전이나 실패 시에는 운영체제의 UI 폰트와 한글 폰트 순서로 fallback합니다.

### Accent

```text
Futura
→ Default stack
```

**Futura가 설치된 환경에서만 Futura를 사용합니다.** Futura가 없거나 한글처럼 지원하지 않는 글리프는 즉시 Default stack으로 fallback합니다.

---

## Pretendard Variable 제공

| 항목 | 정책 |
|---|---|
| 기준 버전 | `1.3.9` 고정 |
| 기준 배포물 | Variable Dynamic Subset |
| font-family | `Pretendard Variable` |
| weight 범위 | `45 920` |
| font-style | `normal` |
| font-display | `swap` |
| 라이선스 | SIL Open Font License 1.1 |
| 공식 배포처 | [Pretendard v1.3.9](https://github.com/orioncactus/pretendard/tree/v1.3.9/packages/pretendard) |
| 라이선스 원문 | [Pretendard v1.3.9 LICENSE](https://github.com/orioncactus/pretendard/blob/v1.3.9/LICENSE) |

Production에서는 외부 CDN에 런타임 의존하지 않고 frontend의 static root에서 제공합니다.

```text
/fonts/pretendard/1.3.9/
├── pretendardvariable-dynamic-subset.css
├── OFL.txt
└── woff2-dynamic-subset/
    └── PretendardVariable.subset.*.woff2
```

- 공식 `1.3.9` 배포물의 CSS와 WOFF2를 함께 복사합니다.
- CSS의 `src`는 위 `woff2-dynamic-subset/` 상대 경로만 가리키도록 조정합니다.
- `font-family`, `font-style`, `font-display`, `font-weight`, `unicode-range`는 공식 선언을 바꾸지 않습니다.
- `OFL.txt`를 폰트 파일과 같은 버전 디렉터리에 둡니다.
- 이 스펙 저장소에는 폰트 바이너리를 중복 저장하지 않습니다. frontend 빌드가 고정 버전의 공식 배포물에서 static asset을 준비합니다.

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
```

- **Stylesheet만 preload합니다.** unicode-range에 따라 필요한 조각만 선택되므로 개별 WOFF2 파일을 일괄 preload하지 않습니다.
- **`font-display: swap`을 유지합니다.** 텍스트를 숨기지 않고 fallback으로 먼저 표시합니다.
- CDN을 사용하는 개발 환경에서는 stylesheet 요청에 `crossorigin`을 붙이고 CDN origin을 `preconnect`할 수 있습니다. Production 기준은 same-origin self-host입니다.

---

## Futura 제한

현재 `Futura`는 정확한 foundry, 제품명, 제공 weight, 웹폰트 라이선스 범위가 기록되어 있지 않습니다. 따라서 다음을 금지합니다.

- Futura 파일을 이 저장소나 npm package에 추가
- Futura `@font-face` 작성
- Futura 파일 또는 stylesheet preload
- Desktop 라이선스의 폰트 파일을 웹이나 앱에 전용

Futura 웹폰트를 활성화하려면 먼저 다음이 모두 필요합니다.

1. 정확한 foundry와 제품명
2. `500`, `700` weight 또는 이를 포함하는 Variable font
3. 사용할 도메인을 포함하는 Webfont 라이선스
4. 앱에 포함한다면 별도의 App 라이선스
5. 원본 라이선스 문서와 파일 출처 기록

조건을 충족하기 전에는 `font.family.accent`의 첫 항목인 `Futura`를 local font 이름으로만 해석하고, 없으면 Default stack을 사용합니다.

---

## Layout stability

- typography 토큰의 `lineHeight`를 유지해 fallback 중에도 세로 리듬을 고정합니다.
- 텍스트 너비는 폰트마다 다르므로 Hug 요소에 폰트별 고정 너비를 저장하지 않습니다.
- CSS intrinsic sizing을 우선합니다. JavaScript로 너비를 계산한다면 `document.fonts.ready` 이후 다시 측정합니다.
- Button은 [Button 스펙](../components/button.md)의 실측 산식을 따릅니다.
- 다음 조건을 모두 확인합니다: 웹폰트 차단, 느린 네트워크의 swap 전후, Futura 미설치, 한글·영문 혼합, 가장 긴 지원 문구.

관련 토큰은 [Typography](./typography.json), 다국어 글꼴 적용은 [International Design](./international-design.md)을 참고합니다.
