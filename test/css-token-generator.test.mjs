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

test("기본 foundation에서 CSS 변수 111개를 생성한다", async () => {
  const result = await generateCssVariables(repositoryRoot);
  const variables = variablesByPath(result);

  assert.equal(result.variables.length, 111);
  assert.equal(variables.get("color.brand.primary").value, "#F46B18");
  // color.fg.brand -> color.brand.strong -> color.brand.primary-pressed.
  // 2단계 alias도 끝까지 따라가 리터럴로 내려앉습니다.
  assert.equal(variables.get("color.fg.brand").value, "#B94208");
  assert.equal(variables.get("spacing.6").value, "6px");
  assert.equal(variables.get("layout.screen.padding-x").value, "16px");
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
});

// 값이 또 var()인 커스텀 프로퍼티는 ReactLynx 번들에서 해석되지 않아 선언이
// 통째로 버려집니다(host 확인). 내보내는 CSS에는 참조가 남으면 안 됩니다.
test("CSS 값에 var() 참조를 남기지 않는다", async () => {
  const result = await generateCssVariables(repositoryRoot);

  const referencing = result.variables.filter((variable) =>
    variable.value.includes("var("),
  );
  assert.deepEqual(
    referencing.map((variable) => variable.name),
    [],
    "alias가 리터럴로 평탄화되지 않았습니다",
  );
  assert.equal(result.css.includes("var("), false);
});

test("CSS export 범위 밖의 alias를 실패 처리한다", () => {
  const token = {
    path: "color.invalid",
    type: "color",
    value: "{font.family.default}",
  };

  assert.throws(
    () => serializeCssTokenValue(token, new Map([[token.path, token]])),
    /references a token outside the CSS export: font\.family\.default/,
  );
});

test("순환 alias를 실패 처리한다", () => {
  const first = { path: "color.a", type: "color", value: "{color.b}" };
  const second = { path: "color.b", type: "color", value: "{color.a}" };
  const tokensByPath = new Map([
    [first.path, first],
    [second.path, second],
  ]);

  assert.throws(
    () => serializeCssTokenValue(first, tokensByPath),
    /Circular token alias in the CSS export: color\.b -> color\.a -> color\.b/,
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

test("icon.size 전체 단계를 spacing 값으로 export한다", async () => {
  const result = await generateCssVariables(repositoryRoot);
  const variables = variablesByPath(result);

  assert.deepEqual(
    ["xs", "sm", "md", "lg", "xl"].map((step) => {
      const variable = variables.get(`icon.size.${step}`);
      return [variable.name, variable.value];
    }),
    [
      ["--libitum-icon-size-xs", "16px"],
      ["--libitum-icon-size-sm", "20px"],
      ["--libitum-icon-size-md", "24px"],
      ["--libitum-icon-size-lg", "32px"],
      ["--libitum-icon-size-xl", "40px"],
    ],
  );

  for (const step of ["xs", "sm", "md", "lg", "xl"]) {
    assert.match(
      result.css,
      new RegExp(`^  --libitum-icon-size-${step}: \\d+px;$`, "m"),
    );
  }

  assert.equal(variables.has("icon.source"), false);
  assert.equal(variables.has("icon.intrinsic.width"), false);
});
