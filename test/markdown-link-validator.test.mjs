import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  MarkdownLinkValidationError,
  githubHeadingSlug,
  validateMarkdownLinks,
} from "../src/markdown-link-validator.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

async function createWorkspace(t, files) {
  const rootDirectory = await mkdtemp(join(tmpdir(), "libitum-markdown-link-"));
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));

  const defaults = {
    "AGENTS.md": "# Agent Guide\n",
    "CHANGELOG.md": "# Changelog\n",
    "README.md": "# Readme\n",
    "RELEASING.md": "# Release policy\n",
  };

  for (const [path, contents] of Object.entries({ ...defaults, ...files })) {
    const filePath = join(rootDirectory, path);
    await mkdir(join(filePath, ".."), { recursive: true });
    await writeFile(filePath, contents, "utf8");
  }
  await mkdir(join(rootDirectory, "foundations"), { recursive: true });
  await mkdir(join(rootDirectory, "components"), { recursive: true });

  return rootDirectory;
}

test("현재 저장소의 내부 링크·anchor와 허용된 외부 링크를 검증한다", async () => {
  const result = await validateMarkdownLinks(repositoryRoot);

  assert.equal(result.fileCount, 18);
  assert.equal(result.internalLinkCount > 30, true);
  assert.equal(result.externalLinkCount > 0, true);
  assert.equal(result.linkCount, result.internalLinkCount + result.externalLinkCount);
});

test("root release policy와 changelog의 링크도 검증한다", async (t) => {
  const rootDirectory = await createWorkspace(t, {
    "CHANGELOG.md": "[없는 변경 기록](./missing-changelog.md)\n",
    "RELEASING.md": "[없는 배포 정책](./missing-release-policy.md)\n",
  });

  await assert.rejects(
    () => validateMarkdownLinks(rootDirectory),
    (error) => {
      assert.equal(error instanceof MarkdownLinkValidationError, true);
      assert.deepEqual(
        error.errors.map(({ code, file }) => ({ code, file })),
        [
          { code: "missing-path", file: "CHANGELOG.md" },
          { code: "missing-path", file: "RELEASING.md" },
        ],
      );
      return true;
    },
  );
});

test("GitHub heading slug와 중복 heading anchor를 검증한다", async (t) => {
  assert.equal(githubHeadingSlug("체크리스트"), "체크리스트");
  assert.equal(githubHeadingSlug("Font family와 Adapter"), "font-family와-adapter");

  const rootDirectory = await createWorkspace(t, {
    "foundations/guide.md": [
      "# 기준",
      "",
      "## 반복 제목",
      "## 반복 제목",
      "",
      "[허용된 출처](https://example.com/reference)",
      "",
    ].join("\n"),
    "components/nested/example.md": [
      "# 현재 문서",
      "",
      "[같은 문서](#현재-문서)",
      "[기준](../../foundations/guide.md#기준)",
      "[중복](../../foundations/guide.md#반복-제목-1)",
      "[JSON](../../foundations/tokens.json)",
      "",
    ].join("\n"),
    "foundations/tokens.json": "{}\n",
  });

  const result = await validateMarkdownLinks(rootDirectory);
  assert.equal(result.internalLinkCount, 4);
  assert.equal(result.externalLinkCount, 1);
});

test("존재하지 않는 경로와 anchor를 파일·줄·열로 구분한다", async (t) => {
  const rootDirectory = await createWorkspace(t, {
    "README.md": [
      "# Readme",
      "",
      "[없는 경로](./missing.md)",
      "[없는 Anchor](./foundations/guide.md#없는-anchor)",
      "",
    ].join("\n"),
    "foundations/guide.md": "# 기준\n",
  });

  await assert.rejects(
    () => validateMarkdownLinks(rootDirectory),
    (error) => {
      assert.equal(error instanceof MarkdownLinkValidationError, true);
      assert.deepEqual(
        error.errors.map(({ code, file, line }) => ({ code, file, line })),
        [
          { code: "missing-path", file: "README.md", line: 3 },
          { code: "missing-anchor", file: "README.md", line: 4 },
        ],
      );
      assert.match(error.message, /README\.md:3:\d+ — \[missing-path\]/);
      assert.match(error.message, /README\.md:4:\d+ — \[missing-anchor\]/);
      return true;
    },
  );
});

test("링크 텍스트나 label과 destination이 같아도 실제 destination 열을 출력한다", async (t) => {
  const rootDirectory = await createWorkspace(t, {
    "README.md": ["[path](path)", "[path]: path", ""].join("\n"),
  });

  await assert.rejects(
    () => validateMarkdownLinks(rootDirectory),
    (error) => {
      assert.equal(error instanceof MarkdownLinkValidationError, true);
      assert.deepEqual(
        error.errors.map(({ code, column, line }) => ({ code, column, line })),
        [
          { code: "missing-path", column: 8, line: 1 },
          { code: "missing-path", column: 9, line: 2 },
        ],
      );
      return true;
    },
  );
});

test("component 외부 링크와 비HTTPS 링크를 정책 위반으로 구분한다", async (t) => {
  const rootDirectory = await createWorkspace(t, {
    "components/example.md":
      "[외부 스펙](https://example.com/spec)\n",
    "foundations/guide.md":
      "[안전하지 않은 출처](http://example.com/reference)\n",
  });

  await assert.rejects(
    () => validateMarkdownLinks(rootDirectory),
    (error) => {
      assert.equal(error instanceof MarkdownLinkValidationError, true);
      assert.deepEqual(
        error.errors.map(({ code, file }) => ({ code, file })),
        [
          { code: "external-policy", file: "foundations/guide.md" },
          { code: "external-policy", file: "components/example.md" },
        ],
      );
      return true;
    },
  );
});
