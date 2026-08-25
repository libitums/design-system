import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { prepareOutputLayout } from "../src/pipeline-layout.mjs";

const rootDirectory = fileURLToPath(new URL("..", import.meta.url));
const outputPaths = await prepareOutputLayout(rootDirectory);

console.log("Prepared generated package directories:");
for (const outputPath of outputPaths) {
  console.log(`- ${relative(rootDirectory, outputPath)}`);
}
