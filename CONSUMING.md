# Frontend package consumption

프론트엔드 프로젝트에서 `@libitum/design-tokens`와 `@libitum/icons`를 설치하고 사용하는 기준입니다. 두 package는 같은 version으로 함께 release하며, 이 저장소의 문서와 token을 source of truth로 사용합니다.

## Registry와 접근 권한

두 package는 private GitHub Packages의 `@libitum` scope로 배포됩니다. 소비 저장소의 `.npmrc`에는 registry와 환경 변수 참조만 커밋합니다.

```ini
@libitum:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Token 값은 `.npmrc`, `.env`, source code에 커밋하지 않습니다.

- 로컬 개발은 GitHub Packages `read:packages` 권한이 있는 개인 token을 `NODE_AUTH_TOKEN`으로 제공합니다.
- GitHub Actions는 장기 개인 token 대신 해당 workflow의 `GITHUB_TOKEN`과 `packages: read`를 사용합니다.
- 첫 package 배포 후 package 설정에서 소비 저장소에 Actions read access가 부여되어 있어야 합니다.

```yaml
permissions:
  contents: read
  packages: read

steps:
  - uses: actions/checkout@v6
  - uses: actions/setup-node@v6
    with:
      node-version-file: .node-version
      cache: npm
      registry-url: https://npm.pkg.github.com
      scope: '@libitum'
  - run: npm ci
    env:
      NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

`401`, `403`, `404`가 발생하면 package 이름을 바꾸거나 public registry로 우회하지 않습니다. Token scope, package의 소비 저장소 접근 권한과 `.npmrc` scope를 순서대로 확인합니다.

## 설치

두 package는 같은 version을 정확히 고정합니다. pre-1.0에서는 호환 가능한 추가와 breaking 변경이 모두 Minor일 수 있으므로 `^`나 `~` 범위를 사용하지 않습니다.

첫 stable release는 [release policy](./RELEASING.md#100-이전)에 따라 `0.1.0`입니다. 아래 명령은 해당 version이 GitHub Packages에 배포된 뒤 실행합니다.

```sh
DESIGN_SYSTEM_VERSION=0.1.0
npm install --save-exact \
  "@libitum/design-tokens@${DESIGN_SYSTEM_VERSION}" \
  "@libitum/icons@${DESIGN_SYSTEM_VERSION}"
```

`package.json`에는 두 dependency가 같은 exact version으로 기록되어야 합니다.

```json
{
  "dependencies": {
    "@libitum/design-tokens": "0.1.0",
    "@libitum/icons": "0.1.0"
  }
}
```

Canary는 `Publish packages` workflow의 Job Summary에 기록된 두 package의 같은 prerelease version을 설치합니다. Canary version도 exact로 고정하고 stable dependency와 섞지 않습니다.

## CSS token

Web에서는 app의 global style 진입점에서 기본 token과 typography CSS를 한 번 불러옵니다.

```css
@import "@libitum/design-tokens/css/variables.css";
@import "@libitum/design-tokens/css/typography.css";
```

Token path는 `--libitum-{token-path}` 형식의 CSS custom property로 제공됩니다. 컴포넌트 style에는 hex, px, shadow 값을 직접 쓰지 않고 목적에 맞는 semantic token을 연결합니다.

```css
.lesson-card {
  color: var(--libitum-color-fg-neutral);
  background: var(--libitum-color-background-primary);
  padding: var(--libitum-spacing-16);
  border-radius: var(--libitum-radius-md);
}

.lesson-card__title {
  font-family: var(--libitum-typography-heading-s-font-family);
  font-weight: var(--libitum-typography-heading-s-font-weight);
  font-size: var(--libitum-typography-heading-s-font-size);
  line-height: var(--libitum-typography-heading-s-line-height);
  letter-spacing: var(--libitum-typography-heading-s-letter-spacing);
}
```

밝은 표면의 일반 텍스트는 `color.fg.neutral-muted` 이상을 사용합니다. `color.fg.neutral-subtle`은 의미 있는 아이콘·UI 그래픽에, `color.fg.neutral-subtlest`는 장식·Disabled 표현에만 사용합니다. 상태는 색만으로 전달하지 않으며 전체 접근성 기준은 [Accessibility](./foundations/accessibility.md)를 따릅니다.

## TypeScript token

TypeScript에서는 필요한 최상위 group을 named export로 가져옵니다. 모든 값은 literal·readonly 타입이며 alias는 최종 값으로 해석됩니다.

```ts
import {
  color,
  radius,
  spacing,
  typography,
} from "@libitum/design-tokens";

export const lessonCardTokens = {
  backgroundColor: color.background.primary,
  color: color.fg.neutral,
  padding: spacing[16],
  borderRadius: radius.md,
  title: typography.heading.s,
} as const;
```

Web은 CSS token을 우선하고, TypeScript token은 JavaScript 계산이나 platform adapter처럼 CSS를 직접 사용할 수 없는 곳에 사용합니다. Native adapter는 `font.family.*`의 CSS 전용 이름을 그대로 전달하지 않고 등록된 platform font로 연결합니다.

## Icon

아이콘은 필요한 이름의 subpath만 import합니다. 기본 경로는 고정 canvas의 padding variant이고, `no-padding`은 glyph가 frame을 끝까지 채워야 할 때만 사용합니다.

```ts
import heartIcon from "@libitum/icons/heart";
import heartArtwork from "@libitum/icons/no-padding/heart";

export const iconSources = { heartIcon, heartArtwork };
```

| Variant | 사용 | 사용하지 않는 경우 |
|---|---|---|
| `@libitum/icons/{name}` | Button, navigation, list, inline text처럼 grid에서 정렬하는 일반 UI | 없음 — 기본 선택 |
| `@libitum/icons/no-padding/{name}` | Hero art, spot illustration, custom crop처럼 frame을 정확히 채우는 구성 | 같은 행의 일반 UI 아이콘, padding variant와 혼합 |

- Import 결과는 SVG 정적 asset을 가리키는 `string`이며 framework wrapper는 포함하지 않습니다.
- 기본 렌더 크기는 `icon.size.md`이고, 다른 크기도 `icon.size.*` token만 사용합니다.
- SVG의 `fill="currentColor"`를 직접 고치지 않고 platform renderer나 control의 color를 semantic color token에 연결합니다.
- 아이콘만 있는 control에는 행동 목적을 나타내는 accessible name을 붙입니다. 장식용 아이콘은 접근성 tree에서 숨깁니다.
- 전체 목록과 variant 경로는 `@libitum/icons/manifest.json`에서 탐색할 수 있습니다.

원본 이름·variant·크기 기준은 [Iconography](./foundations/iconography.json)를 따릅니다.

## Font

`@libitum/design-tokens`에는 font binary와 `@font-face`가 포함되지 않습니다. Web은 Pretendard WOFF2를 frontend static root에서 self-host하고, iOS·Android 앱은 `PretendardVariable.ttf`를 앱 package에 포함해 첫 화면 전에 등록합니다. ReactLynx는 native host에 포함된 같은 TTF를 사용합니다.

Futura는 Webfont·App 라이선스와 파일 출처가 확정되기 전까지 새 파일이나 registration을 추가하지 않습니다. 전체 플랫폼 제공·fallback·라이선스 기준은 [Font Delivery](./foundations/font-delivery.md)를 따릅니다.

## 하드코딩과 token 요청

색·간격·타이포·선 두께·모서리·그림자·motion·icon 크기를 app code에 직접 쓰지 않습니다. 시각 값이 같아도 의미가 다른 token을 대신 사용하지 않습니다.

```text
❌ color: #1A1C20
❌ padding: 16px
❌ spacing[16]을 icon size나 다른 의미의 값으로 전용

✅ color.fg.neutral
✅ spacing[16]
✅ icon.size.md
```

필요한 token이 없으면 다음 순서로 요청합니다.

1. `foundations/`와 관련 `components/` 문서에서 같은 의미의 token이 있는지 확인합니다.
2. 없다면 Libitum team에 `[FE][Design-system]` 제목의 Linear issue를 생성합니다.
3. 사용 목적, platform·화면·component·state, 가장 가까운 기존 token을 사용할 수 없는 이유, 필요한 semantic 역할과 type, 영향 범위를 기록합니다.
4. Token이 승인·배포되기 전에는 raw 값이나 의미가 다른 token으로 구현을 확정하지 않습니다.
5. Design system package의 새 version이 배포되면 dependency를 올리고 해당 화면을 검증합니다.

원하는 hex나 px만 제시하지 않습니다. 먼저 목적과 의미를 정의하고 primitive 추가가 필요한지는 design system 변경에서 결정합니다.

## Version upgrade

두 package는 다음 순서로 함께 upgrade합니다.

1. [Changelog](./CHANGELOG.md)에서 현재 version부터 목표 version까지 `BREAKING`, `Deprecated`, `Removed`와 시각 변경을 확인합니다.
2. [Release policy](./RELEASING.md)의 공개 API와 migration 기준을 확인합니다.
3. 같은 exact version으로 두 dependency를 함께 갱신합니다.

   ```sh
   DESIGN_SYSTEM_VERSION=0.2.0
   npm install --save-exact \
     "@libitum/design-tokens@${DESIGN_SYSTEM_VERSION}" \
     "@libitum/icons@${DESIGN_SYSTEM_VERSION}"
   ```

4. `package.json`과 lockfile을 함께 commit하고 두 package version이 같은지 확인합니다.
5. Type check, test, production build와 package manager의 clean install을 실행합니다.
6. Token·font·icon을 사용하는 대표 화면에서 시각 결과, icon 정렬, 접근성 글자 크기와 accessible name을 확인합니다.

Published version은 덮어쓰지 않습니다. 문제가 있으면 이전 exact version으로 되돌리거나 수정 release를 기다리며, registry package 내용을 직접 바꾸지 않습니다.

## 소비 체크리스트

- [ ] `.npmrc`에는 registry와 `${NODE_AUTH_TOKEN}` 참조만 있음
- [ ] 두 package가 같은 exact version임
- [ ] CSS 또는 TypeScript token을 사용하고 raw 시각 값이 없음
- [ ] Icon variant와 accessible name이 목적에 맞음
- [ ] Platform font asset·fallback 정책을 적용함
- [ ] Changelog와 representative screen을 확인함
