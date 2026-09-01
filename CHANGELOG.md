# Changelog

이 저장소에서 생성하는 `@libitums/design-tokens`와 `@libitums/icons`의 주요 변경을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)를 따르며, version은 [Semantic Versioning](https://semver.org/)과 [release policy](./RELEASING.md)를 기준으로 판정합니다.

## [Unreleased]

### Changed

- ReactLynx 아이콘 색 지정의 공식 경로를 `<svg current-color={...}>`로 정하고 소비 가이드와 `examples/lynx-consumer` fixture를 그 경로로 고쳤습니다. Lynx `<svg>`는 CSS `color`를 읽지 않고 `src`·`content`·`current-color` 세 prop만 받습니다. `current-color`는 CSS 선언이 아니라 속성이라 `var()`가 풀리지 않으므로, 색 값은 TypeScript token 상수에서 가져와야 합니다. 아이콘 색은 CSS 커스텀 프로퍼티만으로 지정할 수 없는 유일한 항목입니다. `withIconColor`는 XML에 색을 직접 넣어야 할 때의 경로로 남습니다. (LIB-215)

## [0.2.0] - 2026-09-01

### Fixed

- BREAKING: `css/variables.css`와 `css/typography.css`의 alias token을 `var()` 참조 대신 리터럴 값으로 내보냅니다. Lynx는 `var()` 치환을 한 번만 하고 그 결과를 다시 파싱하므로, 값이 또 `var()`이면 선언을 통째로 버립니다. 227개 변수 중 73개가 alias여서 `color.fg.*`, `layout.*`, `icon.size.*`와 typography의 `font-family`·`font-weight`가 host에서 적용되지 않았습니다. 변수 이름과 최종 값은 그대로이고 CSS만 소비하면 영향이 없지만, 생성된 CSS의 `var()` 참조에 의존해 값을 덮어쓰던 곳은 동작이 달라집니다. (LIB-214)

## [0.1.0] - 2026-08-31

### Added

- 두 package의 lockstep SemVer, deprecation과 changelog 운영 정책을 정의했습니다. (LIB-128)
- GitHub Packages stable·canary 배포 workflow와 중복 version 차단·결과 기록을 추가했습니다. (LIB-129)
- Frontend package 인증·설치·token·icon 사용과 upgrade 가이드를 추가했습니다. (LIB-130)
- 아이콘 렌더 크기를 위한 CSS 변수 `--libitum-icon-size-xs~xl` 5개를 `css/variables.css`에 추가했습니다. (LIB-182)
- ReactLynx `<svg content>`용 아이콘 export `@libitums/icons/lynx/{name}`, `@libitums/icons/lynx/no-padding/{name}`과 `withIconColor` helper를 추가했습니다. (LIB-183)
- ReactLynx 소비 fixture `examples/lynx-consumer`와 `npm run check:example-consumer`를 추가했습니다. 두 package의 공개 export만 사용해 토큰·아이콘 연결을 Lynx·Web 두 production 번들에서 확인하며, dev server의 Web Platform 미리보기로 화면을 직접 볼 수 있습니다. (LIB-131)

### Changed

- BREAKING: GitHub Packages scope를 실제 조직 owner와 일치하는 `@libitums`로 변경했습니다. 아직 배포된 기존 package version은 없습니다. (LIB-180)
- 소비 가이드의 인증 설정을 registry 연결(저장소 `.npmrc`)과 인증(사용자 수준 설정·CI `NODE_AUTH_TOKEN`)으로 분리했습니다. pnpm v10.34.2·v11.5.3부터 저장소 `.npmrc`의 인증 환경 변수 치환이 무시되어 `401`이 발생합니다. (LIB-181)

### Fixed

- npm publish가 상대 package 경로를 GitHub repository shorthand로 잘못 해석하던 오류를 수정했습니다. (LIB-179)
