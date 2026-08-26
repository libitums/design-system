import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const textExtensions = new Set([
  "",
  ".css",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
]);
const legacyScope = new RegExp(
  ["@libi", "tum(?!s)"].join(""),
);

test("extensionless 설정과 legacy package scope 형태를 구분한다", () => {
  const legacyNamespace = ["@libi", "tum"].join("");

  assert.equal(textExtensions.has(extname(".npmrc")), true);
  assert.equal(legacyScope.test(legacyNamespace), true);
  assert.equal(legacyScope.test(`${legacyNamespace}:registry`), true);
  assert.equal(legacyScope.test(`${legacyNamespace}/icons`), true);
  assert.equal(legacyScope.test("@libitums/icons"), false);
});

test("tracked source가 실제 GitHub organization package scope만 사용한다", async () => {
  const { stdout } = await execFileAsync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    { encoding: "utf8" },
  );
  const matches = [];

  for (const path of stdout.split("\0").filter(Boolean)) {
    if (!textExtensions.has(extname(path))) {
      continue;
    }
    const content = await readFile(path, "utf8");
    if (legacyScope.test(content)) {
      matches.push(path);
    }
  }

  assert.deepEqual(matches, []);
});
