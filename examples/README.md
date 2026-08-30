# examples

design-system이 소유하는 private 소비 fixture와 Host입니다. 루트 workspace의 `examples/*`가 이 디렉터리를 가리킵니다.

## 책임

- 배포된 package를 실제 소비자와 같은 방식으로 설치·import해 동작을 확인합니다.
- 플랫폼별 렌더링 확인이 필요한 Host(예: iOS Simulator Host)도 이 디렉터리가 소유합니다.
- 검증에서 발견한 package 문제는 fixture에 우회 코드를 넣지 않고 design-system의 별도 이슈로 분리합니다.

## 규칙

- 이 디렉터리의 package는 반드시 `private: true`입니다. 배포하지 않습니다.
- 배포 allowlist에 `examples/`의 경로를 넣지 않습니다.
- package의 공개 `exports` 경로만 사용합니다. 비공개 경로나 생성 산출물의 내부 파일을 직접 참조하지 않습니다.
- 소비 저장소를 검증 목적으로 수정하지 않습니다. 검증은 이 디렉터리에서 완결합니다.

## 의존 방향

`foundations` · `components` · `assets` → `src` → `packages` → `examples`

`examples`는 의존 사슬의 끝입니다. `packages`가 `examples`에 의존할 수 없습니다.

전체 계약은 [저장소 README](../README.md#workspace-구조)를 따릅니다.
