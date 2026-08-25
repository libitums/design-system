import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  TokenAliasValidationError,
  formatTokenAliasError,
  validateFoundationTokenAliases,
} from "../src/token-alias-validator.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const fixtureRoot = join(repositoryRoot, "test", "fixtures", "token-alias");

const scenarioRoot = (scenario) => join(fixtureRoot, scenario);

test("모든 foundation token alias를 검증한다", async () => {
  const result = await validateFoundationTokenAliases(repositoryRoot);
  const foundationFiles = (await readdir(join(repositoryRoot, "foundations")))
    .filter((fileName) => fileName.endsWith(".json"));

  assert.equal(result.fileCount, foundationFiles.length);
  assert.ok(result.tokenCount > 0);
  assert.ok(result.aliasCount > 0);
  assert.ok(result.crossFileAliasCount > 0);
});

test("object와 array 내부의 파일 간 alias를 해석한다", async () => {
  const result = await validateFoundationTokenAliases(scenarioRoot("valid"));

  assert.equal(result.fileCount, 2);
  assert.equal(result.tokenCount, 3);
  assert.equal(result.aliasCount, 3);
  assert.equal(result.crossFileAliasCount, 3);
});

test("존재하지 않는 참조의 source 경로와 target을 출력한다", async () => {
  await assert.rejects(
    () => validateFoundationTokenAliases(scenarioRoot("missing")),
    (error) => {
      assert.ok(error instanceof TokenAliasValidationError);
      assert.equal(error.errors.length, 1);
      assert.equal(
        formatTokenAliasError(error.errors[0]),
        "foundations/color.json: typography.heading.$value.fontFamily — referenced token does not exist: font.family.missing",
      );
      return true;
    },
  );
});

test("여러 파일 사이의 순환 참조와 cycle chain을 출력한다", async () => {
  await assert.rejects(
    () => validateFoundationTokenAliases(scenarioRoot("cycle")),
    (error) => {
      assert.ok(error instanceof TokenAliasValidationError);
      assert.equal(error.errors.length, 1);
      assert.equal(
        formatTokenAliasError(error.errors[0]),
        "foundations/b.json: color.b.$value — circular alias reference: color.a -> color.b -> color.a",
      );
      return true;
    },
  );
});

test("여러 파일에 중복된 token path를 실패 처리한다", async () => {
  await assert.rejects(
    () => validateFoundationTokenAliases(scenarioRoot("duplicate")),
    (error) => {
      assert.ok(error instanceof TokenAliasValidationError);
      assert.equal(error.errors.length, 1);
      assert.equal(error.errors[0].file, "foundations/b.json");
      assert.equal(error.errors[0].path, "color.primary");
      assert.match(error.errors[0].message, /foundations\/a\.json/);
      return true;
    },
  );
});
