import { writeCssVariables } from "./css-token-generator.mjs";
import { writeIconPackage } from "./icon-package-generator.mjs";
import { prepareOutputLayout } from "./pipeline-layout.mjs";
import { validateFoundationTokenAliases } from "./token-alias-validator.mjs";
import { validateFoundationTokenFiles } from "./token-schema-validator.mjs";
import { writeTypographyCss } from "./typography-css-generator.mjs";
import { writeTypeScriptTokens } from "./typescript-token-generator.mjs";

export async function buildPackages(rootDirectory = process.cwd()) {
  const schemaValidation = await validateFoundationTokenFiles(rootDirectory);
  const aliasValidation = await validateFoundationTokenAliases(rootDirectory);
  const outputPaths = await prepareOutputLayout(rootDirectory);
  const css = await writeCssVariables(rootDirectory);
  const typography = await writeTypographyCss(rootDirectory);
  const typeScript = await writeTypeScriptTokens(rootDirectory);
  const icons = await writeIconPackage(rootDirectory);

  return {
    aliasValidation,
    css,
    icons,
    outputPaths,
    schemaValidation,
    typography,
    typeScript,
  };
}
