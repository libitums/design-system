import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { generateIconPackage } from "../src/icon-package-generator.mjs";
import { generateTypeScriptTokens } from "../src/typescript-token-generator.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

test("소비 가이드가 실제 package export와 인증 설정을 사용한다", async () => {
  const [guide, tokenResult, iconResult] = await Promise.all([
    readFile(new URL("../CONSUMING.md", import.meta.url), "utf8"),
    generateTypeScriptTokens(repositoryRoot),
    generateIconPackage(repositoryRoot),
  ]);
  const tokenManifest = JSON.parse(tokenResult.packageManifest);
  const iconManifest = JSON.parse(iconResult.packageManifest);

  assert.match(guide, /@libitums:registry=https:\/\/npm\.pkg\.github\.com/);
  assert.match(guide, /_authToken=\$\{NODE_AUTH_TOKEN\}/);
  assert.match(guide, /--save-exact/);

  for (const path of [
    "@libitums/design-tokens",
    "@libitums/design-tokens/css/variables.css",
    "@libitums/design-tokens/css/typography.css",
    "@libitums/icons/heart",
    "@libitums/icons/no-padding/heart",
    "@libitums/icons/manifest.json",
  ]) {
    assert.equal(guide.includes(path), true, `Missing guide path: ${path}`);
  }

  assert.equal(tokenManifest.exports["."].import, "./index.js");
  assert.equal(
    tokenManifest.exports["./css/variables.css"],
    "./css/variables.css",
  );
  assert.equal(
    tokenManifest.exports["./css/typography.css"],
    "./css/typography.css",
  );
  assert.equal(iconManifest.exports["./heart"].default, "./heart.svg");
  assert.equal(
    iconManifest.exports["./no-padding/heart"].default,
    "./no-padding/heart.svg",
  );
  assert.equal(
    iconManifest.exports["./manifest.json"],
    "./manifest.json",
  );
});

test("소비 가이드가 token 요청과 lockstep upgrade 기준을 포함한다", async () => {
  const guide = await readFile(
    new URL("../CONSUMING.md", import.meta.url),
    "utf8",
  );

  assert.match(guide, /## 하드코딩과 token 요청/);
  assert.match(guide, /\[FE\]\[Design-system\]/);
  assert.match(guide, /raw 값이나 의미가 다른 token/);
  assert.match(guide, /spacing\[16\]/);
  assert.doesNotMatch(guide, /spacing\.16/);
  assert.match(guide, /## Version upgrade/);
  assert.match(guide, /같은 exact version/);
  assert.match(guide, /package\.json.*lockfile/);
  assert.match(guide, /Font Delivery/);
  assert.match(guide, /font\.family\.\*.*Web용 font-family stack/);
  assert.doesNotMatch(guide, /CSS 전용 이름/);
  assert.match(guide, /accessible name/);
});
