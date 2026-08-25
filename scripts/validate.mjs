import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { validateSourceLayout } from "../src/pipeline-layout.mjs";

const rootDirectory = fileURLToPath(new URL("..", import.meta.url));
const sourcePaths = await validateSourceLayout(rootDirectory);

console.log("Validated source directories:");
for (const sourcePath of sourcePaths) {
  console.log(`- ${relative(rootDirectory, sourcePath)}`);
}
