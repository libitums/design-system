import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  cssOutputPath,
  generateCssVariables,
  serializeCssTokenValue,
  toCssVariableName,
  writeCssVariables,
} from "../src/css-token-generator.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

function variablesByPath(result) {
  return new Map(result.variables.map((variable) => [variable.path, variable]));
}

test("token path를 --libitum-* kebab-case 이름으로 변환한다", () => {
  assert.equal(
    toCssVariableName("color.brand.primary-pressed"),
    "--libitum-color-brand-primary-pressed",
  );
  assert.equal(
    toCssVariableName("motion.easing.enterExpressive"),
    "--libitum-motion-easing-enter-expressive",
  );
});

test("기본 foundation에서 CSS 변수 106개를 생성한다", async () => {
  const result = await generateCssVariables(repositoryRoot);
  const variables = variablesByPath(result);

  assert.equal(result.variables.length, 106);
  assert.equal(variables.get("color.brand.primary").value, "#F46B18");
  assert.equal(
    variables.get("color.fg.brand").value,
    "var(--libitum-color-brand-strong)",
  );
  assert.equal(variables.get("spacing.6").value, "6px");
  assert.equal(
    variables.get("layout.screen.padding-x").value,
    "var(--libitum-spacing-16)",
  );
  assert.equal(variables.get("stroke.width.regular").value, "1.5px");
  assert.equal(variables.get("elevation.z.dialog").value, "200");
  assert.equal(
    variables.get("elevation.shadow.s1").value,
    "0px 1px 4px 0px #1A1C2014",
  );
  assert.equal(
    variables.get("motion.easing.enter").value,
    "cubic-bezier(0, 0, 0.15, 1)",
  );
  assert.equal(variables.has("typography.heading.s"), false);
  assert.equal(variables.has("icon.size.md"), false);

  const names = new Set(result.variables.map((variable) => variable.name));
  for (const match of result.css.matchAll(/var\((--libitum-[^)]+)\)/g)) {
    assert.equal(names.has(match[1]), true, `Unresolved CSS alias: ${match[1]}`);
  }
});

test("CSS export 범위 밖의 alias를 실패 처리한다", () => {
  assert.throws(
    () =>
      serializeCssTokenValue(
        {
          path: "color.invalid",
          type: "color",
          value: "{font.family.default}",
        },
        new Set(["color.invalid"]),
      ),
    /references a token outside the CSS export: font\.family\.default/,
  );
});

test("CSS 변수 이름 순서를 고정하고 :root에 출력한다", async () => {
  const result = await generateCssVariables(repositoryRoot);
  const names = result.variables.map((variable) => variable.name);
  const sortedNames = [...names].sort();

  assert.deepEqual(names, sortedNames);
  assert.match(result.css, /^\/\* Generated from foundations\/\*\.json/);
  assert.match(result.css, /\n:root \{\n/);
  assert.match(result.css, /--libitum-stroke-width-strong: 2px;/);
  assert.match(result.css, /\n\}\n$/);
});

test("정해진 package import 경로에 CSS 파일을 생성한다", async (t) => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "libitum-css-tokens-"));
  t.after(() => rm(temporaryRoot, { recursive: true, force: true }));

  const foundationsSource = new URL("../foundations", import.meta.url);
  await cp(fileURLToPath(foundationsSource), join(temporaryRoot, "foundations"), {
    recursive: true,
  });

  const result = await writeCssVariables(temporaryRoot);
  const output = await readFile(join(temporaryRoot, cssOutputPath), "utf8");

  assert.equal(result.outputFile, join(temporaryRoot, cssOutputPath));
  assert.equal(output, result.css);
});
