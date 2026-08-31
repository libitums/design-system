import { fileURLToPath } from "node:url";

import {
  exampleConsumerPolicy,
  verifyExampleConsumer,
} from "../src/example-consumer-verifier.mjs";

const rootDirectory = fileURLToPath(new URL("..", import.meta.url));
const result = await verifyExampleConsumer(rootDirectory);

console.log(
  `Verified ${exampleConsumerPolicy.directory} imports ${result.publicSpecifiers.length} public package paths only:`,
);
for (const specifier of result.publicSpecifiers) {
  console.log(`- ${specifier}`);
}
console.log(
  `Verified Rspeedy production build emits ${result.emittedFiles.length} file(s): ${result.emittedFiles
    .map((file) => `${file.path} (${file.rawBytes}B)`)
    .join(", ")}`,
);
console.log(
  "Verified build output inlines both icon variants and token values from the packages.",
);
