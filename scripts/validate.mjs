import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { validateSourceLayout } from "../src/pipeline-layout.mjs";
import {
  MarkdownTokenReferenceValidationError,
  validateMarkdownTokenReferences,
} from "../src/markdown-token-reference-validator.mjs";
import {
  TokenAliasValidationError,
  validateFoundationTokenAliases,
} from "../src/token-alias-validator.mjs";
import {
  TokenSchemaValidationError,
  validateFoundationTokenFiles,
} from "../src/token-schema-validator.mjs";

const rootDirectory = fileURLToPath(new URL("..", import.meta.url));

try {
  const sourcePaths = await validateSourceLayout(rootDirectory);
  const tokenResult = await validateFoundationTokenFiles(rootDirectory);
  const aliasResult = await validateFoundationTokenAliases(rootDirectory);
  const markdownTokenResult =
    await validateMarkdownTokenReferences(rootDirectory);

  console.log("Validated source directories:");
  for (const sourcePath of sourcePaths) {
    console.log(`- ${relative(rootDirectory, sourcePath)}`);
  }
  console.log(
    `Validated ${tokenResult.fileCount} foundation token files (${tokenResult.tokenCount} tokens).`,
  );
  console.log(
    `Validated ${aliasResult.aliasCount} token aliases (${aliasResult.crossFileAliasCount} cross-file).`,
  );
  console.log(
    `Validated ${markdownTokenResult.referenceCount} Markdown token references across ${markdownTokenResult.fileCount} component files (${markdownTokenResult.exceptionCount} explicit exceptions).`,
  );
} catch (error) {
  if (
    error instanceof TokenSchemaValidationError ||
    error instanceof TokenAliasValidationError ||
    error instanceof MarkdownTokenReferenceValidationError
  ) {
    console.error(error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
