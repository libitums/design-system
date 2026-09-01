import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

export const cssTokenFiles = Object.freeze([
  "color.json",
  "spacing.json",
  "layout.json",
  "radius.json",
  "elevation.json",
  "motion.json",
  "stroke.json",
  "iconography.json",
]);

export const cssOutputPath =
  "packages/design-tokens/dist/css/variables.css";

const hasOwn = (object, property) =>
  Object.prototype.hasOwnProperty.call(object, property);

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isChildName = (name) => !name.startsWith("$") || name === "$root";

const aliasPattern = /^\{([^{}]+)\}$/;

function toKebabCase(segment) {
  return segment
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function toCssVariableName(tokenPath) {
  const name = tokenPath
    .split(".")
    .map(toKebabCase)
    .filter(Boolean)
    .join("-");

  if (name === "") {
    throw new Error(`Cannot create a CSS variable name from: ${tokenPath}`);
  }

  return `--libitum-${name}`;
}

function collectTokens(node, context) {
  const { inheritedType, path, tokens } = context;

  if (!isPlainObject(node)) {
    return;
  }

  const type = hasOwn(node, "$type") ? node.$type : inheritedType;
  if (hasOwn(node, "$value")) {
    tokens.push({
      path: path.join("."),
      type,
      value: node.$value,
    });
    return;
  }

  for (const [name, child] of Object.entries(node)) {
    if (isChildName(name)) {
      collectTokens(child, {
        inheritedType: type,
        path: [...path, name],
        tokens,
      });
    }
  }
}

function aliasTarget(value) {
  if (typeof value !== "string") {
    return undefined;
  }

  return aliasPattern.exec(value)?.[1];
}

// alias를 `var()` 참조로 내보내지 않고 리터럴까지 따라가 평탄화합니다.
// Lynx는 var() 치환을 한 번만 하고 그 결과를 다시 파싱하므로, 값이 또 var()이면
// 선언을 통째로 버립니다. 참조를 남기면 semantic token이 host에서 조용히 죽습니다.
function resolveAliasValue(value, context) {
  const visited = [];
  let current = value;

  for (
    let target = aliasTarget(current);
    target !== undefined;
    target = aliasTarget(current)
  ) {
    if (visited.includes(target)) {
      throw new Error(
        `Circular token alias in the CSS export: ${[...visited, target].join(" -> ")}`,
      );
    }
    visited.push(target);

    const token = context.tokensByPath.get(target);
    if (token === undefined) {
      throw new Error(
        `${context.tokenPath} references a token outside the CSS export: ${target}`,
      );
    }
    current = token.value;
  }

  return current;
}

function serializeReferenceOrRaw(value, context) {
  const resolved = resolveAliasValue(value, context);

  if (typeof resolved === "string" || typeof resolved === "number") {
    return String(resolved);
  }

  throw new Error(`${context.tokenPath} has a non-serializable CSS value`);
}

function serializeShadow(value, context) {
  if (!isPlainObject(value)) {
    throw new Error(`${context.tokenPath} must contain a shadow object`);
  }

  const requiredProperties = ["offsetX", "offsetY", "blur", "spread", "color"];
  for (const property of requiredProperties) {
    if (!hasOwn(value, property)) {
      throw new Error(`${context.tokenPath} shadow is missing ${property}`);
    }
  }

  return requiredProperties
    .map((property) =>
      serializeReferenceOrRaw(value[property], {
        ...context,
        tokenPath: `${context.tokenPath}.$value.${property}`,
      }),
    )
    .join(" ");
}

function serializeCubicBezier(value, context) {
  if (
    !Array.isArray(value) ||
    value.length !== 4 ||
    value.some((component) => typeof component !== "number")
  ) {
    throw new Error(`${context.tokenPath} must contain four numeric bezier values`);
  }

  return `cubic-bezier(${value.join(", ")})`;
}

export function serializeCssTokenValue(token, tokensByPath) {
  const context = {
    tokensByPath,
    tokenPath: token.path,
  };
  // alias는 먼저 풀어 둡니다. shadow를 가리키는 alias도 shadow로 직렬화해야 합니다.
  const value = resolveAliasValue(token.value, context);

  switch (token.type) {
    case "color":
    case "dimension":
    case "duration":
    case "number":
      return serializeReferenceOrRaw(value, context);
    case "shadow":
      return serializeShadow(value, context);
    case "cubicBezier":
      return serializeCubicBezier(value, context);
    default:
      throw new Error(
        `${token.path} uses an unsupported CSS token type: ${token.type}`,
      );
  }
}

export async function generateCssVariables(rootDirectory = process.cwd()) {
  const tokens = [];

  for (const fileName of cssTokenFiles) {
    const filePath = resolve(rootDirectory, "foundations", fileName);
    const document = JSON.parse(await readFile(filePath, "utf8"));
    collectTokens(document, {
      inheritedType: undefined,
      path: [],
      tokens,
    });
  }

  const tokensByPath = new Map(tokens.map((token) => [token.path, token]));
  const variableNames = new Map();
  const variables = tokens.map((token) => {
    const name = toCssVariableName(token.path);
    const existingPath = variableNames.get(name);
    if (existingPath !== undefined) {
      throw new Error(
        `CSS variable name collision: ${existingPath} and ${token.path} both map to ${name}`,
      );
    }
    variableNames.set(name, token.path);

    return {
      name,
      path: token.path,
      type: token.type,
      value: serializeCssTokenValue(token, tokensByPath),
    };
  });

  variables.sort((left, right) =>
    left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
  );

  const declarations = variables.map(
    (variable) => `  ${variable.name}: ${variable.value};`,
  );
  const css = [
    "/* Generated from foundations/*.json. Do not edit directly. */",
    "",
    ":root {",
    ...declarations,
    "}",
    "",
  ].join("\n");

  return { css, variables };
}

export async function writeCssVariables(rootDirectory = process.cwd()) {
  const result = await generateCssVariables(rootDirectory);
  const outputFile = resolve(rootDirectory, cssOutputPath);

  await mkdir(join(rootDirectory, "packages", "design-tokens", "dist", "css"), {
    recursive: true,
  });
  await writeFile(outputFile, result.css, "utf8");

  return {
    ...result,
    outputFile,
  };
}
