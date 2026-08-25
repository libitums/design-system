import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { writeCssVariables } from "../src/css-token-generator.mjs";
import { prepareOutputLayout } from "../src/pipeline-layout.mjs";
import { validateFoundationTokenAliases } from "../src/token-alias-validator.mjs";
import { validateFoundationTokenFiles } from "../src/token-schema-validator.mjs";
import { writeTypographyCss } from "../src/typography-css-generator.mjs";
import { writeTypeScriptTokens } from "../src/typescript-token-generator.mjs";

const rootDirectory = fileURLToPath(new URL("..", import.meta.url));
await validateFoundationTokenFiles(rootDirectory);
await validateFoundationTokenAliases(rootDirectory);
const outputPaths = await prepareOutputLayout(rootDirectory);
const cssResult = await writeCssVariables(rootDirectory);
const typographyResult = await writeTypographyCss(rootDirectory);
const typeScriptResult = await writeTypeScriptTokens(rootDirectory);

console.log("Prepared generated package directories:");
for (const outputPath of outputPaths) {
  console.log(`- ${relative(rootDirectory, outputPath)}`);
}
console.log(
  `Generated ${cssResult.variables.length} CSS variables: ${relative(rootDirectory, cssResult.outputFile)}`,
);
console.log(
  `Generated ${typographyResult.variables.length} typography CSS variables for ${typographyResult.styles.length} styles: ${relative(rootDirectory, typographyResult.outputFile)}`,
);
console.log(
  `Generated ${typeScriptResult.tokenCount} TypeScript tokens across ${typeScriptResult.exportNames.length} exports: ${relative(rootDirectory, typeScriptResult.outputFiles.module)}`,
);
