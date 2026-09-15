# Chat Bubble

대화의 한 발화를 짧은 텍스트로 보여주는 컴포넌트입니다. Incoming과 Outgoing의 방향, 세 가지 크기, Outgoing 전송 상태를 서로 독립적으로 조합합니다.

## 구조

```text
Message item
├── Speaker (선택, Bubble 바깥)
├── Content row
│   ├── Avatar (선택, Bubble 바깥)
│   └── Chat Bubble
│       └── Message
└── Meta row (선택, Bubble 바깥)
    ├── Timestamp (선택)
    ├── Delivery status (Outgoing만)
    └── Action (선택)
```

Chat Bubble 자체는 Message만 포함합니다. Speaker, Avatar, Timestamp, Delivery status, Action은 상위 Message item이 조합하며 Bubble의 padding이나 최대 너비에 포함하지 않습니다.

## 옵션

각 옵션은 독립적으로 조합합니다. 조합 전체를 별도 variant로 만들지 않습니다. Core 옵션은 Chat Bubble이, Composition 옵션은 상위 Message item이 소유합니다.

### Core 옵션

| 옵션 | 값 | 용도 |
|---|---|---|
| Direction | Incoming / Outgoing | 말한 주체와 정렬 방향 결정 |
| Size | S / M / L | 대화 밀도와 강조 수준 결정 |
| Delivery | Default / Sending / Sent / Read / Failed | Outgoing 메시지의 전송 상태 안내 |
| Content language | UI language / Learning language | Message의 언어 semantics 결정 |

### Composition 옵션

| 옵션 | 값 | 용도 |
|---|---|---|
| Speaker | None / Label | 여러 화자가 섞일 때 발화자 이름 제공 |
| Avatar | None / Avatar | 상위 Message item에서 발화자 식별 보조 |
| Timestamp | Off / On | 상위 Message item에서 보낸 시각 제공 |
| Action | None / Action | Failed 재전송처럼 메시지 단위 행동 제공 |

### 조합 규칙

- Incoming은 Delivery를 항상 Default로 사용합니다. 전송 상태는 Outgoing에만 적용합니다.
- Delivery가 Default면 Delivery status와 그 자리를 함께 제거합니다.
- Action은 Bubble 안에 넣지 않습니다. Failed에서 재전송이 필요하면 상위 Meta row에 `다시 보내기`를 둡니다.
- Speaker, Avatar, Timestamp는 메시지 이해에 필요할 때만 상위 Message item에 둡니다. 빈 slot으로 자리를 남기지 않습니다.
- 같은 화자가 연속해 말해도 Bubble의 모서리는 바꾸지 않습니다. 묶음은 간격으로만 표현합니다.
- 텍스트 이외의 이미지, 음성, 파일, 선택지, 카드형 콘텐츠는 Message에 넣지 않고 각각의 전용 메시지 컴포넌트로 분리합니다.

## 공통 스펙

| 항목 | 값 | 토큰 |
|---|---|---|
| 너비 | 콘텐츠에 맞게 줄어듦 | — |
| 최대 너비 | 280px 또는 부모가 제공하는 너비 중 작은 값 | — |
| 높이 | 콘텐츠와 padding에 맞게 늘어남 | — |
| 정렬 | Incoming은 시작 가장자리, Outgoing은 끝 가장자리 | — |
| Message 줄 수 | 제한 없음 | — |
| 줄바꿈 | 단어 경계를 우선하고 긴 URL·연속 문자열은 Bubble 안에서 줄바꿈 | — |
| 일반 모서리 | 12px | `radius.md` |
| 방향 모서리 | 0px, Incoming은 왼쪽 아래·Outgoing은 오른쪽 아래 | 현재 대응 토큰 없음 |
| 테두리 | 없음 | — |
| 그림자 | 없음 | — |

최대 너비는 기기 너비가 아니라 Message item의 실제 가용 너비를 기준으로 계산합니다. 글자 크기를 확대해도 높이를 고정하거나 Message를 말줄임하지 않습니다.

## Size

| Size | 값 | 토큰 |
|---|---|---|
| S | 좌우 12px·상하 8px, Pretendard Variable Medium 500, 12px / 18px / 0px | `spacing.12`, `spacing.8`, `typography.body.s` |
| M | 좌우 16px·상하 12px, Pretendard Variable Medium 500, 14px / 20px / 0px | `spacing.16`, `spacing.12`, `typography.body.m` |
| L | 좌우 20px·상하 16px, Pretendard Variable Medium 500, 16px / 24px / 0px | `spacing.20`, `spacing.16`, `typography.body.l` |

- S는 짧고 반복적인 응답처럼 밀도가 높은 대화에 사용합니다.
- M은 일반 대화의 기본값입니다.
- L은 스토리의 핵심 대사나 학습에서 강조해야 하는 짧은 발화에 사용합니다.
- 한 대화 흐름에서는 같은 목적의 메시지에 같은 Size를 사용합니다. 텍스트 길이에 따라 Size를 자동으로 바꾸지 않습니다.

## Direction

| Direction | 값 | 토큰 |
|---|---|---|
| Incoming | 시작 가장자리 정렬, 왼쪽 아래만 0px, 배경 `gray.100` #F7F8F9, Message `fg.neutral` #1A1C20 | `color.gray.100`, `color.fg.neutral` |
| Outgoing | 끝 가장자리 정렬, 오른쪽 아래만 0px, 배경 `brand.strong` #B94208, Message `fg.neutral-inverted` #FFFFFF | `color.brand.strong`, `color.fg.neutral-inverted` |

Direction은 색만으로 구분하지 않습니다. 정렬과 방향 모서리를 함께 사용하고, 보조 기술에는 실제 발화자 이름을 제공합니다.

## Meta row

Meta row는 Bubble과 같은 방향으로 정렬하고 Bubble 바깥에 둡니다.

| 항목 | 값 | 토큰 |
|---|---|---|
| Bubble ↔ Meta row 간격 | 4px | `spacing.4` |
| Meta row 내부 간격 | 8px | `spacing.8` |
| Timestamp·Delivery status 폰트 | Pretendard Variable Medium 500, 11px / 16px / 0.2px | `typography.caption` |
| Timestamp·기본 상태색 | `fg.neutral-muted` #555D6D | `color.fg.neutral-muted` |
| Failed 상태색 | `feedback.incorrect-text` #A62E34 | `color.feedback.incorrect-text` |

Timestamp와 Delivery status를 함께 쓰면 Timestamp를 먼저, Delivery status를 나중에 둡니다. 번역된 상태 문구가 길어지면 Meta row를 줄바꿈할 수 있지만 Bubble의 최대 너비를 넓히지 않습니다.

## 상태

Delivery는 Outgoing에만 적용합니다. Bubble의 배경과 Message 색은 상태가 바뀌어도 유지하고, Meta row의 상태 문구만 갱신합니다.

| 상태 | 값 | 토큰 |
|---|---|---|
| Default | 문구와 Meta row 자리를 제거하고 전송 상태를 따로 보여주지 않음 | — |
| Sending | `보내는 중…`, `fg.neutral-muted` #555D6D, 중복 전송을 막고 진행 중임을 알림 | `color.fg.neutral-muted` |
| Sent | `보냈어요`, `fg.neutral-muted` #555D6D, 서버가 메시지를 수신함 | `color.fg.neutral-muted` |
| Read | `읽었어요`, `fg.neutral-muted` #555D6D, 상대가 메시지를 읽음 | `color.fg.neutral-muted` |
| Failed | `보내지 못했어요`, `feedback.incorrect-text` #A62E34, 필요하면 Meta row에 `다시 보내기` Action 제공 | `color.feedback.incorrect-text` |

Sending → Sent → Read는 순방향으로 전환합니다. 전송에 실패하면 Failed로 전환하고, 재전송을 시작하면 Sending으로 돌아갑니다. 같은 메시지를 새 항목으로 추가하지 않습니다.

상태 색을 전환하면 `motion.duration.color` 150ms와 `motion.easing.easing`을 사용합니다. 위치·크기 animation은 사용하지 않으며, 동작 줄이기에서도 상태 문구는 즉시 갱신합니다.

## Message item 간격

| 관계 | 간격 | 토큰 |
|---|---|---|
| 같은 화자의 연속 메시지 | 4px | `spacing.4` |
| 화자가 바뀌는 메시지 | 16px | `spacing.16` |
| Speaker ↔ Bubble | 4px | `spacing.4` |

날짜 구분선, 읽지 않은 메시지 구분선처럼 대화 흐름을 나누는 요소는 Chat Bubble이 아니라 Message list가 소유합니다.

## 동작

| 입력·조건 | 결과 |
|---|---|
| Message가 추가됨 | 대화의 시간 순서에 맞춰 Message list에 추가 |
| Delivery가 바뀜 | 같은 Message item의 Meta row만 갱신 |
| `다시 보내기` 실행 | 기존 Message item을 Sending으로 바꾸고 재전송 |
| 긴 Message·큰 글자 | 최대 너비 안에서 여러 줄로 늘어나며 내용 전체 표시 |
| 링크가 포함됨 | 링크만 독립적인 interactive element로 동작 |

Bubble 전체를 버튼으로 만들지 않습니다. 링크나 Action이 있으면 해당 요소만 focus와 hit area를 가집니다. Action은 [Button](./button.md)의 적절한 변형을 사용하고 최소 48 × 48px hit area인 `spacing.48`을 확보합니다.

## 접근성

- **대화는 시간 순서대로 제공합니다.** 시각적 정렬을 위해 DOM·접근성 트리 순서를 뒤집지 않습니다.
- **발화자를 이름으로 알립니다.** Incoming·Outgoing 같은 구현 용어가 아니라 `말랑이: 오늘 하루는 어땠어?`처럼 Speaker와 Message가 이어서 읽히게 합니다.
- **전송 상태를 문구로 제공합니다.** Failed를 색만으로 구분하지 않고 Delivery status를 Message와 programmatically 연결합니다.
- **새 Message와 실패를 알립니다.** 실시간 대화 영역은 새 항목만 정중하게 announce하고, 화면 진입 시 과거 대화 전체를 다시 읽지 않습니다. Failed는 사용자가 재전송할 수 있도록 상태와 Action을 함께 알립니다.
- **학습 콘텐츠의 언어를 표시합니다.** Message가 학습 대상 언어이면 해당 텍스트에 올바른 `lang`을 지정하고 UI 상태 문구에는 UI locale을 유지합니다.
- **확대와 번역 길이를 허용합니다.** 글자 크기 확대, 긴 단어, RTL에서도 내용이 잘리지 않아야 합니다. Direction은 발신 주체의 의미이며 RTL에서 물리적 좌우가 아니라 논리적 시작·끝 가장자리를 따릅니다.
- **Action의 목적을 이름으로 제공합니다.** `재시도`보다 `다시 보내기`처럼 실행 결과를 알리고, keyboard와 보조 기술로도 실행할 수 있게 합니다.

## 사용 가이드

- **짧은 대화형 발화에 사용합니다.** 비주얼 노벨 대사, 캐릭터 메시지, 짧은 회화 학습 prompt에 적합합니다.
- **카드처럼 사용하지 않습니다.** 긴 지시문, 복잡한 선택지, 여러 영역으로 나뉜 정보는 별도 컴포넌트로 만듭니다.
- **꼬리 도형을 추가하지 않습니다.** 하나의 네모난 아래 모서리가 방향을 표현합니다.
- **전송 상태는 필요할 때만 표시합니다.** 모든 메시지에 `보냈어요`를 반복해 화면을 복잡하게 만들지 않습니다.
- **시간은 사용자가 대화 순서를 판단하는 데 필요할 때만 표시합니다.** 메시지마다 같은 날짜·시각을 반복하지 않습니다.
- **연속 발화는 간격으로 묶습니다.** 같은 화자라는 이유로 Bubble을 하나로 합치거나 Message 내용을 변경하지 않습니다.
- **메시지 문구는 원문을 유지합니다.** 학습 콘텐츠는 UX writing 대상으로 고치거나 번역하지 않습니다.

공통 색·폰트·간격·동작은 [Color](../foundations/color.json), [Typography](../foundations/typography.json), [Spacing](../foundations/spacing.json), [Radius](../foundations/radius.json), [Motion](../foundations/motion.json)을, 접근성과 언어 처리는 [Accessibility](../foundations/accessibility.md), [International Design](../foundations/international-design.md)을 참고합니다.
