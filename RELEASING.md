# Release policy

`@libitums/design-tokens`와 `@libitums/icons`의 버전 판정, deprecation, changelog 작성과 release 준비 기준입니다.

## 적용 범위

이 정책은 이 저장소에서 생성하는 두 npm package에 적용합니다.

- `@libitums/design-tokens`
- `@libitums/icons`

두 package는 **하나의 버전을 공유하고 항상 함께 release**합니다. 한 package만 변경되어도 두 package의 버전을 같이 올립니다. 버전의 source of truth는 루트 `package.json`이며, `packages/*/package.json`의 `version`도 같은 값으로 유지합니다. 값이 어긋나면 `npm test`와 배포 준비 단계가 모두 실패합니다.

루트 private tooling package 자체는 배포하지 않습니다. `components/**/*.md`를 비롯한 저장소 문서는 package에 포함되지 않지만, 소비자가 알아야 할 변경은 changelog에 기록합니다.

## 공개 API

다음 항목을 package의 공개 API로 봅니다.

- Package 이름과 export 경로
- Token path, TypeScript export와 선언 타입
- CSS custom property 이름과 값의 자료형
- Icon export 이름, variant 경로와 SVG asset
- `manifest.json`의 공개 field와 구조
- 문서에 명시한 runtime 및 소비 방법

내부 generator, validation 구현과 build 중간 구조는 산출물의 공개 API가 같다면 공개 API가 아닙니다.

## 버전 판정

여러 변경이 한 release에 포함되면 가장 높은 수준을 적용합니다. 예를 들어 patch와 breaking 변경이 함께 있으면 breaking 기준으로 올립니다.

### 1.0.0 이상

| 변경 | 버전 | 기준 |
|---|---|---|
| Token·icon·export 삭제 | Major | 기존 import나 참조가 더 이상 동작하지 않음 |
| Token·icon·export 이름 또는 경로 변경 | Major | 호환 alias를 제공하더라도 기존 이름의 제거가 포함되면 breaking |
| Token의 type, 단위, 자료 구조 변경 | Major | 기존 consumer의 해석 방식이 달라짐 |
| Token의 의미나 역할 변경 | Major | 같은 이름이 더 이상 같은 의도를 나타내지 않음 |
| Package 이름, manifest 공개 구조 변경 | Major | 설치·탐색·import 계약이 달라짐 |
| 기존 항목을 Deprecated로 표시 | Minor | 기존 API는 유지하면서 대체 경로를 추가함 |
| 새 token, icon, export의 호환 가능한 추가 | Minor | 기존 consumer 변경 없이 새 기능을 선택할 수 있음 |
| 기존 의미·type을 유지한 token 값 조정 | Patch | 이름과 사용 목적은 같고 시각 값만 교정됨 |
| 기존 목적을 유지한 icon vector·metadata 교정 | Patch | export와 사용 의미는 같고 asset 오류나 표현만 교정됨 |
| 공개 API를 바꾸지 않는 generator·validation 오류 수정 | Patch | 산출물 계약을 유지한 bug fix |
| 문서·예시·오탈자만 수정 | 배포 없음 | package 산출물이 바뀌지 않음 |

값 변경이라도 token의 의미, type, 단위가 달라지거나 기존 사용처를 다른 역할로 바꾸게 하면 Patch가 아니라 Major입니다. 판단이 모호하면 더 높은 버전을 선택합니다.

### 1.0.0 이전

`0.y.z`는 초기 개발 단계로 취급합니다.

- 첫 공개 release는 `0.1.0`입니다.
- Breaking 변경은 Minor를 올리고 Patch를 0으로 초기화합니다.
- 호환 가능한 새 token·icon·export와 deprecation도 Minor를 올립니다.
- 기존 의미와 type을 유지한 값 조정, asset 교정, bug fix는 Patch를 올립니다.
- Breaking 변경은 changelog에 `BREAKING`으로 명시해 호환 가능한 Minor와 구분합니다.

실제 제품 consumer에서 package 설치·upgrade를 검증하고 공개 API가 안정됐다고 판단한 별도 release PR에서 `1.0.0` 전환을 결정합니다.

## Deprecation

공개 API는 가능한 한 바로 삭제하지 않고 다음 순서로 교체합니다.

1. 새 API를 먼저 추가하고 기존 API를 그대로 동작하게 유지합니다.
2. Changelog의 `Deprecated`에 기존 경로, 대체 경로와 전환 방법을 기록합니다.
3. TypeScript 선언이나 metadata에서 지원할 수 있으면 deprecated 표시를 함께 제공합니다.
4. Deprecated 안내가 포함된 normal Minor release를 최소 한 번 배포하고, 그 release date로부터 **30일 동안** 기존 API를 유지합니다.
5. 1.0.0 이상에서는 다음 Major에서, 1.0.0 이전에는 다음 Minor 이후에 제거합니다.
6. 제거 release의 `Removed`와 migration 안내에서 마지막 지원 버전을 명시합니다.

보안, 법적 요구 또는 package 사용을 불가능하게 하는 결함으로 기간을 지킬 수 없으면 예외 사유, 영향 범위, 대체 방법을 이슈와 changelog에 함께 기록합니다.

## Changelog

루트 [CHANGELOG.md](./CHANGELOG.md)는 두 package가 공유합니다. 형식은 Keep a Changelog의 `Unreleased` 방식과 다음 category를 사용합니다.

- `Added`: 호환 가능한 새 공개 기능
- `Changed`: 기존 동작이나 시각 결과의 호환 가능한 변경
- `Deprecated`: 제거 예정 API와 대체 경로
- `Removed`: 삭제된 공개 API
- `Fixed`: 오류 교정
- `Security`: 보안 관련 변경

Package 산출물이나 소비 방법에 영향을 주는 PR은 `Unreleased`에 consumer 관점의 항목을 추가합니다. 내부 구현만 바뀌고 공개 결과가 같으면 생략할 수 있습니다. 문서 변경은 package 배포를 요구하지 않지만 upgrade 판단에 필요하면 `Changed`에 기록합니다.

Git commit 목록을 그대로 changelog로 사용하지 않습니다. 각 항목에는 가능하면 관련 Linear issue나 Pull Request 번호를 적고, 구현 방식보다 consumer가 받는 영향을 설명합니다.

현재는 별도 changeset 도구나 Git log 자동 생성을 사용하지 않습니다. 변경 PR 작성자가 `Unreleased`를 직접 갱신하고, release PR에서 version별 section을 최신순으로 확정합니다.

## Release 흐름

1. `Unreleased` 항목을 검토하고 가장 높은 변경 수준을 결정합니다.
2. 루트 `package.json`, `package-lock.json`과 `packages/*/package.json`의 버전을 같은 값으로 올립니다.
3. Build 후 두 생성 package manifest가 같은 버전인지 확인합니다.
4. `Unreleased` 항목을 `## [x.y.z] - YYYY-MM-DD` 아래로 이동하고 빈 `Unreleased` section을 다시 만듭니다.
5. Release PR에서 validate, test, build, 생성물 결정성, icon bundle과 소비 fixture 검증을 모두 통과시킵니다.
6. Release PR이 `main`에 병합된 뒤 `Publish packages` workflow를 `stable` channel로 실행합니다.
7. Workflow는 실행 시점의 `main` HEAD와 version·changelog·package manifest를 다시 검증합니다.
8. 두 package를 `latest` dist-tag로 publish한 뒤 `vX.Y.Z` Git tag와 같은 버전의 GitHub Release를 남깁니다.

이미 배포한 version의 내용을 덮어쓰지 않습니다. 수정이 필요하면 반드시 새 version을 release합니다. 실제 registry 인증, stable·canary trigger와 중복 publish 차단은 npm 배포 workflow에서 구현합니다.

### 배포 channel

GitHub Actions의 `Publish packages` workflow는 수동 실행하며 `canary`와 `stable` 중 하나를 선택합니다. 동시에 두 배포가 실행되지 않도록 직렬화하고, PR에서 실행하는 검증과 같은 집합(source·test·build·생성물·icon bundle·소비 fixture)을 다시 통과한 산출물만 GitHub Packages에 올립니다.

- `stable`: 현재 `main` HEAD에서만 실행합니다. 루트의 stable SemVer와 날짜가 확정된 changelog section을 요구하고 `latest` dist-tag로 배포합니다. 개발용 `0.0.0`은 stable로 배포할 수 없습니다.
- `canary`: 선택한 branch나 commit에서 실행할 수 있습니다. 루트 version에 `-canary.<run number>.<short sha>`를 붙이고 `canary` dist-tag로 배포합니다. 배포 직전에 `packages/*/package.json`의 version만 이 prerelease version으로 바꾸며 루트 version은 수정하지 않습니다.

Workflow는 먼저 registry에서 두 package의 같은 version을 모두 조회합니다. 이미 존재하는 package에는 `npm publish`를 다시 실행하지 않고, 한 package만 성공한 부분 실패도 같은 workflow를 재실행해 나머지를 복구할 수 있습니다. 인증·권한 오류는 미배포 상태로 간주하지 않고 즉시 실패합니다.

배포 결과는 Actions Job Summary에 channel, dist-tag, version, 두 GitHub Packages URL과 package별 `published` 또는 `already-published` 상태로 남깁니다.

Canary에서 검증한 변경 내용은 정식 release 전까지 `Unreleased`에 유지하며 별도의 released section으로 옮기지 않습니다.

### Registry와 권한

두 package manifest의 `repository`와 `publishConfig`가 이 저장소와 `https://npm.pkg.github.com`을 가리킵니다. Workflow는 별도 장기 token을 저장하지 않고 해당 실행의 `GITHUB_TOKEN`과 `packages: write` 권한으로 private package를 배포합니다.

첫 배포 후 각 package의 GitHub Packages 설정에서 실제 consumer repository에 Actions read access를 부여합니다. 개발자가 로컬에서 설치할 때는 `read:packages` 권한이 있는 개인 token을 사용하며, token 값은 저장소에 커밋하지 않습니다. 구체적인 소비 설정은 프론트엔드 소비 가이드에서 관리합니다.

## 참고

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/)
