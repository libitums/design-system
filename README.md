# libitum Design System

어학 학습 서비스 libitum의 디자인 시스템입니다. 실행 UI 컴포넌트 라이브러리가 아니라 **원본 스펙과 배포 파이프라인 저장소**입니다 — 디자인 토큰(JSON), 컴포넌트·지침 문서(Markdown), 아이콘 에셋(SVG)과 이를 검증·변환하는 도구로 이루어져 있습니다.

```
foundations/   토큰과 원칙 — 모든 값의 출처
components/    컴포넌트 스펙
assets/icons/  아이콘 SVG 815개 × 2 변형
src/           검증·생성 로직
scripts/       build·validate CLI 진입점
test/          파이프라인 테스트
dist/          재생성 가능한 package 산출물 (Git 제외)
```

---

## Foundations

| 파일 | 내용 |
|---|---|
| `color.json` | 35색 — gray scale 12 (gray 11 + white), brand 7, feedback 10, background 3, border 3 |
| `typography.json` | 22 스타일 — accent / display / heading / body / caption / label / button / dialogue |
| `font-delivery.md` | Web·iOS·Android·ReactLynx 폰트 제공 · 라이선스 · fallback 정책 |
| `accessibility.md` | hit area · 대비 · 키보드 · focus · accessible semantics 기준 |
| `spacing.json` | Progressive primitive scale (0~96) · 컴팩트 내부 간격 2 / 6 |
| `stroke.json` | 선 두께 thin 1 / regular 1.5 / strong 2 |
| `layout.json` | 화면 여백 · 간격 3단계 · safe area |
| `radius.json` | sm 6 / md 12 / lg 16 / xl 24 / full |
| `elevation.json` | 쌓임 순서 · 표면 색 · 그림자 s1~s3 |
| `motion.json` | duration d1~d6 · easing 6종 · reduced motion |
| `iconography.json` | 아이콘 에셋 메타 · 크기 스케일 |
| `writing-tone.md` | UX 문구 13원칙 |
| `international-design.md` | 로케일 표기 · 번역 길이 대응 |

토큰은 [W3C Design Tokens 포맷](https://tr.designtokens.org/format/)을 따릅니다. Style Dictionary, Tokens Studio와 호환됩니다.

## Components

| 파일 | 내용 |
|---|---|
| `button.md` | Neutral / Brand / Outline / Subtle / Text 5종 |
| `round-button.md` | 아이콘 전용 Neutral / Brand 원형 버튼 |
| `bottom-navigator.md` | 하단 탭 바 |
| `bottom-sheet.md` | 바텀 시트 |
| `dialog.md` | 다이얼로그 |
| `header/` | progress-header · back-header |
| `indicator/` | page · status · step |

## Assets

`assets/icons/`에 SVG 815개가 12개 카테고리로 나뉘어 있고, 각각 두 변형이 있습니다.

- **`padding/`** — 고정 viewBox(`0 0 10 10`). 광학 크기가 일정해 UI에 쓰는 기본값입니다.
- **`no-padding/`** — 아이콘별로 잘라낸 viewBox. 프레임을 꽉 채워야 할 때만 씁니다.

모든 아이콘은 `fill="currentColor"`라 부모의 `color`를 상속합니다.

## Package pipeline

최초 공식 소비 package는 `@libitum/design-tokens`와 `@libitum/icons`입니다. 이 저장소 루트의 `package.json`은 두 package를 생성하기 위한 private tooling package이며 npm에 직접 배포하지 않습니다.

| 경로 | 책임 |
|---|---|
| `foundations/`, `components/`, `assets/` | 사람이 수정하는 원본 source of truth |
| `src/` | 원본을 검증하고 package 산출물로 변환하는 로직 |
| `scripts/` | 로컬·CI에서 호출하는 CLI 진입점 |
| `test/` | 생성·검증 파이프라인의 자동 테스트 |
| `dist/design-tokens/` | `@libitum/design-tokens` 배포 산출물 |
| `dist/icons/` | `@libitum/icons` 배포 산출물 |

Node.js 24 LTS와 npm 11을 사용합니다.

```sh
npm run validate
npm test
npm run build
npm run check:generated
```

`dist/`는 원본에서 언제든 재생성할 수 있으므로 Git에 커밋하지 않습니다. 산출물을 직접 수정하지 말고 원본이나 생성 로직을 고친 뒤 다시 build합니다. 현재 build 진입점은 source와 output 경계를 검증·준비하고 기본 토큰 CSS, typography CSS, TypeScript ESM과 선언 파일을 생성합니다. 아이콘 에셋 변환은 후속 작업에서 추가합니다.

`npm run validate`는 source 경계, 모든 `foundations/*.json`의 token 구조·alias 참조, `components/**/*.md`의 token 참조, 저장소 Markdown 링크, SVG 아이콘 규칙을 검사합니다. Token은 `$value`와 직접 또는 상위 group에서 상속한 `$type`이 있어야 합니다. Alias는 다른 파일의 token도 참조할 수 있지만 target이 존재해야 하고 순환해서는 안 됩니다. 오류는 파일과 token path 또는 Markdown 줄·열 위치를 함께 출력합니다. Type별 value 형식은 별도 검증 단계에서 다룹니다.

Component 문서의 `spacing.16`, `typography.body.m` 같은 참조는 실제 foundation token이어야 합니다. `fg.*`, `brand.*` 등 color 하위 경로는 `color.*` 축약으로 해석하고, 마지막 segment의 `*`는 실제 하위 token이 있을 때만 허용합니다. Extension metadata는 foundation JSON에 해당 경로가 실제 존재해야 합니다. 아직 token이 없는 값은 `현재 대응 토큰 없음`으로 명시하며 검증 결과에서 오류가 아닌 예외로 따로 집계합니다.

Markdown 링크는 상대 경로의 대소문자와 대상 heading anchor까지 검사합니다. Component 스펙은 저장소 안에서 완결되어야 하므로 외부 링크를 허용하지 않습니다. Root와 foundation 문서는 출처·표준을 위한 HTTPS 링크만 허용하며 HTTP와 그 밖의 외부 scheme은 정책 위반으로 구분합니다. 외부 페이지의 네트워크 접근 가능 여부는 검사하지 않습니다.

SVG 아이콘은 `padding`과 `no-padding`의 `category/name.svg` 2단계 상대 경로가 한 쌍이어야 합니다. `padding`의 viewBox는 `0 0 10 10`으로 고정하고, 모든 SVG의 root와 별도 fill 선언은 `currentColor`만 허용합니다. CSS 키워드인 `currentColor` 비교는 ASCII 대소문자를 구분하지 않습니다. 파일명은 변형 안에서 대소문자를 무시하고 고유해야 하며, 잘못된 XML, XML 주석·DOCTYPE, 지원하지 않는 child element는 파싱 오류로 처리합니다.

`npm run build`는 검증을 먼저 실행한 뒤 기본 token 106개를 `dist/design-tokens/css/variables.css`, typography 변수 116개를 `dist/design-tokens/css/typography.css`에 생성합니다. Foundation token 139개는 `dist/design-tokens/index.js`와 `index.d.ts`로 생성합니다. 배포된 package에서는 다음 경로로 불러옵니다.

```css
@import "@libitum/design-tokens/css/variables.css";
@import "@libitum/design-tokens/css/typography.css";
```

Token path는 `--libitum-{token-path}`의 kebab-case CSS 변수로 변환됩니다. Alias는 대상 변수의 `var(...)` 참조로 유지되고, shadow와 cubicBezier는 각각 CSS box-shadow 값과 `cubic-bezier(...)`로 직렬화됩니다. Icon metadata는 `@libitum/icons`에서 제공합니다.

Typography는 22개 스타일마다 `font-family`, `font-weight`, `font-size`, `line-height`, `letter-spacing`을 독립된 CSS 변수로 제공합니다. 예를 들어 `typography.body.l`은 다음처럼 소비합니다.

```css
.body-large {
  font-family: var(--libitum-typography-body-l-font-family);
  font-weight: var(--libitum-typography-body-l-font-weight);
  font-size: var(--libitum-typography-body-l-font-size);
  line-height: var(--libitum-typography-body-l-line-height);
  letter-spacing: var(--libitum-typography-body-l-letter-spacing);
}
```

Font family fallback stack과 weight 원시 변수도 함께 출력합니다. 폰트 파일과 `@font-face`는 이 산출물에 포함하지 않으며, 플랫폼별 제공 방식은 `foundations/font-delivery.md`를 따릅니다.

TypeScript에서는 최상위 token group을 named export로 가져오거나 전체 `tokens` 객체를 사용할 수 있습니다. Alias는 ESM 산출물에서 최종 값으로 해석되며, 생성된 선언 파일은 모든 값을 literal·readonly 타입으로 제공합니다.

```ts
import { color, spacing, tokens, typography } from "@libitum/design-tokens";

const brand = color.brand.primary;
const screenPadding = spacing[16];
const heading = typography.heading.s;
const allColors = tokens.color;
```

Package exports는 다음 경로를 제공합니다.

| 경로 | 산출물 |
|---|---|
| `@libitum/design-tokens` | ESM 상수와 TypeScript 선언 |
| `@libitum/design-tokens/css/variables.css` | 기본 token CSS 변수 |
| `@libitum/design-tokens/css/typography.css` | Typography CSS 변수 |

`npm run check:generated`는 새 임시 workspace에서 연속으로 두 번 build한 뒤 생성 파일의 상대 경로와 SHA-256을 비교합니다. 또한 실제 저장소 build 전후의 Git 상태가 달라지면 실패합니다. 따라서 생성 순서나 내용이 실행마다 달라지거나 build가 새 미커밋 변경을 만들면 non-zero로 종료되며, PR 자동 검증 workflow에서 그대로 호출할 수 있습니다.

---

## 쓰는 법

**값을 직접 쓰지 마세요.** 색·간격·선 두께·폰트·모서리·그림자·모션은 모두 `foundations/`에 토큰으로 있습니다.

```
❌ padding: 15px            ❌ color: #F5F5F5
✅ padding: {spacing.16}    ✅ color: {color.gray.100}
```

컴포넌트를 구현할 때는 해당 스펙 문서를 먼저 읽으세요. 상태·사이즈·예외가 표로 정리되어 있습니다.

### AI 에이전트

`AGENTS.md`에 작업 규칙이 있습니다. 스킬은 Codex가 `.codex/skills/`, Claude Code가 `.claude/skills/`를 읽습니다.

| 스킬 | 언제 |
|---|---|
| `design-system` | UI 구현, 토큰 선택, 새 스펙 작성 |
| `writing-tone` | 사용자에게 보이는 한국어 문구 작성·수정 |

---

## 아직 없는 것

- **다크 모드** — `color.json`은 라이트 모드 단일 값입니다.
- **Futura Webfont·App 라이선스** — 정확한 제품과 플랫폼별 라이선스가 확정되기 전에는 파일을 Web이나 앱에 배포하지 않습니다.
- **컴포넌트** — Toast, Card, Text Field.
