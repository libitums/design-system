import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { writeCssVariables } from "../src/css-token-generator.mjs";
import { prepareOutputLayout } from "../src/pipeline-layout.mjs";
import { validateFoundationTokenAliases } from "../src/token-alias-validator.mjs";
import { validateFoundationTokenFiles } from "../src/token-schema-validator.mjs";

const rootDirectory = fileURLToPath(new URL("..", import.meta.url));
await validateFoundationTokenFiles(rootDirectory);
await validateFoundationTokenAliases(rootDirectory);
const outputPaths = await prepareOutputLayout(rootDirectory);
const cssResult = await writeCssVariables(rootDirectory);

console.log("Prepared generated package directories:");
for (const outputPath of outputPaths) {
  console.log(`- ${relative(rootDirectory, outputPath)}`);
}
console.log(
  `Generated ${cssResult.variables.length} CSS variables: ${relative(rootDirectory, cssResult.outputFile)}`,
);
