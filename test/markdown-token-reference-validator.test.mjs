import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  MarkdownTokenReferenceValidationError,
  validateMarkdownTokenReferences,
} from "../src/markdown-token-reference-validator.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

async function createWorkspace(t, markdown) {
  const rootDirectory = await mkdtemp(join(tmpdir(), "libitum-markdown-token-"));
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));

  await cp(
    fileURLToPath(new URL("../foundations", import.meta.url)),
    join(rootDirectory, "foundations"),
    { recursive: true },
  );
  await mkdir(join(rootDirectory, "components", "nested"), { recursive: true });
  await writeFile(
    join(rootDirectory, "components", "nested", "example.md"),
    markdown,
    "utf8",
  );

  return rootDirectory;
}

test("현재 component 문서의 모든 token reference를 검증한다", async () => {
  const result = await validateMarkdownTokenReferences(repositoryRoot);

  assert.equal(result.fileCount, 10);
  assert.equal(result.tokenCount, 139);
  assert.equal(result.exceptionCount, 2);
  assert.equal(result.referenceCount > 100, true);
});

test("color 축약·wildcard·extension metadata와 명시적 예외를 구분한다", async (t) => {
  const rootDirectory = await createWorkspace(
    t,
    [
      "# Example",
      "",
      "- `brand.primary`",
      "- `white`",
      "- `typography.button.*`",
      "- `icon.$extensions.com.libitum.iconography.variants.padding`",
      "- 현재 대응 토큰 없음",
      "",
    ].join("\n"),
  );

  const result = await validateMarkdownTokenReferences(rootDirectory);

  assert.equal(result.referenceCount, 4);
  assert.equal(result.exceptionCount, 1);
  assert.equal(result.exceptions[0].file, "components/nested/example.md");
  assert.equal(result.exceptions[0].line, 7);
});

test("존재하지 않는 token을 파일·줄·열과 함께 실패 처리한다", async (t) => {
  const rootDirectory = await createWorkspace(
    t,
    ["# Example", "", "| 패딩 | `spacing.999` |", ""].join("\n"),
  );

  await assert.rejects(
    () => validateMarkdownTokenReferences(rootDirectory),
    (error) => {
      assert.equal(
        error instanceof MarkdownTokenReferenceValidationError,
        true,
      );
      assert.equal(error.errors.length, 1);
      assert.deepEqual(error.errors[0], {
        column: 9,
        file: "components/nested/example.md",
        line: 3,
        raw: "spacing.999",
      });
      assert.match(
        error.message,
        /components\/nested\/example\.md:3:9.*spacing\.999/,
      );
      return true;
    },
  );
});

test("하위 token이 없는 wildcard를 실패 처리한다", async (t) => {
  const rootDirectory = await createWorkspace(
    t,
    "`typography.missing.*`\n",
  );

  await assert.rejects(
    () => validateMarkdownTokenReferences(rootDirectory),
    /token reference does not exist: typography\.missing\.\*/,
  );
});
