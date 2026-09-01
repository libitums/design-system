import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { toCssVariableName } from "./css-token-generator.mjs";

export const typographyCssOutputPath =
  "packages/design-tokens/dist/css/typography.css";

export const typographyStyleProperties = Object.freeze([
  "fontFamily",
  "fontWeight",
  "fontSize",
  "lineHeight",
  "letterSpacing",
]);

const cssGenericFamilies = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
  "ui-rounded",
  "math",
  "emoji",
  "fangsong",
  "-apple-system",
  "BlinkMacSystemFont",
]);

const aliasPattern = /^\{([^{}]+)\}$/;

const hasOwn = (object, property) =>
  Object.prototype.hasOwnProperty.call(object, property);

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function quoteFontFamily(family) {
  if (cssGenericFamilies.has(family)) {
    return family;
  }

  return `"${family.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

export function serializeFontFamilyStack(value, tokenPath = "font.family") {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((family) => typeof family !== "string" || family.length === 0)
  ) {
    throw new Error(`${tokenPath} must contain a non-empty font family array`);
  }

  return value.map(quoteFontFamily).join(", ");
}

function collectPrimitiveTokens(document) {
  const primitives = [];

  for (const [groupName, expectedType] of [
    ["family", "fontFamily"],
    ["weight", "fontWeight"],
  ]) {
    const group = document.font?.[groupName];
    if (!isPlainObject(group)) {
      throw new Error(`font.${groupName} must be a token group`);
    }

    const inheritedType = group.$type;
    if (inheritedType !== expectedType) {
      throw new Error(`font.${groupName} must use ${expectedType}`);
    }

    for (const [name, token] of Object.entries(group)) {
      if (name.startsWith("$")) {
        continue;
      }
      if (!isPlainObject(token) || !hasOwn(token, "$value")) {
        throw new Error(`font.${groupName}.${name} must be a token`);
      }

      primitives.push({
        path: `font.${groupName}.${name}`,
        type: expectedType,
        value: token.$value,
      });
    }
  }

  return primitives;
}

function collectTypographyStyles(node, path = [], styles = []) {
  if (!isPlainObject(node)) {
    throw new Error(`typography.${path.join(".")} must be a token or group`);
  }

  if (hasOwn(node, "$value")) {
    if (!isPlainObject(node.$value)) {
      throw new Error(`typography.${path.join(".")} must contain an object`);
    }

    const properties = Object.keys(node.$value);
    const missing = typographyStyleProperties.filter(
      (property) => !properties.includes(property),
    );
    const unsupported = properties.filter(
      (property) => !typographyStyleProperties.includes(property),
    );

    if (missing.length > 0) {
      throw new Error(
        `typography.${path.join(".")} is missing ${missing.join(", ")}`,
      );
    }
    if (unsupported.length > 0) {
      throw new Error(
        `typography.${path.join(".")} has unsupported properties: ${unsupported.join(", ")}`,
      );
    }

    styles.push({
      path: `typography.${path.join(".")}`,
      value: node.$value,
    });
    return styles;
  }

  for (const [name, child] of Object.entries(node)) {
    if (!name.startsWith("$")) {
      collectTypographyStyles(child, [...path, name], styles);
    }
  }

  return styles;
}

function aliasTarget(value) {
  if (typeof value !== "string") {
    return undefined;
  }
  return aliasPattern.exec(value)?.[1];
}

// alias를 `var()` 참조로 내보내지 않고 primitive의 리터럴로 평탄화합니다.
// Lynx는 var() 치환을 한 번만 하므로 값이 또 var()이면 선언을 버립니다.
// primitive는 alias를 가질 수 없으므로 한 번의 조회로 끝납니다.
function serializeAlias(value, tokenPath, primitivesByPath) {
  const target = aliasTarget(value);
  if (target === undefined) {
    return undefined;
  }

  const primitive = primitivesByPath.get(target);
  if (primitive === undefined) {
    throw new Error(`${tokenPath} references an unexported token: ${target}`);
  }

  return serializePrimitive(primitive);
}

function serializePrimitive(token) {
  if (token.type === "fontFamily") {
    return serializeFontFamilyStack(token.value, token.path);
  }
  if (token.type === "fontWeight" && typeof token.value === "number") {
    return String(token.value);
  }
  throw new Error(`${token.path} has an unsupported ${token.type} value`);
}

function serializeStyleProperty(property, value, tokenPath, primitivesByPath) {
  const alias = serializeAlias(value, tokenPath, primitivesByPath);
  if (alias !== undefined) {
    return alias;
  }

  if (property === "fontFamily") {
    return serializeFontFamilyStack(value, tokenPath);
  }
  if (property === "fontWeight" && typeof value === "number") {
    return String(value);
  }
  if (
    ["fontSize", "lineHeight", "letterSpacing"].includes(property) &&
    typeof value === "string"
  ) {
    return value;
  }

  throw new Error(`${tokenPath} has a non-serializable value`);
}

export async function generateTypographyCss(rootDirectory = process.cwd()) {
  const inputFile = resolve(rootDirectory, "foundations", "typography.json");
  const document = JSON.parse(await readFile(inputFile, "utf8"));
  const primitives = collectPrimitiveTokens(document);
  const styles = collectTypographyStyles(document.typography);
  const primitivesByPath = new Map(
    primitives.map((primitive) => [primitive.path, primitive]),
  );

  const variables = primitives.map((primitive) => ({
    name: toCssVariableName(primitive.path),
    path: primitive.path,
    value: serializePrimitive(primitive),
  }));

  for (const style of styles) {
    for (const property of typographyStyleProperties) {
      const path = `${style.path}.${property}`;
      variables.push({
        name: toCssVariableName(path),
        path,
        value: serializeStyleProperty(
          property,
          style.value[property],
          path,
          primitivesByPath,
        ),
      });
    }
  }

  const names = new Set();
  for (const variable of variables) {
    if (names.has(variable.name)) {
      throw new Error(`Duplicate typography CSS variable: ${variable.name}`);
    }
    names.add(variable.name);
  }

  variables.sort((left, right) =>
    left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
  );

  const css = [
    "/* Generated from foundations/typography.json. Do not edit directly. */",
    "",
    ":root {",
    ...variables.map((variable) => `  ${variable.name}: ${variable.value};`),
    "}",
    "",
  ].join("\n");

  return { css, styles, variables };
}

export async function writeTypographyCss(rootDirectory = process.cwd()) {
  const result = await generateTypographyCss(rootDirectory);
  const outputFile = resolve(rootDirectory, typographyCssOutputPath);

  await mkdir(join(rootDirectory, "packages", "design-tokens", "dist", "css"), {
    recursive: true,
  });
  await writeFile(outputFile, result.css, "utf8");

  return {
    ...result,
    outputFile,
  };
}
