import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  formatTokenSchemaError,
  validateFoundationTokenFiles,
  validateTokenFile,
} from "../src/token-schema-validator.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const fixtureDirectory = join(
  repositoryRoot,
  "test",
  "fixtures",
  "token-schema",
);

const fixturePath = (fileName) => join(fixtureDirectory, fileName);

test("모든 foundation token JSON을 검증한다", async () => {
  const result = await validateFoundationTokenFiles(repositoryRoot);
  const foundationFiles = (await readdir(join(repositoryRoot, "foundations")))
    .filter((fileName) => fileName.endsWith(".json"));

  assert.equal(result.fileCount, foundationFiles.length);
  assert.ok(result.tokenCount > 0);
});

test("group $type 상속과 $root token을 허용한다", async () => {
  const result = await validateTokenFile(fixturePath("valid.json"));

  assert.deepEqual(result.errors, []);
  assert.equal(result.tokenCount, 2);
});

test("type을 결정할 수 없는 token을 실패 처리한다", async () => {
  const result = await validateTokenFile(fixturePath("missing-type.json"));

  assert.equal(result.errors.length, 1);
  assert.equal(
    formatTokenSchemaError(result.errors[0]),
    "missing-type.json: color.brand.primary — token type is missing; add $type to the token or a parent group",
  );
});

test("$value가 없는 leaf를 실패 처리한다", async () => {
  const result = await validateTokenFile(fixturePath("missing-value.json"));

  assert.equal(result.errors.length, 1);
  assert.match(
    formatTokenSchemaError(result.errors[0]),
    /^missing-value\.json: color\.brand\.primary — .+\$value$/,
  );
});

test("token과 group이 섞인 node를 실패 처리한다", async () => {
  const result = await validateTokenFile(fixturePath("mixed-node.json"));

  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].path, "color.brand");
  assert.match(result.errors[0].message, /pressed/);
});

test("문자열이 아닌 $type을 파일과 경로로 보고한다", async () => {
  const result = await validateTokenFile(fixturePath("invalid-type.json"));

  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].file, "invalid-type.json");
  assert.equal(result.errors[0].path, "color");
  assert.equal(result.errors[0].message, "$type must be a non-empty string");
});

test("JSON parse 오류를 파일 단위로 보고한다", async () => {
  const result = await validateTokenFile(fixturePath("invalid-json.json"));

  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].file, "invalid-json.json");
  assert.equal(result.errors[0].path, "$");
  assert.match(result.errors[0].message, /^invalid JSON:/);
});
