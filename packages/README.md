# packages

배포 가능한 플랫폼별 package의 경계입니다. 루트 workspace의 `packages/*`가 이 디렉터리를 가리킵니다.

## 책임

- 원본 스펙에서 생성한 산출물을 소비자가 설치할 수 있는 package 형태로 담습니다.
- 공개 API는 각 package의 `exports`로만 정의합니다.
- 플랫폼별 구현·alias·loader·plugin은 이 디렉터리의 package가 소유합니다. 소비 저장소에 같은 구현을 두지 않습니다.

## 규칙

- 이 디렉터리의 package는 `private: true`를 설정하지 않습니다.
- 배포 대상은 workspace 전체가 아니라 `src/package-publish-config.mjs`의 명시적 allowlist입니다. 이 디렉터리에 package를 추가해도 allowlist에 넣기 전에는 배포되지 않습니다.
- 두 배포 package는 하나의 version을 공유하며 함께 배포합니다.
- 생성 산출물은 직접 수정하지 않고 원본과 generator를 고친 뒤 다시 build합니다.

## 의존 방향

`foundations` · `components` · `assets` → `src` → `packages` → `examples`

`packages`는 원본과 도구에 의존할 수 있고, `examples`에 의존할 수 없습니다. 다른 package의 비공개 경로를 import하지 않고 공개 `exports` 경로만 사용합니다.

전체 계약은 [저장소 README](../README.md#workspace-구조)를 따릅니다.
