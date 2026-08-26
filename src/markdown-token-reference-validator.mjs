import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

const hasOwn = (object, property) =>
  Object.prototype.hasOwnProperty.call(object, property);

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isChildName = (name) => !name.startsWith("$") || name === "$root";

const explicitExceptionMarker = "현재 대응 토큰 없음";

const colorShorthandRoots = Object.freeze([
  "background",
  "border",
  "brand",
  "feedback",
  "fg",
  "gray",
]);

const referenceRoots = Object.freeze([
  "color",
  "elevation",
  "font",
  "icon",
  "layout",
  "motion",
  "radius",
  "spacing",
  "stroke",
  "typography",
  ...colorShorthandRoots,
]);

const referencePattern = new RegExp(
  `(?<![A-Za-z0-9_/$-])(?:${referenceRoots.join("|")})\\.[A-Za-z0-9_$*-]+(?:\\.[A-Za-z0-9_$*-]+)*`,
  "g",
);

const inlineCodePattern = /`([^`\n]+)`/g;

function portablePath(path) {
  return path.split(sep).join("/");
}

function collectTokens(node, path, tokens) {
  if (!isPlainObject(node)) {
    return;
  }

  if (hasOwn(node, "$value")) {
    tokens.add(path.join("."));
    return;
  }

  for (const [name, child] of Object.entries(node)) {
    if (isChildName(name)) {
      collectTokens(child, [...path, name], tokens);
    }
  }
}

function collectAllPaths(node, path, paths) {
  paths.add(path.join("."));

  if (Array.isArray(node)) {
    return;
  }
  if (!isPlainObject(node)) {
    return;
  }

  for (const [name, child] of Object.entries(node)) {
    if (name !== "$description") {
      collectAllPaths(child, [...path, name], paths);
    }
  }
}

function collectExtensionPaths(node, path, extensionPaths) {
  if (!isPlainObject(node)) {
    return;
  }

  for (const [name, child] of Object.entries(node)) {
    if (name === "$extensions") {
      collectAllPaths(child, [...path, name], extensionPaths);
    } else if (!name.startsWith("$")) {
      collectExtensionPaths(child, [...path, name], extensionPaths);
    }
  }
}

async function createFoundationReferenceIndex(rootDirectory) {
  const foundationDirectory = resolve(rootDirectory, "foundations");
  const entries = await readdir(foundationDirectory, { withFileTypes: true });
  const fileNames = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort();
  const extensionPaths = new Set();
  const tokenPaths = new Set();

  for (const fileName of fileNames) {
    const document = JSON.parse(
      await readFile(join(foundationDirectory, fileName), "utf8"),
    );
    collectTokens(document, [], tokenPaths);
    collectExtensionPaths(document, [], extensionPaths);
  }

  return { extensionPaths, tokenPaths };
}

async function listMarkdownFiles(directory) {
  const files = [];

  async function visit(currentDirectory) {
    const entries = (await readdir(currentDirectory, { withFileTypes: true })).sort(
      (left, right) => left.name.localeCompare(right.name),
    );

    for (const entry of entries) {
      const entryPath = join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        await visit(entryPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(entryPath);
      }
    }
  }

  await visit(directory);
  return files;
}

function canonicalTokenPath(reference) {
  if (reference === "white") {
    return "color.white";
  }

  const [root] = reference.split(".");
  if (colorShorthandRoots.includes(root)) {
    return `color.${reference}`;
  }

  return reference;
}

function extractLineReferences(line) {
  const references = [];

  for (const match of line.matchAll(referencePattern)) {
    references.push({
      column: match.index + 1,
      raw: match[0],
    });
  }

  for (const match of line.matchAll(inlineCodePattern)) {
    if (match[1].trim() === "white") {
      references.push({
        column: match.index + match[0].indexOf("white") + 1,
        raw: "white",
      });
    }
  }

  return references.sort((left, right) => left.column - right.column);
}

function referenceExists(reference, index) {
  const canonical = canonicalTokenPath(reference);

  if (canonical.endsWith(".*")) {
    const prefix = canonical.slice(0, -2);
    return [...index.tokenPaths].some((path) => path.startsWith(`${prefix}.`));
  }

  return (
    index.tokenPaths.has(canonical) || index.extensionPaths.has(canonical)
  );
}

function formatReference(reference) {
  const canonical = canonicalTokenPath(reference.raw);
  return canonical === reference.raw
    ? reference.raw
    : `${reference.raw} (resolved as ${canonical})`;
}

export function formatMarkdownTokenReferenceError(error) {
  return `${error.file}:${error.line}:${error.column} — token reference does not exist: ${formatReference(error)}`;
}

export class MarkdownTokenReferenceValidationError extends Error {
  constructor(errors) {
    super(
      [
        `Markdown token reference validation failed with ${errors.length} error(s):`,
        ...errors.map(
          (error) => `- ${formatMarkdownTokenReferenceError(error)}`,
        ),
      ].join("\n"),
    );
    this.name = "MarkdownTokenReferenceValidationError";
    this.errors = errors;
  }
}

export async function validateMarkdownTokenReferences(
  rootDirectory = process.cwd(),
) {
  const index = await createFoundationReferenceIndex(rootDirectory);
  const componentDirectory = resolve(rootDirectory, "components");
  const files = await listMarkdownFiles(componentDirectory);
  const errors = [];
  const exceptions = [];
  const references = [];

  for (const filePath of files) {
    const file = portablePath(relative(rootDirectory, filePath));
    const lines = (await readFile(filePath, "utf8")).split(/\r?\n/);

    lines.forEach((line, lineIndex) => {
      const lineNumber = lineIndex + 1;
      const exceptionColumn = line.indexOf(explicitExceptionMarker);
      if (exceptionColumn !== -1) {
        exceptions.push({
          column: exceptionColumn + 1,
          file,
          line: lineNumber,
          marker: explicitExceptionMarker,
        });
      }

      for (const reference of extractLineReferences(line)) {
        const locatedReference = {
          ...reference,
          file,
          line: lineNumber,
        };
        references.push(locatedReference);

        if (!referenceExists(reference.raw, index)) {
          errors.push(locatedReference);
        }
      }
    });
  }

  if (errors.length > 0) {
    throw new MarkdownTokenReferenceValidationError(errors);
  }

  return {
    exceptionCount: exceptions.length,
    exceptions,
    fileCount: files.length,
    referenceCount: references.length,
    references,
    tokenCount: index.tokenPaths.size,
  };
}
