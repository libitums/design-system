import { color, icon } from "@libitums/design-tokens";
import { withIconColor } from "@libitums/icons/lynx";
import heart from "@libitums/icons/lynx/heart";
import heartArtwork from "@libitums/icons/lynx/no-padding/heart";

import "@libitums/design-tokens/css/variables.css";
import "@libitums/design-tokens/css/typography.css";
import "./App.css";

// currentColor 상속 여부가 host에서 확정되지 않아 두 경로를 함께 렌더합니다.
// 어느 쪽이 맞는지는 iOS Lynx host에서만 판정할 수 있습니다.
const brandHeart = withIconColor(heart, color.fg.brand);

export function App() {
  return (
    <view className="screen">
      <text className="screen__title">디자인 시스템 소비 fixture</text>

      <view className="row">
        <svg className="icon icon--md" content={heart} />
        <text className="row__label">padding · currentColor</text>
      </view>

      <view className="row">
        <svg className="icon icon--md" content={brandHeart} />
        <text className="row__label">padding · withIconColor</text>
      </view>

      <view className="row">
        <svg className="icon icon--lg" content={heartArtwork} />
        <text className="row__label">no-padding · currentColor</text>
      </view>

      <text className="screen__note">
        기본 렌더 크기 {icon.size.md} · 큰 크기 {icon.size.lg}
      </text>
    </view>
  );
}
