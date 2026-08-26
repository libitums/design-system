import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPackages } from "../src/build-pipeline.mjs";

const rootDirectory = fileURLToPath(new URL("..", import.meta.url));
const result = await buildPackages(rootDirectory);

console.log("Prepared generated package directories:");
for (const outputPath of result.outputPaths) {
  console.log(`- ${relative(rootDirectory, outputPath)}`);
}
console.log(
  `Generated ${result.css.variables.length} CSS variables: ${relative(rootDirectory, result.css.outputFile)}`,
);
console.log(
  `Generated ${result.typography.variables.length} typography CSS variables for ${result.typography.styles.length} styles: ${relative(rootDirectory, result.typography.outputFile)}`,
);
console.log(
  `Generated ${result.typeScript.tokenCount} TypeScript tokens across ${result.typeScript.exportNames.length} exports: ${relative(rootDirectory, result.typeScript.outputFiles.module)}`,
);
console.log(
  `Generated ${result.icons.icons.length} individual icon exports (${result.icons.svgFileCount} SVG files): ${relative(rootDirectory, result.icons.outputDirectory)}`,
);
