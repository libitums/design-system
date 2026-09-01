import { color, icon } from "@libitums/design-tokens";
import { withIconColor } from "@libitums/icons/lynx";
import heart from "@libitums/icons/lynx/heart";
import heartArtwork from "@libitums/icons/lynx/no-padding/heart";

import "@libitums/design-tokens/css/variables.css";
import "@libitums/design-tokens/css/typography.css";
import "./App.css";

// 색을 XML에 직접 박는 경로. `current-color`와 결과가 같습니다.
const brandHeart = withIconColor(heart, color.fg.brand);

export function App() {
  return (
    <view className="screen">
      <text className="screen__title">디자인 시스템 소비 fixture</text>

      {/* 기본 경로. `<svg>`는 CSS color를 읽지 않으므로 색은 속성으로 넘깁니다.
          속성에서는 var()가 풀리지 않아 값은 TypeScript token 상수를 씁니다. */}
      <view className="row">
        <svg
          className="icon icon--md"
          content={heart}
          current-color={color.fg.brand}
        />
        <text className="row__label">padding · current-color</text>
      </view>

      <view className="row">
        <svg className="icon icon--md" content={brandHeart} />
        <text className="row__label">padding · withIconColor</text>
      </view>

      <view className="row">
        <svg
          className="icon icon--lg"
          content={heartArtwork}
          current-color={color.fg.neutral}
        />
        <text className="row__label">no-padding · current-color</text>
      </view>

      <text className="screen__note">
        기본 렌더 크기 {icon.size.md} · 큰 크기 {icon.size.lg}
      </text>
    </view>
  );
}
