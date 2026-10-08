# Changelog

이 저장소에서 생성하는 `@libitums/design-tokens`와 `@libitums/icons`의 주요 변경을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)를 따르며, version은 [Semantic Versioning](https://semver.org/)과 [release policy](./RELEASING.md)를 기준으로 판정합니다.

## [Unreleased]

### Added

- Motion token을 libitum 학습 흐름에 맞춰 확장했습니다. duration scale에 `d7` 400ms·`d8` 600ms·`d9` 1000ms를 더하고, 의미 token `motion.duration.reveal`(Typewriter 글자 간격)·`page`(화면 전환)·`reward`(학습 단위 완료·재화 획득)·`spinner`(Spinner 한 바퀴)와 크기 비율 token `motion.scale.pressed` 0.95·`enter` 0.96·`reward` 0.8을 추가했습니다. CSS 변수 `--libitum-motion-duration-*`·`--libitum-motion-scale-*`와 TypeScript `motion` export로 배포합니다. 원칙·분류·속성 규칙·컴포넌트 매핑·reduced motion 정책은 [Motion](./foundations/motion.md)에 정리했습니다.
- Gem 계열 색 token 3개를 추가했습니다. `brand.gem-surface` #E8FAFF는 배경 표면, `brand.gem-border` #AFEFFF는 테두리·구분선, `brand.gem-strong` #008FBD는 밝은 표면의 고대비 그래픽에 씁니다. CSS 변수 `--libitum-color-brand-gem-surface`·`-gem-border`·`-gem-strong`으로 배포합니다. `brand.gem-surface`와 `brand.gem-border`는 그래픽 기준 3:1에 미달하므로 승인된 시각 예외가 적용되는 표현에만 사용합니다.

### Changed

- BREAKING: `brand.gem-text`의 값을 `gray.900` alias(#2A3038)에서 #4B8B9E로 바꾸고, 역할을 Gem 지표의 수 텍스트에서 Gem 계열의 보조 텍스트·그래픽으로 바꿨습니다. 흰 배경과 3.828:1이므로 24px 미만의 일반 텍스트와 18.67px 미만의 Bold 텍스트에는 쓸 수 없습니다. `--libitum-color-brand-gem-text`를 작은 텍스트에 쓰던 곳은 `gray.900`으로 바꿔야 합니다. Stat Button의 Gem 수는 `gray.900`을 직접 사용합니다.

## [0.3.0] - 2026-09-29

### Added

- 원색 token `color.black` #000000을 추가했습니다. CSS 변수 `--libitum-color-black`과 TypeScript `color.black`으로 배포합니다. 제3자 브랜드 규정이 순수 검정을 요구할 때만 씁니다 — Apple Human Interface Guidelines의 Sign in with Apple 버튼 검정 스타일이 첫 사용처입니다. 제품 UI의 짙은 면과 전경색은 계속 `gray.900`·`gray.950`을 씁니다.
- 불투명도 token `opacity`를 추가했습니다. 기본값 `opacity.8`·`opacity.35`·`opacity.45`·`opacity.90`과 의미 token `opacity.scrim`·`opacity.disabled`·`opacity.surface`로 이루어지며, CSS 변수 `--libitum-opacity-*`와 TypeScript `opacity` export로 배포합니다. Scrim 45%, Disabled 아이콘 35%, 고정 바 그림자 8%, 그림 위 표면 90%처럼 여러 컴포넌트가 반복해 쓰던 값을 한 곳에서 관리합니다.
- 불투명도 token `opacity.16`과 의미 token `opacity.pressed-overlay`를 추가했습니다. 어두운 장면 위 Round Button Overlay 변형의 Pressed 배경(`white` 16%)에 씁니다.
- 보석·재화 지표 색 token `brand.gem` #00C3FF와 `brand.gem-text`(`gray.900` alias)를 추가했습니다. Stat Button의 Gem 아이콘과 수에 씁니다. 아이콘 색은 흰 배경과 2.049:1이므로 승인된 시각 예외로만 사용합니다.

### Changed

- Accent family `font.family.accent`의 첫 항목을 `Futura`에서 `Jost Variable`·`Jost`로 바꿨습니다. Futura는 Web·App 라이선스가 없어 플랫폼마다 Accent가 다르게 보였습니다. Jost는 SIL Open Font License 1.1로 Web·앱에 포함해 배포할 수 있으며, 버전 `3.710`과 배포처·checksum을 [Font Delivery](./foundations/font-delivery.md)에 고정했습니다. `--libitum-font-family-accent`와 `typography.accent.*`의 font-family 값이 바뀌므로 소비 프로젝트는 Jost 폰트 파일을 함께 제공해야 합니다.
- Brand Button의 Default·Pressed·Loading 배경을 `brand.primary` #F46B18, label·icon·Spinner를 `white` #FFFFFF로 정하고, 이 3.016:1 조합을 해당 상태에만 적용되는 명시적인 접근성 예외로 문서화했습니다. 검증에서는 WCAG AA 통과가 아닌 `approved-exception`으로 기록합니다.
- ReactLynx 아이콘 색 지정의 공식 경로를 `<svg current-color={...}>`로 정하고 소비 가이드와 `examples/lynx-consumer` fixture를 그 경로로 고쳤습니다. Lynx `<svg>`는 CSS `color`를 읽지 않고 `src`·`content`·`current-color` 세 prop만 받습니다. `current-color`는 CSS 선언이 아니라 속성이라 `var()`가 풀리지 않으므로, 색 값은 TypeScript token 상수에서 가져와야 합니다. 아이콘 색은 CSS 커스텀 프로퍼티만으로 지정할 수 없는 유일한 항목입니다. `withIconColor`는 XML에 색을 직접 넣어야 할 때의 경로로 남습니다. (LIB-215)

## [0.2.0] - 2026-09-01

### Fixed

- BREAKING: `css/variables.css`와 `css/typography.css`의 alias token을 `var()` 참조 대신 리터럴 값으로 내보냅니다. 값이 또 `var()`인 커스텀 프로퍼티는 ReactLynx 번들에서 해석되지 않아 선언이 통째로 버려집니다. 227개 변수 중 73개가 alias여서 `color.fg.*`, `layout.*`, `icon.size.*`와 typography의 `font-family`·`font-weight`가 host에서 적용되지 않았습니다. 변수 이름과 최종 값은 그대로이고 CSS만 소비하면 영향이 없지만, 생성된 CSS의 `var()` 참조에 의존해 값을 덮어쓰던 곳은 동작이 달라집니다. (LIB-214)

  > **정정 (2026-09-01)**: 이 항목은 원인을 *"Lynx가 `var()` 치환을 한 번만 하고 그 결과를 다시 파싱한다"* 고 적었습니다. **사실이 아닙니다.** 근거로 든 `CSSVariableHandler::ResolveCSSVariables`의 단일 치환은 use-site 치환이고, 커스텀 프로퍼티 map은 그 전에 `CSSValue::SubstituteAll`이 `CycleDetector`와 `max_depth` 10으로 **재귀 해석**합니다. 즉 엔진은 중첩을 지원합니다. 관측(1단계는 되고 2단계부터 안 됨)은 재확인했고 `engineVersion`을 3.2에서 3.9로 올려도 같았으므로 빌드 산출물 쪽 문제로 보이지만, **정확한 원인은 규명하지 못했습니다.** 평탄화라는 조치 자체는 유효합니다.

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
