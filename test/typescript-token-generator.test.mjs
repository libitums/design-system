import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import test from "node:test";

import {
  generateTypeScriptTokens,
  typeScriptTokenOutputPaths,
  writeTypeScriptTokens,
} from "../src/typescript-token-generator.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

async function createWorkspace(t) {
  const rootDirectory = await mkdtemp(join(tmpdir(), "libitum-ts-tokens-"));
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));

  await cp(
    fileURLToPath(new URL("../foundations", import.meta.url)),
    join(rootDirectory, "foundations"),
    { recursive: true },
  );
  await cp(
    fileURLToPath(new URL("../package.json", import.meta.url)),
    join(rootDirectory, "package.json"),
  );

  return rootDirectory;
}

test("모든 foundation token을 10개 최상위 export로 생성한다", async () => {
  const result = await generateTypeScriptTokens(repositoryRoot);

  assert.equal(result.tokenCount, 139);
  assert.deepEqual(result.exportNames, [
    "color",
    "elevation",
    "font",
    "icon",
    "layout",
    "motion",
    "radius",
    "spacing",
    "stroke",
    "typography",
  ]);
  assert.equal(result.tokens.color.brand.primary, "#F46B18");
  assert.equal(result.tokens.spacing[6], "6px");
  assert.equal(result.tokens.stroke.width.regular, "1.5px");
  assert.equal(result.tokens.icon.size.md, "24px");
});

test("단일 값과 복합 값 내부의 alias를 최종 값으로 해석한다", async () => {
  const result = await generateTypeScriptTokens(repositoryRoot);

  assert.equal(result.tokens.color.fg.brand, result.tokens.color.brand.strong);
  assert.equal(result.tokens.layout.screen["padding-x"], result.tokens.spacing[16]);
  assert.deepEqual(
    result.tokens.typography.heading.s.fontFamily,
    result.tokens.font.family.default,
  );
  assert.equal(
    result.tokens.typography.heading.s.fontWeight,
    result.tokens.font.weight.bold,
  );
  assert.equal(result.tokens.icon.size.md, result.tokens.spacing[24]);
  assert.doesNotMatch(result.module, /"\{[^{}]+\}"/);
});

test("literal readonly 선언과 package exports를 생성한다", async () => {
  const result = await generateTypeScriptTokens(repositoryRoot);
  const packageManifest = JSON.parse(result.packageManifest);

  assert.match(result.declarations, /export declare const color:/);
  assert.match(result.declarations, /readonly primary: "#F46B18";/);
  assert.match(result.declarations, /readonly "6": "6px";/);
  assert.match(result.declarations, /export declare const tokens:/);
  assert.doesNotMatch(result.declarations, /\bany\b|\bunknown\b/);

  assert.equal(packageManifest.name, "@libitum/design-tokens");
  assert.deepEqual(packageManifest.repository, {
    type: "git",
    url: "https://github.com/libitums/design-system.git",
  });
  assert.deepEqual(packageManifest.publishConfig, {
    access: "restricted",
    registry: "https://npm.pkg.github.com",
  });
  assert.deepEqual(packageManifest.exports["."], {
    types: "./index.d.ts",
    import: "./index.js",
    default: "./index.js",
  });
  assert.equal(
    packageManifest.exports["./css/variables.css"],
    "./css/variables.css",
  );
  assert.equal(
    packageManifest.exports["./css/typography.css"],
    "./css/typography.css",
  );
});

test("생성 package를 대표 import 문법으로 소비한다", async (t) => {
  const rootDirectory = await createWorkspace(t);
  const result = await writeTypeScriptTokens(rootDirectory);
  const packageDirectory = join(
    rootDirectory,
    "node_modules",
    "@libitum",
    "design-tokens",
  );
  await cp(join(rootDirectory, "dist", "design-tokens"), packageDirectory, {
    recursive: true,
  });

  const consumerFile = join(rootDirectory, "consumer.mjs");
  await writeFile(
    consumerFile,
    [
      'import { color, spacing, tokens, typography } from "@libitum/design-tokens";',
      "export const values = {",
      "  brand: color.brand.primary,",
      "  gap: spacing[16],",
      "  heading: typography.heading.s,",
      "  sameColorGroup: tokens.color === color,",
      "  deeplyFrozen: Object.isFrozen(color.brand),",
      "};",
      "",
    ].join("\n"),
    "utf8",
  );

  const consumer = await import(pathToFileURL(consumerFile).href);
  assert.deepEqual(consumer.values, {
    brand: "#F46B18",
    gap: "16px",
    heading: result.tokens.typography.heading.s,
    sameColorGroup: true,
    deeplyFrozen: true,
  });

  for (const path of Object.values(typeScriptTokenOutputPaths)) {
    const output = join(rootDirectory, path);
    assert.equal((await readFile(output, "utf8")).length > 0, true);
    assert.equal(dirname(output).startsWith(rootDirectory), true);
  }
});
