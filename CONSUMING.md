# Frontend package consumption

프론트엔드 프로젝트에서 `@libitums/design-tokens`와 `@libitums/icons`를 설치하고 사용하는 기준입니다. 두 package는 같은 version으로 함께 release하며, 이 저장소의 문서와 token을 source of truth로 사용합니다.

## 저장소 경계

플랫폼별 구현과 검증은 design system 저장소가 소유합니다. 소비 저장소가 할 일은 **package 설치와 공개된 설정 연결까지**입니다.

| 소유 | 내용 |
|---|---|
| design system 저장소 | 토큰·아이콘 생성, 플랫폼별 package, wrapper·adapter·alias·loader·plugin, 소비 fixture와 렌더링 확인 Host |
| 소비 저장소 | package 설치, registry 인증 설정, 공개된 alias·plugin을 build 설정에 연결, 화면 구현 |

소비 저장소에 아이콘 변환 코드, framework wrapper, loader나 우회 구현을 직접 만들지 않습니다. 필요한 구현이 package에 없으면 그 자체가 design system의 결함이므로 [token 요청 절차](#하드코딩과-token-요청)와 같은 방식으로 이슈를 만들고, 임시 구현으로 대체하지 않습니다.

## Registry와 접근 권한

두 package는 private GitHub Packages의 `@libitums` scope로 배포됩니다. **registry 연결은 저장소에 커밋하고, 인증은 저장소 밖 신뢰 위치에 둡니다.** pnpm이 요구하는 형태이며 npm에서도 그대로 동작하므로 package manager와 무관하게 이 분리를 사용합니다.

### 저장소에 커밋하는 것

소비 저장소의 `.npmrc`에는 scope와 registry 연결만 둡니다.

```ini
@libitums:registry=https://npm.pkg.github.com
```

`_authToken`을 비롯한 인증 항목은 값이든 `${NODE_AUTH_TOKEN}` 참조든 이 파일에 넣지 않습니다. Token 값은 `.npmrc`, `.env`, source code, 문서 예시 어디에도 커밋하지 않습니다.

### pnpm이 project 인증 설정을 무시하는 형태

pnpm은 v10.34.2·v11.5.3부터 **저장소가 통제하는 `.npmrc`에서 환경 변수를 치환하지 않습니다.** 악의적인 저장소가 CI token을 공격자 registry로 흘리는 것을 막기 위한 조치입니다. 적용 대상은 registry·proxy URL, `//`로 시작하는 URL scope key, 그리고 `_authToken`·`_auth`·`_password`·`username`·`tokenHelper`·`cert`·`key`입니다.

project `.npmrc`에 아래 줄을 두면 치환되지 않고 경고와 함께 통째로 무시됩니다.

```ini
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```
 WARN  Ignored project-level auth setting
```

인증 없이 요청이 나가므로 private package에 대해 `401`이 됩니다. Token이 정상인데 실패하는 형태라 재발급으로는 해결되지 않습니다. npm은 같은 줄을 치환하므로 npm으로만 확인하면 이 실패를 만나지 못합니다.

pnpm이 신뢰하는 위치는 사용자 인증 파일(`~/.npmrc`, `<pnpm config>/auth.ini`)과 환경 설정입니다. 인증은 이 중 한 곳에 둡니다.

### 로컬

GitHub Packages `read:packages` 권한이 있는 개인 token을 사용자 수준 설정에 기록합니다. 저장소 파일은 건드리지 않습니다.

```sh
pnpm config set "//npm.pkg.github.com/:_authToken" "$GITHUB_PACKAGES_TOKEN"
```

npm을 쓰면 같은 key를 같은 위치에 기록합니다.

```sh
npm config set "//npm.pkg.github.com/:_authToken" "$GITHUB_PACKAGES_TOKEN"
```

`~/.npmrc`를 직접 편집한다면 `${NODE_AUTH_TOKEN}` 참조를 그대로 써도 됩니다. 사용자 수준 파일은 신뢰 위치라 치환이 동작합니다.

### CI

GitHub Actions는 장기 개인 token 대신 workflow의 `GITHUB_TOKEN`과 `packages: read`를 사용합니다. `actions/setup-node`의 `registry-url`이 **사용자 수준** `.npmrc`를 작성하므로 `NODE_AUTH_TOKEN` 경로는 pnpm에서도 그대로 동작합니다. 저장소 `.npmrc`에 인증을 넣을 이유가 없습니다.

```yaml
permissions:
  contents: read
  packages: read

steps:
  - uses: actions/checkout@v6
  - uses: pnpm/action-setup@v4
  - uses: actions/setup-node@v6
    with:
      node-version-file: .node-version
      cache: pnpm
      registry-url: https://npm.pkg.github.com
      scope: '@libitums'
  - run: pnpm install --frozen-lockfile
    env:
      NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

npm을 쓰면 `pnpm/action-setup` 단계 없이 `cache: npm`과 `npm ci`로 바꾸고 나머지는 같습니다.

첫 package 배포 후 package 설정에서 소비 저장소에 Actions read access가 부여되어 있어야 합니다.

저장소 `.npmrc`를 신뢰 대상으로 지정하는 `npmrcAuthFile`(`PNPM_CONFIG_NPMRC_AUTH_FILE`)은 사용하지 않습니다. 위 두 경로로 이미 해결되고, 신뢰 범위를 넓히면 이 변경이 막으려던 문제가 그대로 돌아옵니다.

### 실패 확인 순서

`401`, `403`, `404`가 발생하면 package 이름을 바꾸거나 public registry로 우회하지 않습니다.

1. project `.npmrc`에 `_authToken`이 남아 있지 않은지, 인증이 신뢰 위치에 있는지
2. Token scope에 `read:packages`가 있는지
3. Package 설정에 소비 저장소 접근 권한이 있는지
4. `.npmrc`의 scope 표기가 `@libitums`인지

## 설치

두 package는 같은 version을 정확히 고정합니다. pre-1.0에서는 호환 가능한 추가와 breaking 변경이 모두 Minor일 수 있으므로 `^`나 `~` 범위를 사용하지 않습니다.

첫 stable release는 [release policy](./RELEASING.md#100-이전)에 따라 `0.1.0`입니다. 아래 명령은 해당 version이 GitHub Packages에 배포된 뒤 실행합니다.

```sh
DESIGN_SYSTEM_VERSION=0.1.0
npm install --save-exact \
  "@libitums/design-tokens@${DESIGN_SYSTEM_VERSION}" \
  "@libitums/icons@${DESIGN_SYSTEM_VERSION}"
```

`package.json`에는 두 dependency가 같은 exact version으로 기록되어야 합니다.

```json
{
  "dependencies": {
    "@libitums/design-tokens": "0.1.0",
    "@libitums/icons": "0.1.0"
  }
}
```

Canary는 `Publish packages` workflow의 Job Summary에 기록된 두 package의 같은 prerelease version을 설치합니다. Canary version도 exact로 고정하고 stable dependency와 섞지 않습니다.

## CSS token

Web에서는 app의 global style 진입점에서 기본 token과 typography CSS를 한 번 불러옵니다.

```css
@import "@libitums/design-tokens/css/variables.css";
@import "@libitums/design-tokens/css/typography.css";
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
} from "@libitums/design-tokens";

export const lessonCardTokens = {
  backgroundColor: color.background.primary,
  color: color.fg.neutral,
  padding: spacing[16],
  borderRadius: radius.md,
  title: typography.heading.s,
} as const;
```

Web은 CSS token을 우선하고, TypeScript token은 JavaScript 계산이나 platform adapter처럼 CSS를 직접 사용할 수 없는 곳에 사용합니다. Native adapter는 `font.family.*` 배열의 Web용 font-family stack을 그대로 전달하지 않고 등록된 platform font로 연결합니다.

## Icon

아이콘은 필요한 이름의 subpath만 import합니다. 기본 경로는 고정 canvas의 padding variant이고, `no-padding`은 glyph가 frame을 끝까지 채워야 할 때만 사용합니다.

```ts
import heartIcon from "@libitums/icons/heart";
import heartArtwork from "@libitums/icons/no-padding/heart";

export const iconSources = { heartIcon, heartArtwork };
```

| Variant | 사용 | 사용하지 않는 경우 |
|---|---|---|
| `@libitums/icons/{name}` | Button, navigation, list, inline text처럼 grid에서 정렬하는 일반 UI | 없음 — 기본 선택 |
| `@libitums/icons/no-padding/{name}` | Hero art, spot illustration, custom crop처럼 frame을 정확히 채우는 구성 | 같은 행의 일반 UI 아이콘, padding variant와 혼합 |

- Import 결과는 SVG 정적 asset을 가리키는 `string`이며 framework wrapper는 포함하지 않습니다. 플랫폼 제약으로 이 형태를 직접 쓸 수 없으면 소비 저장소에서 변환하지 않고 design system이 제공하는 플랫폼 package를 사용합니다.
- 기본 렌더 크기는 `icon.size.md`이고, 다른 크기도 `icon.size.*` token만 사용합니다. CSS에서는 아래 변수를 쓰고 `spacing` 변수나 raw px로 대체하지 않습니다.

  | Token | CSS 변수 | 값 |
  |---|---|---|
  | `icon.size.xs` | `--libitum-icon-size-xs` | 16px |
  | `icon.size.sm` | `--libitum-icon-size-sm` | 20px |
  | `icon.size.md` | `--libitum-icon-size-md` | 24px |
  | `icon.size.lg` | `--libitum-icon-size-lg` | 32px |
  | `icon.size.xl` | `--libitum-icon-size-xl` | 40px |

  ```css
  .lesson-card__icon {
    width: var(--libitum-icon-size-md);
    height: var(--libitum-icon-size-md);
    color: var(--libitum-color-fg-neutral);
  }
  ```

- SVG의 `fill="currentColor"`를 직접 고치지 않고 platform renderer나 control의 color를 semantic color token에 연결합니다.
- 아이콘만 있는 control에는 행동 목적을 나타내는 accessible name을 붙입니다. 장식용 아이콘은 접근성 tree에서 숨깁니다.
- 전체 목록과 variant 경로는 `@libitums/icons/manifest.json`에서 탐색할 수 있습니다.

원본 이름·variant·크기 기준은 [Iconography](./foundations/iconography.json)를 따릅니다.

### ReactLynx

Lynx의 `<image>`는 SVG 형식을 지원하지 않습니다. SVG URL을 `<image>`에 넘기면 렌더링되지 않으므로, Lynx에서는 **SVG XML을 그대로 받는 `<svg>` 요소**와 전용 export를 사용합니다.

```jsx
import heart from "@libitums/icons/lynx/heart";
import heartArtwork from "@libitums/icons/lynx/no-padding/heart";

<svg
  content={heart}
  style={{
    width: "var(--libitum-icon-size-md)",
    height: "var(--libitum-icon-size-md)",
  }}
/>;
```

| 경로 | 결과 | 사용 |
|---|---|---|
| `@libitums/icons/lynx/{name}` | padding variant의 SVG XML `string` | 기본 선택 |
| `@libitums/icons/lynx/no-padding/{name}` | no-padding variant의 SVG XML `string` | frame을 정확히 채우는 구성 |
| `@libitums/icons/lynx` | `withIconColor` helper | XML에 색을 직접 넣을 때 |

variant 선택 기준은 Web과 같습니다. 이름도 같은 export 이름을 쓰므로 `@libitums/icons/heart`와 `@libitums/icons/lynx/heart`는 같은 아이콘입니다.

아이콘이 사용하는 `path`, `rect`, `ellipse`는 Lynx `<svg>`의 지원 태그에 포함됩니다. Lynx `<svg>`는 Lynx 3.7에서 추가되었으므로 host app의 engine 버전이 그보다 낮으면 이 경로를 사용할 수 없습니다.

#### 색 지정

**CSS `color`로는 아이콘 색을 지정할 수 없습니다.** Lynx `<svg>`는 `color` 프로퍼티를 읽지 않습니다. 받는 prop은 셋뿐입니다.

| prop | 값 |
|---|---|
| `content` | SVG XML `string` |
| `src` | SVG 리소스 URL |
| `current-color` | SVG 원본의 `currentColor`를 채울 색 |

SVG 원본은 `fill="currentColor"`를 유지하고, 색은 `current-color`로 넘깁니다.

```jsx
import { color } from "@libitums/design-tokens";
import heart from "@libitums/icons/lynx/heart";

<svg content={heart} current-color={color.fg.brand} />;
```

`current-color`는 CSS 선언이 아니라 **속성**이므로 `var(--libitum-*)`가 풀리지 않습니다. 색 값은 반드시 TypeScript token 상수에서 가져옵니다. 아이콘 색은 CSS 커스텀 프로퍼티만으로 지정할 수 없는 유일한 항목입니다.

```jsx
// 동작하지 않습니다. 속성에서는 var()가 해석되지 않습니다.
<svg content={heart} current-color="var(--libitum-color-fg-brand)" />;
// 동작하지 않습니다. `<svg>`는 CSS color를 읽지 않습니다.
<svg content={heart} style={{ color: "#F46B18" }} />;
```

색을 XML에 직접 박아야 하면 `withIconColor`를 씁니다. 결과는 같으므로 `current-color`를 기본으로 쓰고, XML 문자열 자체를 넘겨야 하는 경우에만 선택합니다.

```jsx
import { color } from "@libitums/design-tokens";
import { withIconColor } from "@libitums/icons/lynx";
import heart from "@libitums/icons/lynx/heart";

<svg content={withIconColor(heart, color.fg.brand)} />;
```

`withIconColor`는 XML의 `currentColor`만 치환하고 원본 문자열은 바꾸지 않습니다. 소비 저장소에서 SVG XML을 직접 문자열 조작하지 않습니다.

#### 설정 연결

소비 저장소가 할 일은 **package 설치와 ReactLynx plugin 연결까지**입니다. design system package는 alias·loader·전용 plugin을 추가로 요구하지 않습니다.

```js
// lynx.config.js
import { defineConfig } from "@lynx-js/rspeedy";
import { pluginReactLynx } from "@lynx-js/react-rsbuild-plugin";

export default defineConfig({
  plugins: [pluginReactLynx()],
});
```

Token CSS는 app의 진입 module에서 한 번 불러옵니다.

```jsx
import "@libitums/design-tokens/css/variables.css";
import "@libitums/design-tokens/css/typography.css";
```

이 연결이 실제로 동작하는 최소 구성은 design system 저장소의 [`examples/lynx-consumer`](./examples/lynx-consumer/README.md)에 있습니다. 두 아이콘 variant, `withIconColor`, token CSS 변수가 production build 산출물에 실제로 들어가는지를 `npm run check:example-consumer`가 매 PR에서 확인합니다. 소비 저장소에 같은 fixture를 만들 필요는 없습니다.

## Font

`@libitums/design-tokens`에는 font binary와 `@font-face`가 포함되지 않습니다. Web은 Pretendard WOFF2를 frontend static root에서 self-host하고, iOS·Android 앱은 `PretendardVariable.ttf`를 앱 package에 포함해 첫 화면 전에 등록합니다. ReactLynx는 native host에 포함된 같은 TTF를 사용합니다.

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
     "@libitums/design-tokens@${DESIGN_SYSTEM_VERSION}" \
     "@libitums/icons@${DESIGN_SYSTEM_VERSION}"
   ```

4. `package.json`과 lockfile을 함께 commit하고 두 package version이 같은지 확인합니다.
5. Type check, test, production build와 package manager의 clean install을 실행합니다.
6. Token·font·icon을 사용하는 대표 화면에서 시각 결과, icon 정렬, 접근성 글자 크기와 accessible name을 확인합니다.

Published version은 덮어쓰지 않습니다. 문제가 있으면 이전 exact version으로 되돌리거나 수정 release를 기다리며, registry package 내용을 직접 바꾸지 않습니다.

## 소비 체크리스트

- [ ] 저장소 `.npmrc`에는 registry 연결만 있고 인증 항목이 없음
- [ ] 인증이 사용자 수준 설정이나 CI의 `NODE_AUTH_TOKEN` 경로에 있음
- [ ] 두 package가 같은 exact version임
- [ ] CSS 또는 TypeScript token을 사용하고 raw 시각 값이 없음
- [ ] Icon variant와 accessible name이 목적에 맞음
- [ ] Platform font asset·fallback 정책을 적용함
- [ ] Changelog와 representative screen을 확인함
