# Changelog

이 저장소에서 생성하는 `@libitums/design-tokens`와 `@libitums/icons`의 주요 변경을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)를 따르며, version은 [Semantic Versioning](https://semver.org/)과 [release policy](./RELEASING.md)를 기준으로 판정합니다.

## [Unreleased]

### Added

- 두 package의 lockstep SemVer, deprecation과 changelog 운영 정책을 정의했습니다. (LIB-128)
- GitHub Packages stable·canary 배포 workflow와 중복 version 차단·결과 기록을 추가했습니다. (LIB-129)
- Frontend package 인증·설치·token·icon 사용과 upgrade 가이드를 추가했습니다. (LIB-130)
- 아이콘 렌더 크기를 위한 CSS 변수 `--libitum-icon-size-xs~xl` 5개를 `css/variables.css`에 추가했습니다. (LIB-182)

### Changed

- BREAKING: GitHub Packages scope를 실제 조직 owner와 일치하는 `@libitums`로 변경했습니다. 아직 배포된 기존 package version은 없습니다. (LIB-180)

### Fixed

- npm publish가 상대 package 경로를 GitHub repository shorthand로 잘못 해석하던 오류를 수정했습니다. (LIB-179)
