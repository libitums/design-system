import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import {
  GeneratedOutputMismatchError,
  GeneratedWorktreeMutationError,
  assertGitWorktreeUnchanged,
  compareGeneratedSnapshots,
  verifyGeneratedOutputDeterminism,
} from "../src/generated-output-verifier.mjs";

const execFileAsync = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

test("연속 build의 파일 목록과 byte hash가 동일하다", async () => {
  const result = await verifyGeneratedOutputDeterminism(repositoryRoot);

  assert.equal(result.fileCount, 5);
  assert.deepEqual(result.files, [
    "design-tokens/css/typography.css",
    "design-tokens/css/variables.css",
    "design-tokens/index.d.ts",
    "design-tokens/index.js",
    "design-tokens/package.json",
  ]);
});

test("파일 누락과 내용 변경을 결정성 오류로 보고한다", () => {
  const first = new Map([
    ["index.js", "first-hash"],
    ["package.json", "same-hash"],
  ]);
  const second = new Map([
    ["index.js", "second-hash"],
    ["index.d.ts", "new-hash"],
    ["package.json", "same-hash"],
  ]);

  assert.throws(
    () => compareGeneratedSnapshots(first, second),
    (error) => {
      assert.equal(error instanceof GeneratedOutputMismatchError, true);
      assert.deepEqual(error.differences, [
        "only in second build: index.d.ts",
        "content changed: index.js",
      ]);
      return true;
    },
  );
});

test("build가 새 미커밋 변경을 만들면 실패한다", async (t) => {
  const rootDirectory = await mkdtemp(join(tmpdir(), "libitum-worktree-check-"));
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));
  await execFileAsync("git", ["init", "--quiet"], { cwd: rootDirectory });

  await assert.rejects(
    () =>
      assertGitWorktreeUnchanged(rootDirectory, () =>
        writeFile(join(rootDirectory, "generated.txt"), "generated\n", "utf8"),
      ),
    (error) => {
      assert.equal(error instanceof GeneratedWorktreeMutationError, true);
      assert.equal(error.before, "");
      assert.match(error.after, /\?\? generated\.txt/);
      return true;
    },
  );
});
