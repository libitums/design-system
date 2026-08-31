import { fileURLToPath } from "node:url";

import {
  iconBundlePolicy,
  verifyIconBundle,
} from "../src/icon-bundle-verifier.mjs";

const rootDirectory = fileURLToPath(new URL("..", import.meta.url));
const result = await verifyIconBundle(rootDirectory);

console.log(
  `Verified Rspeedy includes only @libitums/icons/${iconBundlePolicy.representativeIcon}.`,
);
console.log(
  `Verified raw bundle delta ${result.delta.rawBytes}B <= ${result.budgets.rawBytes}B.`,
);
console.log(
  `Verified gzip bundle delta ${result.delta.gzipBytes}B <= ${result.budgets.gzipBytes}B.`,
);
console.log(
  `Verified unused @libitums/icons/${iconBundlePolicy.unusedIcon} is excluded.`,
);
console.log(
  `Verified @libitums/icons/lynx/${iconBundlePolicy.representativeIcon} inlines SVG XML without asset modules.`,
);
