import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  SvgIconValidationError,
  validateSvgIcons,
} from "../src/svg-icon-validator.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

function svg({
  child = '<path d="M0 0"/>',
  fill = "currentColor",
  viewBox = "0 0 10 10",
} = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="${fill}" viewBox="${viewBox}">${child}</svg>`;
}

async function createWorkspace(t, files) {
  const rootDirectory = await mkdtemp(join(tmpdir(), "libitum-svg-icon-"));
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));

  await mkdir(join(rootDirectory, "assets", "icons", "padding"), {
    recursive: true,
  });
  await mkdir(join(rootDirectory, "assets", "icons", "no-padding"), {
    recursive: true,
  });
  for (const [path, contents] of Object.entries(files)) {
    const filePath = join(rootDirectory, "assets", "icons", path);
    await mkdir(join(filePath, ".."), { recursive: true });
    await writeFile(filePath, contents, "utf8");
  }

  return rootDirectory;
}

test("현재 저장소의 SVG 아이콘 규칙과 변형 쌍을 검증한다", async () => {
  const result = await validateSvgIcons(repositoryRoot);

  assert.equal(result.fileCount, 1630);
  assert.equal(result.pairCount, 815);
  assert.equal(result.categoryCount, 12);
  assert.deepEqual(result.variantCounts, {
    "no-padding": 815,
    padding: 815,
  });
});

test("padding viewBox와 모든 변형의 currentColor fill을 검사한다", async (t) => {
  const rootDirectory = await createWorkspace(t, {
    "no-padding/1-test/child-fill.svg": svg({ viewBox: "1 1 8 8" }),
    "no-padding/1-test/invalid-viewbox.svg": svg({ viewBox: "0 0 0 10" }),
    "no-padding/1-test/root-fill.svg": svg({ viewBox: "1 1 8 8" }),
    "no-padding/1-test/viewbox.svg": svg({ viewBox: "1 1 8 8" }),
    "padding/1-test/child-fill.svg": svg({
      child: '<path fill="#000" d="M0 0"/>',
    }),
    "padding/1-test/invalid-viewbox.svg": svg(),
    "padding/1-test/root-fill.svg": svg({ fill: "#fff" }),
    "padding/1-test/viewbox.svg": svg({ viewBox: "0 0 12 12" }),
  });

  await assert.rejects(
    () => validateSvgIcons(rootDirectory),
    (error) => {
      assert.equal(error instanceof SvgIconValidationError, true);
      assert.deepEqual(
        error.errors.map(({ code, file }) => ({ code, file })),
        [
          {
            code: "viewbox",
            file: "assets/icons/no-padding/1-test/invalid-viewbox.svg",
          },
          {
            code: "fill",
            file: "assets/icons/padding/1-test/child-fill.svg",
          },
          {
            code: "fill",
            file: "assets/icons/padding/1-test/root-fill.svg",
          },
          {
            code: "viewbox",
            file: "assets/icons/padding/1-test/viewbox.svg",
          },
        ],
      );
      return true;
    },
  );
});

test("padding과 no-padding 상대 경로 쌍과 중복 파일명을 검사한다", async (t) => {
  const rootDirectory = await createWorkspace(t, {
    "no-padding/1-test/duplicate.svg": svg({ viewBox: "1 1 8 8" }),
    "no-padding/2-test/duplicate.svg": svg({ viewBox: "1 1 8 8" }),
    "padding/1-test/duplicate.svg": svg(),
    "padding/1-test/lonely.svg": svg(),
    "padding/2-test/duplicate.svg": svg(),
  });

  await assert.rejects(
    () => validateSvgIcons(rootDirectory),
    (error) => {
      assert.equal(error instanceof SvgIconValidationError, true);
      assert.deepEqual(
        error.errors.map(({ code, file }) => ({ code, file })),
        [
          {
            code: "duplicate-name",
            file: "assets/icons/no-padding",
          },
          {
            code: "missing-pair",
            file: "assets/icons/no-padding/1-test/lonely.svg",
          },
          { code: "duplicate-name", file: "assets/icons/padding" },
        ],
      );
      return true;
    },
  );
});

test("잘못된 XML과 지원하지 않는 SVG 구조를 파싱 오류로 구분한다", async (t) => {
  const rootDirectory = await createWorkspace(t, {
    "no-padding/1-test/malformed.svg": svg({ viewBox: "1 1 8 8" }),
    "no-padding/1-test/unsupported.svg": svg({ viewBox: "1 1 8 8" }),
    "padding/1-test/malformed.svg":
      '<svg fill="currentColor" viewBox="0 0 10 10"><path d="M0 0"/></svg',
    "padding/1-test/unsupported.svg": svg({ child: "<g/>" }),
  });

  await assert.rejects(
    () => validateSvgIcons(rootDirectory),
    (error) => {
      assert.equal(error instanceof SvgIconValidationError, true);
      assert.deepEqual(
        error.errors.map(({ code, file }) => ({ code, file })),
        [
          {
            code: "parse-error",
            file: "assets/icons/padding/1-test/malformed.svg",
          },
          {
            code: "parse-error",
            file: "assets/icons/padding/1-test/unsupported.svg",
          },
        ],
      );
      assert.match(error.message, /\[parse-error\]/);
      return true;
    },
  );
});
