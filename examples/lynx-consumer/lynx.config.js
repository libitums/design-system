import { defineConfig } from "@lynx-js/rspeedy";
import { pluginReactLynx } from "@lynx-js/react-rsbuild-plugin";

// FE 저장소가 복사할 최소 연결 설정입니다. design-system package는
// alias·loader·plugin을 요구하지 않으므로 ReactLynx plugin만 연결합니다.
export default defineConfig({
  plugins: [pluginReactLynx()],
  source: {
    entry: {
      main: "./src/index.jsx",
    },
  },
});
