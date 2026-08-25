import { readFile, readdir } from "node:fs/promises";
import { basename, join, relative, resolve } from "node:path";

const hasOwn = (object, property) =>
  Object.prototype.hasOwnProperty.call(object, property);

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isChildName = (name) => !name.startsWith("$") || name === "$root";

const displayPath = (path) => (path.length === 0 ? "$" : path.join("."));

const invalidType = Symbol("invalid token type");

function addError(errors, file, path, message) {
  errors.push({ file, path: displayPath(path), message });
}

function validatePropertyTypes(node, file, path, errors) {
  if (hasOwn(node, "$description") && typeof node.$description !== "string") {
    addError(errors, file, path, "$description must be a string");
  }

  if (hasOwn(node, "$extensions") && !isPlainObject(node.$extensions)) {
    addError(errors, file, path, "$extensions must be an object");
  }
}

function resolveType(node, inheritedType, file, path, errors) {
  if (!hasOwn(node, "$type")) {
    return inheritedType;
  }

  if (typeof node.$type !== "string" || node.$type.trim() === "") {
    addError(errors, file, path, "$type must be a non-empty string");
    return invalidType;
  }

  return node.$type;
}

function walkNode(node, context) {
  const { errors, file, inheritedType, path } = context;

  if (!isPlainObject(node)) {
    addError(errors, file, path, "token or group must be an object");
    return 0;
  }

  validatePropertyTypes(node, file, path, errors);
  const resolvedType = resolveType(
    node,
    inheritedType,
    file,
    path,
    errors,
  );
  const children = Object.entries(node).filter(([name]) => isChildName(name));

  if (hasOwn(node, "$value")) {
    if (resolvedType === undefined) {
      addError(
        errors,
        file,
        path,
        "token type is missing; add $type to the token or a parent group",
      );
    }

    if (node.$value === null) {
      addError(errors, file, path, "$value must not be null");
    }

    if (children.length > 0) {
      const childNames = children.map(([name]) => name).join(", ");
      addError(
        errors,
        file,
        path,
        `token cannot also contain child tokens or groups: ${childNames}`,
      );
    }

    return 1;
  }

  if (path.length > 0 && children.length === 0) {
    addError(
      errors,
      file,
      path,
      "empty leaf group is invalid; a token at this path is missing $value",
    );
    return 0;
  }

  let tokenCount = 0;
  for (const [name, child] of children) {
    tokenCount += walkNode(child, {
      errors,
      file,
      inheritedType: resolvedType,
      path: [...path, name],
    });
  }

  return tokenCount;
}

export function validateTokenDocument(document, file = "<document>") {
  const errors = [];

  if (!isPlainObject(document)) {
    addError(errors, file, [], "document root must be an object");
    return { errors, tokenCount: 0 };
  }

  if (hasOwn(document, "$schema") && typeof document.$schema !== "string") {
    addError(errors, file, [], "$schema must be a string");
  }

  const tokenCount = walkNode(document, {
    errors,
    file,
    inheritedType: undefined,
    path: [],
  });

  if (tokenCount === 0 && errors.length === 0) {
    addError(errors, file, [], "document must contain at least one token");
  }

  return { errors, tokenCount };
}

export async function validateTokenFile(filePath, displayFile = basename(filePath)) {
  let document;

  try {
    document = JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    return {
      errors: [
        {
          file: displayFile,
          path: "$",
          message: `invalid JSON: ${error.message}`,
        },
      ],
      tokenCount: 0,
    };
  }

  return validateTokenDocument(document, displayFile);
}

export function formatTokenSchemaError(error) {
  return `${error.file}: ${error.path} — ${error.message}`;
}

export class TokenSchemaValidationError extends Error {
  constructor(errors) {
    super(
      [
        `Token schema validation failed with ${errors.length} error(s):`,
        ...errors.map((error) => `- ${formatTokenSchemaError(error)}`),
      ].join("\n"),
    );
    this.name = "TokenSchemaValidationError";
    this.errors = errors;
  }
}

export async function validateFoundationTokenFiles(rootDirectory = process.cwd()) {
  const foundationsDirectory = resolve(rootDirectory, "foundations");
  const entries = await readdir(foundationsDirectory, { withFileTypes: true });
  const fileNames = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort();

  if (fileNames.length === 0) {
    throw new TokenSchemaValidationError([
      {
        file: "foundations",
        path: "$",
        message: "no foundation token JSON files found",
      },
    ]);
  }

  const results = await Promise.all(
    fileNames.map((fileName) =>
      validateTokenFile(
        join(foundationsDirectory, fileName),
        relative(rootDirectory, join(foundationsDirectory, fileName)),
      ),
    ),
  );
  const errors = results.flatMap((result) => result.errors);

  if (errors.length > 0) {
    throw new TokenSchemaValidationError(errors);
  }

  return {
    fileCount: fileNames.length,
    tokenCount: results.reduce((sum, result) => sum + result.tokenCount, 0),
  };
}
