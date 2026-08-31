# lynx-consumer

design-system이 소유하는 ReactLynx 소비 fixture입니다. 배포 package를 실제 소비자와 같은 방식으로 import해 토큰·아이콘 연결이 끊기지 않았는지 확인합니다.

배포하지 않습니다. `private: true`이며 배포 allowlist에 넣지 않습니다.

## 확인하는 것

| 경로 | 확인 |
|---|---|
| `@libitums/design-tokens` | JavaScript token 값을 런타임에서 읽는다 |
| `@libitums/design-tokens/css/variables.css` | 기본 token CSS 변수가 산출물에 들어간다 |
| `@libitums/design-tokens/css/typography.css` | typography CSS 변수가 산출물에 들어간다 |
| `@libitums/icons/lynx/{name}` | padding variant의 SVG XML이 인라인된다 |
| `@libitums/icons/lynx/no-padding/{name}` | no-padding variant의 SVG XML이 인라인된다 |
| `@libitums/icons/lynx` | `withIconColor`가 token 색을 XML에 넣는다 |

`currentColor` 상속 여부가 host에서 확정되지 않았으므로 상속 경로와 `withIconColor` 경로를 함께 렌더합니다. 판정은 [LIB-187](https://linear.app/libitum/issue/LIB-187)에서 iOS Simulator Host로 수행합니다.

## 실행

저장소 루트에서 실행합니다. 두 package의 `dist/`가 먼저 있어야 하므로 build를 선행합니다.

```sh
npm run build
npm run dev --workspace @libitums/example-lynx-consumer
```

Production build와 산출물 검증은 루트 명령 하나로 끝납니다.

```sh
npm run check:example-consumer
```

이 명령은 package를 다시 생성하고, fixture가 공개 export 경로만 import하는지 확인하고, Rspeedy production build 산출물에 두 아이콘 variant의 XML과 token 값이 실제로 들어갔는지 확인합니다.

## FE 저장소가 할 일

FE는 이 fixture를 복사하지 않습니다. 아래 두 가지만 하면 됩니다.

1. 두 package를 같은 exact version으로 설치합니다. 인증 설정은 [소비 가이드](../../CONSUMING.md#registry와-접근-권한)를 따릅니다.
2. ReactLynx plugin을 build 설정에 연결합니다. design-system package는 alias·loader·plugin을 추가로 요구하지 않습니다.

```js
// lynx.config.js
import { defineConfig } from "@lynx-js/rspeedy";
import { pluginReactLynx } from "@lynx-js/react-rsbuild-plugin";

export default defineConfig({
  plugins: [pluginReactLynx()],
});
```

아이콘 변환 코드, framework wrapper, loader를 FE에 만들지 않습니다. 필요한 구현이 package에 없으면 [token 요청 절차](../../CONSUMING.md#하드코딩과-token-요청)와 같은 방식으로 이슈를 만듭니다.

## 규칙

- package의 공개 `exports` 경로만 사용합니다. `dist/` 안의 파일을 직접 참조하지 않습니다.
- 시각 값은 token CSS 변수나 JavaScript token만 사용합니다. raw hex·px를 쓰지 않습니다.
- 검증에서 발견한 package 문제는 이 fixture에 우회 코드를 넣지 않고 별도 이슈로 분리합니다.

전체 계약은 [`examples/README.md`](../README.md)를 따릅니다.
