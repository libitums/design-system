import { fileURLToPath } from "node:url";

import { verifyGeneratedOutputs } from "../src/generated-output-verifier.mjs";

const rootDirectory = fileURLToPath(new URL("..", import.meta.url));
const result = await verifyGeneratedOutputs(rootDirectory);

console.log(
  `Verified ${result.fileCount} generated files are byte-identical across consecutive builds.`,
);
console.log("Verified build creates no new uncommitted worktree changes.");
