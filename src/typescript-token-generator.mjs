import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { packagePublishMetadata } from "./package-publish-config.mjs";

export const typeScriptTokenOutputPaths = Object.freeze({
  declarations: "dist/design-tokens/index.d.ts",
  module: "dist/design-tokens/index.js",
  packageManifest: "dist/design-tokens/package.json",
});

const aliasPattern = /^\{([^{}]+)\}$/;

const hasOwn = (object, property) =>
  Object.prototype.hasOwnProperty.call(object, property);

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isChildName = (name) => !name.startsWith("$") || name === "$root";

const identifierPattern = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

const reservedExportNames = new Set([
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "null",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);

function collectTokens(node, path, tokens, fileName) {
  if (!isPlainObject(node)) {
    return;
  }

  if (hasOwn(node, "$value")) {
    const tokenPath = path.join(".");
    if (tokens.has(tokenPath)) {
      throw new Error(`Duplicate token path in ${fileName}: ${tokenPath}`);
    }
    tokens.set(tokenPath, {
      fileName,
      path: tokenPath,
      value: node.$value,
    });
    return;
  }

  for (const [name, child] of Object.entries(node)) {
    if (isChildName(name)) {
      collectTokens(child, [...path, name], tokens, fileName);
    }
  }
}

async function readFoundationTokens(rootDirectory) {
  const foundationDirectory = resolve(rootDirectory, "foundations");
  const entries = await readdir(foundationDirectory, { withFileTypes: true });
  const fileNames = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort();
  const tokens = new Map();

  for (const fileName of fileNames) {
    const document = JSON.parse(
      await readFile(resolve(foundationDirectory, fileName), "utf8"),
    );
    collectTokens(document, [], tokens, fileName);
  }

  return tokens;
}

function createTokenResolver(tokens) {
  const cache = new Map();

  function resolveValue(value, stack) {
    if (typeof value === "string") {
      const target = aliasPattern.exec(value)?.[1];
      if (target !== undefined) {
        return resolveToken(target, stack);
      }
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => resolveValue(item, stack));
    }

    if (isPlainObject(value)) {
      return Object.fromEntries(
        Object.entries(value).map(([property, child]) => [
          property,
          resolveValue(child, stack),
        ]),
      );
    }

    return value;
  }

  function resolveToken(tokenPath, stack = []) {
    if (cache.has(tokenPath)) {
      return cache.get(tokenPath);
    }
    if (stack.includes(tokenPath)) {
      throw new Error(
        `Circular token alias while generating TypeScript: ${[...stack, tokenPath].join(" -> ")}`,
      );
    }

    const token = tokens.get(tokenPath);
    if (token === undefined) {
      throw new Error(`Unknown token alias while generating TypeScript: ${tokenPath}`);
    }

    const resolved = resolveValue(token.value, [...stack, tokenPath]);
    cache.set(tokenPath, resolved);
    return resolved;
  }

  return resolveToken;
}

function setNestedValue(target, path, value) {
  let current = target;

  for (const segment of path.slice(0, -1)) {
    if (!hasOwn(current, segment)) {
      current[segment] = {};
    } else if (!isPlainObject(current[segment])) {
      throw new Error(`Token path conflicts with a value: ${path.join(".")}`);
    }
    current = current[segment];
  }

  const leaf = path.at(-1);
  if (hasOwn(current, leaf)) {
    throw new Error(`Duplicate generated token path: ${path.join(".")}`);
  }
  current[leaf] = value;
}

function buildResolvedTokenTree(tokens) {
  const tree = {};
  const resolveToken = createTokenResolver(tokens);
  const tokenPaths = [...tokens.keys()].sort();

  for (const tokenPath of tokenPaths) {
    setNestedValue(tree, tokenPath.split("."), resolveToken(tokenPath));
  }

  return tree;
}

function assertExportName(name) {
  if (!identifierPattern.test(name) || reservedExportNames.has(name)) {
    throw new Error(`Top-level token group cannot be an ESM export: ${name}`);
  }
}

function generateModule(tokenTree, exportNames) {
  const lines = [
    "/* Generated from foundations/*.json. Do not edit directly. */",
    "",
    "function deepFreeze(value) {",
    '  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {',
    "    Object.freeze(value);",
    "    for (const child of Object.values(value)) {",
    "      deepFreeze(child);",
    "    }",
    "  }",
    "  return value;",
    "}",
    "",
  ];

  for (const name of exportNames) {
    lines.push(
      `export const ${name} = deepFreeze(${JSON.stringify(tokenTree[name], null, 2)});`,
      "",
    );
  }

  lines.push(
    "export const tokens = deepFreeze({",
    ...exportNames.map((name) => `  ${name},`),
    "});",
    "",
  );

  return lines.join("\n");
}

function propertyName(name) {
  return identifierPattern.test(name) ? name : JSON.stringify(name);
}

function literalType(value, indentation = 0) {
  if (value === null) {
    return "null";
  }
  if (["string", "number", "boolean"].includes(typeof value)) {
    return JSON.stringify(value);
  }

  const indent = "  ".repeat(indentation);
  const childIndent = "  ".repeat(indentation + 1);

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "readonly []";
    }
    return [
      "readonly [",
      ...value.map(
        (item) => `${childIndent}${literalType(item, indentation + 1)},`,
      ),
      `${indent}]`,
    ].join("\n");
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return "Readonly<Record<string, never>>";
    }
    return [
      "{",
      ...entries.map(
        ([name, child]) =>
          `${childIndent}readonly ${propertyName(name)}: ${literalType(child, indentation + 1)};`,
      ),
      `${indent}}`,
    ].join("\n");
  }

  throw new Error(`Unsupported TypeScript token value: ${typeof value}`);
}

function generateDeclarations(tokenTree, exportNames) {
  const lines = [
    "/* Generated from foundations/*.json. Do not edit directly. */",
    "",
  ];

  for (const name of exportNames) {
    lines.push(
      `export declare const ${name}: ${literalType(tokenTree[name])};`,
      "",
    );
  }

  lines.push(
    "export declare const tokens: {",
    ...exportNames.map((name) => `  readonly ${name}: typeof ${name};`),
    "};",
    "",
  );

  return lines.join("\n");
}

function generatePackageManifest(version) {
  return `${JSON.stringify(
    {
      name: "@libitum/design-tokens",
      version,
      description: "libitum design tokens for TypeScript and CSS",
      type: "module",
      sideEffects: false,
      ...packagePublishMetadata(),
      files: ["index.js", "index.d.ts", "css"],
      exports: {
        ".": {
          types: "./index.d.ts",
          import: "./index.js",
          default: "./index.js",
        },
        "./css/variables.css": "./css/variables.css",
        "./css/typography.css": "./css/typography.css",
        "./package.json": "./package.json",
      },
    },
    null,
    2,
  )}\n`;
}

export async function generateTypeScriptTokens(rootDirectory = process.cwd()) {
  const tokens = await readFoundationTokens(rootDirectory);
  const tokenTree = buildResolvedTokenTree(tokens);
  const exportNames = Object.keys(tokenTree).sort();
  exportNames.forEach(assertExportName);

  const rootPackage = JSON.parse(
    await readFile(resolve(rootDirectory, "package.json"), "utf8"),
  );

  return {
    declarations: generateDeclarations(tokenTree, exportNames),
    exportNames,
    module: generateModule(tokenTree, exportNames),
    packageManifest: generatePackageManifest(rootPackage.version),
    tokenCount: tokens.size,
    tokens: tokenTree,
  };
}

export async function writeTypeScriptTokens(rootDirectory = process.cwd()) {
  const result = await generateTypeScriptTokens(rootDirectory);
  const outputDirectory = resolve(rootDirectory, "dist", "design-tokens");
  const outputFiles = Object.fromEntries(
    Object.entries(typeScriptTokenOutputPaths).map(([name, path]) => [
      name,
      resolve(rootDirectory, path),
    ]),
  );

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(outputFiles.declarations, result.declarations, "utf8"),
    writeFile(outputFiles.module, result.module, "utf8"),
    writeFile(outputFiles.packageManifest, result.packageManifest, "utf8"),
  ]);

  return {
    ...result,
    outputFiles,
  };
}
