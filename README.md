# libitum Design System

어학 학습 서비스 libitum의 디자인 시스템입니다. 실행 UI 컴포넌트 라이브러리가 아니라 **원본 스펙과 배포 파이프라인 저장소**입니다 — 디자인 토큰(JSON), 컴포넌트·지침 문서(Markdown), 아이콘 에셋(SVG)과 이를 검증·변환하는 도구로 이루어져 있습니다.

```
foundations/   토큰과 원칙 — 모든 값의 출처
components/    컴포넌트 스펙
assets/icons/  아이콘 SVG 815개 × 2 변형
src/           검증·생성 로직 (tooling 계층)
scripts/       build·validate CLI 진입점
test/          파이프라인 테스트
packages/      배포 package — manifest는 추적, dist/ 산출물은 Git 제외
examples/      design-system 소유 private 소비 fixture·Host
RELEASING.md   SemVer·deprecation·release 정책
CHANGELOG.md   두 package의 주요 변경 기록
CONSUMING.md   Frontend package 설치·사용·upgrade 가이드
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

## Workspace 구조

저장소는 원본 스펙, 생성 도구, 배포 package, 소비 fixture를 네 계층으로 나눕니다. 루트 `package.json`은 배포하지 않는 private tooling package이며 `packages/*`와 `examples/*`를 npm workspace로 선언합니다.

| 계층 | 경로 | 책임 |
|---|---|---|
| source | `foundations/`, `components/`, `assets/` | 사람이 수정하는 원본 토큰·스펙·에셋 |
| tooling | `src/`, `scripts/`, `test/` | 원본을 검증·생성·배포하는 도구, 루트 명령 진입점, 저장소 단위 검증 |
| packages | `packages/` | 배포 가능한 플랫폼별 package 경계 |
| examples | `examples/` | design-system 소유 private 소비 fixture·Host |

`src/`는 목표 구조의 `tooling/` 계층이며, 경로 이동은 이 계층 계약과 별개로 다룹니다.

의존은 한 방향으로만 흐릅니다.

```text
foundations / components / assets
  → src (tooling)
    → packages
      → examples
```

- **역방향 의존을 허용하지 않습니다.** `packages`는 `examples`에, `src`는 `packages`에 의존할 수 없습니다.
- **package 간 비공개 경로 import를 허용하지 않습니다.** 다른 package는 `exports`에 선언된 공개 경로로만 참조합니다. 생성 산출물의 내부 파일을 직접 가리키지 않습니다.
- **`examples/*`는 `private: true`입니다.** 배포하지 않으며 배포 allowlist에 넣지 않습니다.
- **package manifest는 추적하고 생성 산출물은 추적하지 않습니다.** `packages/<name>/package.json`이 공개 API와 version을 정의하고, `packages/<name>/dist/`는 build가 만들며 Git에 넣지 않습니다.
- **배포는 workspace 전체가 아니라 명시적 allowlist만 사용합니다.** 대상은 `src/package-publish-config.mjs`에 나열한 package이며, `packages/`에 package를 추가해도 allowlist에 넣기 전에는 배포되지 않습니다.
- **두 배포 package는 하나의 version을 공유하고 함께 배포합니다.**
- **플랫폼별 구현은 이 저장소가 소유합니다.** ReactLynx wrapper, alias, loader, plugin과 검증용 fixture·Host를 소비 저장소에 두지 않습니다. 소비 저장소는 완성된 package를 설치하고 공개된 설정을 연결하기만 합니다.

이 계약은 `src/workspace-layout.mjs`에 정의되어 있고 `npm run validate`가 검사합니다. 계층별 세부 규칙은 [`packages/README.md`](./packages/README.md)와 [`examples/README.md`](./examples/README.md)에 있습니다.

## Package pipeline

최초 공식 소비 package는 `@libitums/design-tokens`와 `@libitums/icons`입니다. 이 저장소 루트의 `package.json`은 두 package를 생성하기 위한 private tooling package이며 npm에 직접 배포하지 않습니다.

두 package는 하나의 version을 공유합니다. 변경 수준과 deprecation·release 절차는 [release policy](./RELEASING.md), release별 주요 변경은 [changelog](./CHANGELOG.md)에서 확인합니다.

Frontend project의 registry 인증, 설치, CSS·TypeScript·icon 사용과 upgrade 절차는 [package consumption guide](./CONSUMING.md)를 따릅니다.

경로별 책임과 의존 방향은 [workspace 구조](#workspace-구조)를 따릅니다. 두 package는 `packages/design-tokens/`와 `packages/icons/`에 있고, 배포 산출물은 각 package의 `dist/`에 생성됩니다.

Node.js 24 LTS와 npm 11을 사용합니다.

```sh
npm run validate
npm test
npm run build
npm run check:generated
npm run check:icon-bundle
```

Pull Request와 `main` push에서는 GitHub Actions가 위 검증을 자동 실행합니다. `Validate source`, `Test`, `Build`, `Check generated output`, `Check icon bundle`을 독립된 job으로 표시하고, 한 job이 실패해도 나머지 검증을 계속 실행합니다. CI는 `.node-version`의 Node.js 24, npm 11.16.0과 `package-lock.json` 기반 npm cache를 사용합니다.

검증된 package는 GitHub Actions의 `Publish packages` workflow에서 GitHub Packages로 배포합니다. `stable`은 현재 `main` HEAD만 `latest`로 배포하고, `canary`는 선택한 ref를 고유한 prerelease version과 별도 dist-tag로 배포합니다. 인증·중복 version·결과 기록 기준은 [release policy](./RELEASING.md)를 따릅니다.

`packages/*/dist/`는 원본에서 언제든 재생성할 수 있으므로 Git에 커밋하지 않습니다. 반면 각 package의 `package.json`은 공개 API와 version을 정의하는 원본이므로 추적하며, 두 manifest의 version은 루트 `package.json`과 같아야 합니다. 산출물을 직접 수정하지 말고 원본이나 생성 로직을 고친 뒤 다시 build합니다. 현재 build 진입점은 source와 output 경계를 검증·준비하고 기본 토큰 CSS, typography CSS, TypeScript ESM과 선언 파일, 개별 아이콘 package를 생성합니다.

`npm run validate`는 source 경계, 모든 `foundations/*.json`의 token 구조·alias 참조, `components/**/*.md`의 token 참조, 저장소 Markdown 링크, SVG 아이콘 규칙을 검사합니다. Token은 `$value`와 직접 또는 상위 group에서 상속한 `$type`이 있어야 합니다. Alias는 다른 파일의 token도 참조할 수 있지만 target이 존재해야 하고 순환해서는 안 됩니다. 오류는 파일과 token path 또는 Markdown 줄·열 위치를 함께 출력합니다. Type별 value 형식은 별도 검증 단계에서 다룹니다.

Component 문서의 `spacing.16`, `typography.body.m` 같은 참조는 실제 foundation token이어야 합니다. `fg.*`, `brand.*` 등 color 하위 경로는 `color.*` 축약으로 해석하고, 마지막 segment의 `*`는 실제 하위 token이 있을 때만 허용합니다. Extension metadata는 foundation JSON에 해당 경로가 실제 존재해야 합니다. 아직 token이 없는 값은 `현재 대응 토큰 없음`으로 명시하며 검증 결과에서 오류가 아닌 예외로 따로 집계합니다.

Markdown 링크는 상대 경로의 대소문자와 대상 heading anchor까지 검사합니다. Component 스펙은 저장소 안에서 완결되어야 하므로 외부 링크를 허용하지 않습니다. Root와 foundation 문서는 출처·표준을 위한 HTTPS 링크만 허용하며 HTTP와 그 밖의 외부 scheme은 정책 위반으로 구분합니다. 외부 페이지의 네트워크 접근 가능 여부는 검사하지 않습니다.

SVG 아이콘은 `padding`과 `no-padding`의 `category/name.svg` 2단계 상대 경로가 한 쌍이어야 합니다. `padding`의 viewBox는 `0 0 10 10`으로 고정하고, 모든 SVG의 root와 별도 fill 선언은 `currentColor`만 허용합니다. CSS 키워드인 `currentColor` 비교는 ASCII 대소문자를 구분하지 않습니다. 파일명은 변형 안에서 대소문자를 무시하고 고유해야 하며, 잘못된 XML, XML 주석·DOCTYPE, 지원하지 않는 child element는 파싱 오류로 처리합니다.

`npm run build`는 검증을 먼저 실행한 뒤 기본 token 111개를 `packages/design-tokens/dist/css/variables.css`, typography 변수 116개를 `packages/design-tokens/dist/css/typography.css`에 생성합니다. Foundation token 139개는 `packages/design-tokens/dist/index.js`와 `index.d.ts`로 생성합니다. 배포된 package에서는 다음 경로로 불러옵니다.

```css
@import "@libitums/design-tokens/css/variables.css";
@import "@libitums/design-tokens/css/typography.css";
```

Token path는 `--libitum-{token-path}`의 kebab-case CSS 변수로 변환됩니다. Alias는 대상 변수의 `var(...)` 참조로 유지되고, shadow와 cubicBezier는 각각 CSS box-shadow 값과 `cubic-bezier(...)`로 직렬화됩니다. 아이콘 렌더 크기는 `--libitum-icon-size-xs~xl`로 제공하며 각각 대응하는 `spacing` 변수를 참조합니다. Icon 에셋과 metadata는 `@libitums/icons`에서 제공합니다.

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
import { color, spacing, tokens, typography } from "@libitums/design-tokens";

const brand = color.brand.primary;
const screenPadding = spacing[16];
const heading = typography.heading.s;
const allColors = tokens.color;
```

아이콘은 padding 변형을 기본 경로로 제공하고, 프레임을 꽉 채워야 할 때만 `no-padding` 경로를 사용합니다. 개별 import는 해당 SVG 하나만 정적 에셋으로 가져오며 결과 타입은 `string`입니다. 원본 파일명은 lowercase kebab-case로 정규화되므로 `A-to-Z.svg`는 `a-to-z`로 가져옵니다.

```ts
import heart from "@libitums/icons/heart";
import heartNoPadding from "@libitums/icons/no-padding/heart";

const iconSources = { heart, heartNoPadding };
```

`@libitums/icons/manifest.json`에는 815개 아이콘의 export 이름, 원본 이름, category, 두 variant 경로가 들어 있습니다. ReactLynx wrapper와 접근성 이름은 현재 이 package에 포함하지 않습니다. 필요한 플랫폼 구현은 이 저장소가 `packages/`에서 제공하며 소비 저장소가 따로 구현하지 않습니다.

아이콘 bundle 검증은 고정된 `@lynx-js/rspeedy` 0.16.5 production build로 빈 entry와 `heart` 단일 import를 비교합니다. Rspeedy 기본값에 따라 2KiB 미만 SVG는 data URI로 인라인되므로, 별도 SVG 파일 개수만 세지 않고 Rspack module graph와 raw·gzip bundle 증가량을 함께 검사합니다.

```sh
npm run check:icon-bundle
```

통과 기준은 `heart.svg` module만 포함되고 `arrow-down.svg`의 module과 payload가 제외되는 것입니다. 산출물은 `static/js/main.js` 하나여야 합니다. Raw 증가는 원본 SVG의 base64 크기 + 128B 이하, gzip 증가는 원본 크기 + 128B 이하로 제한합니다. 현재 310B `heart.svg` 기준 budget은 raw 544B / gzip 438B이며, 측정값은 raw 442B / gzip 332B입니다.

Package exports는 다음 경로를 제공합니다.

| 경로 | 산출물 |
|---|---|
| `@libitums/design-tokens` | ESM 상수와 TypeScript 선언 |
| `@libitums/design-tokens/css/variables.css` | 기본 token CSS 변수 |
| `@libitums/design-tokens/css/typography.css` | Typography CSS 변수 |
| `@libitums/icons/{name}` | 기본 padding SVG 정적 에셋 |
| `@libitums/icons/no-padding/{name}` | no-padding SVG 정적 에셋 |
| `@libitums/icons/manifest.json` | 아이콘 이름·category·variant 경로 metadata |

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
