import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  generateTypographyCss,
  serializeFontFamilyStack,
  typographyCssOutputPath,
  typographyStyleProperties,
  writeTypographyCss,
} from "../src/typography-css-generator.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

function variablesByPath(result) {
  return new Map(result.variables.map((variable) => [variable.path, variable]));
}

test("font family fallback stack을 CSS 문법으로 보존한다", () => {
  assert.equal(
    serializeFontFamilyStack([
      "Pretendard Variable",
      "-apple-system",
      "system-ui",
      "Helvetica Neue",
      "sans-serif",
    ]),
    '"Pretendard Variable", -apple-system, system-ui, "Helvetica Neue", sans-serif',
  );
});

test("22개 typography 스타일을 116개 CSS 변수로 생성한다", async () => {
  const result = await generateTypographyCss(repositoryRoot);
  const variables = variablesByPath(result);

  assert.equal(result.styles.length, 22);
  assert.equal(result.variables.length, 116);
  assert.equal(
    variables.get("font.family.default").value,
    '"Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, "Roboto", "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif',
  );
  assert.match(variables.get("font.family.accent").value, /^"Futura",/);
  assert.equal(variables.get("font.weight.extraBold").value, "800");
  assert.equal(
    variables.get("typography.accent.display.fontFamily").value,
    "var(--libitum-font-family-accent)",
  );
  assert.equal(
    variables.get("typography.accent.display.fontWeight").value,
    "var(--libitum-font-weight-bold)",
  );
  assert.equal(
    variables.get("typography.accent.display.fontSize").value,
    "34px",
  );
  assert.equal(
    variables.get("typography.accent.display.lineHeight").value,
    "41px",
  );
  assert.equal(
    variables.get("typography.accent.display.letterSpacing").value,
    "-1.4px",
  );
});

test("각 typography 스타일의 5개 속성과 alias를 빠짐없이 출력한다", async () => {
  const result = await generateTypographyCss(repositoryRoot);
  const paths = new Set(result.variables.map((variable) => variable.path));

  for (const style of result.styles) {
    for (const property of typographyStyleProperties) {
      assert.equal(paths.has(`${style.path}.${property}`), true);
    }
  }

  const names = new Set(result.variables.map((variable) => variable.name));
  for (const match of result.css.matchAll(/var\((--libitum-[^)]+)\)/g)) {
    assert.equal(names.has(match[1]), true, `Unresolved CSS alias: ${match[1]}`);
  }
});

test("결과 순서를 고정하고 font-face나 원격 font를 생성하지 않는다", async () => {
  const result = await generateTypographyCss(repositoryRoot);
  const names = result.variables.map((variable) => variable.name);

  assert.deepEqual(names, [...names].sort());
  assert.match(result.css, /^\/\* Generated from foundations\/typography\.json/);
  assert.match(result.css, /\n:root \{\n/);
  assert.doesNotMatch(result.css, /@font-face|url\(/);
  assert.match(result.css, /\n\}\n$/);
});

test("정해진 package import 경로에 typography CSS를 생성한다", async (t) => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "libitum-typography-css-"));
  t.after(() => rm(temporaryRoot, { recursive: true, force: true }));

  await cp(
    fileURLToPath(new URL("../foundations", import.meta.url)),
    join(temporaryRoot, "foundations"),
    { recursive: true },
  );

  const result = await writeTypographyCss(temporaryRoot);
  const output = await readFile(
    join(temporaryRoot, typographyCssOutputPath),
    "utf8",
  );

  assert.equal(result.outputFile, join(temporaryRoot, typographyCssOutputPath));
  assert.equal(output, result.css);
});
