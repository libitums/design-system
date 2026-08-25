# libitum Design System

어학 학습 서비스 libitum의 디자인 시스템입니다. 코드 라이브러리가 아니라 **스펙 저장소**입니다 — 디자인 토큰(JSON), 컴포넌트·지침 문서(Markdown), 아이콘 에셋(SVG)으로 이루어져 있습니다.

```
foundations/   토큰과 원칙 — 모든 값의 출처
components/    컴포넌트 스펙
assets/icons/  아이콘 SVG 815개 × 2 변형
```

---

## Foundations

| 파일 | 내용 |
|---|---|
| `color.json` | 33색 — gray scale 12 (gray 11 + white), brand 6, feedback 9, background 3, border 3 |
| `typography.json` | 22 스타일 — accent / display / heading / body / caption / label / button / dialogue |
| `font-delivery.md` | Web·iOS·Android·ReactLynx 폰트 제공 · 라이선스 · fallback 정책 |
| `accessibility.md` | hit area · 대비 · 키보드 · focus · accessible semantics 기준 |
| `spacing.json` | Progressive primitive scale (0~96) · 컴팩트 내부 간격 2 / 6 |
| `stroke.json` | 선 두께 thin 1 / regular 1.5 / strong 2 |
| `layout.json` | 화면 여백 · 간격 3단계 · safe area |
| `radius.json` | sm 6 / md 12 / lg 16 / xl 24 / full |
| `elevation.json` | 쌓임 순서 · 표면 색 · 그림자 s1~s3 |
| `motion.json` | duration d1~d6 · easing 6종 · reduced motion |
| `iconography.json` | 아이콘 에셋 메타 · 크기 스케일 |
| `writing-tone.md` | UX 문구 13원칙 |
| `international-design.md` | 로케일 표기 · 번역 길이 대응 |

토큰은 [W3C Design Tokens 포맷](https://tr.designtokens.org/format/)을 따릅니다. Style Dictionary, Tokens Studio와 호환됩니다.

## Components

| 파일 | 내용 |
|---|---|
| `button.md` | Neutral / Brand / Outline / Subtle / Text 5종 |
| `round-button.md` | 아이콘 전용 Neutral / Brand 원형 버튼 |
| `bottom-navigator.md` | 하단 탭 바 |
| `bottom-sheet.md` | 바텀 시트 |
| `dialog.md` | 다이얼로그 |
| `header/` | progress-header · back-header |
| `indicator/` | page · status · step |

## Assets

`assets/icons/`에 SVG 815개가 12개 카테고리로 나뉘어 있고, 각각 두 변형이 있습니다.

- **`padding/`** — 고정 viewBox(`0 0 10 10`). 광학 크기가 일정해 UI에 쓰는 기본값입니다.
- **`no-padding/`** — 아이콘별로 잘라낸 viewBox. 프레임을 꽉 채워야 할 때만 씁니다.

모든 아이콘은 `fill="currentColor"`라 부모의 `color`를 상속합니다.

---

## 쓰는 법

**값을 직접 쓰지 마세요.** 색·간격·선 두께·폰트·모서리·그림자·모션은 모두 `foundations/`에 토큰으로 있습니다.

```
❌ padding: 15px            ❌ color: #F5F5F5
✅ padding: {spacing.16}    ✅ color: {color.gray.100}
```

컴포넌트를 구현할 때는 해당 스펙 문서를 먼저 읽으세요. 상태·사이즈·예외가 표로 정리되어 있습니다.

### AI 에이전트

`AGENTS.md`에 작업 규칙이 있습니다. 스킬은 Codex가 `.codex/skills/`, Claude Code가 `.claude/skills/`를 읽습니다.

| 스킬 | 언제 |
|---|---|
| `design-system` | UI 구현, 토큰 선택, 새 스펙 작성 |
| `writing-tone` | 사용자에게 보이는 한국어 문구 작성·수정 |

---

## 아직 없는 것

- **다크 모드** — `color.json`은 라이트 모드 단일 값입니다.
- **텍스트 의미 토큰** — `text.primary` 같은 층이 없어 컴포넌트가 `gray.*`를 직접 참조합니다.
- **Futura Webfont·App 라이선스** — 정확한 제품과 플랫폼별 라이선스가 확정되기 전에는 파일을 Web이나 앱에 배포하지 않습니다.
- **Focus 상태** — 어느 컴포넌트에도 정의되어 있지 않습니다.
- **컴포넌트** — Toast, Card, Text Field.
- **빌드 파이프라인** — 토큰 → CSS 변수 / TS 상수.
