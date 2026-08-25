import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const hasOwn = (object, property) =>
  Object.prototype.hasOwnProperty.call(object, property);

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isChildName = (name) => !name.startsWith("$") || name === "$root";

const aliasPattern = /^\{([^{}]+)\}$/;

function collectAliases(value, valuePath = "$value", aliases = []) {
  if (typeof value === "string") {
    const match = aliasPattern.exec(value);
    if (match) {
      aliases.push({ target: match[1], valuePath });
    }
    return aliases;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      collectAliases(item, `${valuePath}[${index}]`, aliases),
    );
    return aliases;
  }

  if (isPlainObject(value)) {
    for (const [property, child] of Object.entries(value)) {
      collectAliases(child, `${valuePath}.${property}`, aliases);
    }
  }

  return aliases;
}

function collectTokens(node, context) {
  const { errors, file, path, tokens } = context;

  if (!isPlainObject(node)) {
    return;
  }

  if (hasOwn(node, "$value")) {
    const tokenPath = path.join(".");
    const existing = tokens.get(tokenPath);

    if (existing) {
      errors.push({
        file,
        path: tokenPath,
        message: `duplicate token path; already defined in ${existing.file}`,
      });
      return;
    }

    tokens.set(tokenPath, {
      aliases: collectAliases(node.$value),
      file,
      path: tokenPath,
    });
    return;
  }

  for (const [name, child] of Object.entries(node)) {
    if (isChildName(name)) {
      collectTokens(child, {
        errors,
        file,
        path: [...path, name],
        tokens,
      });
    }
  }
}

function canonicalCycle(cycle) {
  const nodes = cycle.slice(0, -1);
  const rotations = nodes.map((_, index) =>
    [...nodes.slice(index), ...nodes.slice(0, index)].join(" -> "),
  );

  return rotations.sort()[0];
}

function findCycles(tokens) {
  const errors = [];
  const states = new Map();
  const stack = [];
  const seenCycles = new Set();

  function visit(tokenPath) {
    states.set(tokenPath, "visiting");
    stack.push(tokenPath);

    const token = tokens.get(tokenPath);
    for (const alias of token.aliases) {
      if (!tokens.has(alias.target)) {
        continue;
      }

      const targetState = states.get(alias.target);
      if (targetState === undefined) {
        visit(alias.target);
      } else if (targetState === "visiting") {
        const cycleStart = stack.indexOf(alias.target);
        const cycle = [...stack.slice(cycleStart), alias.target];
        const cycleKey = canonicalCycle(cycle);

        if (!seenCycles.has(cycleKey)) {
          seenCycles.add(cycleKey);
          errors.push({
            file: token.file,
            path: `${token.path}.${alias.valuePath}`,
            message: `circular alias reference: ${cycle.join(" -> ")}`,
          });
        }
      }
    }

    stack.pop();
    states.set(tokenPath, "visited");
  }

  for (const tokenPath of tokens.keys()) {
    if (states.get(tokenPath) === undefined) {
      visit(tokenPath);
    }
  }

  return errors;
}

export function formatTokenAliasError(error) {
  return `${error.file}: ${error.path} — ${error.message}`;
}

export class TokenAliasValidationError extends Error {
  constructor(errors) {
    super(
      [
        `Token alias validation failed with ${errors.length} error(s):`,
        ...errors.map((error) => `- ${formatTokenAliasError(error)}`),
      ].join("\n"),
    );
    this.name = "TokenAliasValidationError";
    this.errors = errors;
  }
}

export async function validateTokenAliasesInDirectory(
  tokenDirectory,
  displayRoot = tokenDirectory,
) {
  const entries = await readdir(tokenDirectory, { withFileTypes: true });
  const fileNames = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort();
  const tokens = new Map();
  const errors = [];

  for (const fileName of fileNames) {
    const filePath = join(tokenDirectory, fileName);
    const file = relative(displayRoot, filePath);
    const document = JSON.parse(await readFile(filePath, "utf8"));

    collectTokens(document, {
      errors,
      file,
      path: [],
      tokens,
    });
  }

  let aliasCount = 0;
  let crossFileAliasCount = 0;
  for (const token of tokens.values()) {
    for (const alias of token.aliases) {
      aliasCount += 1;
      const target = tokens.get(alias.target);

      if (!target) {
        errors.push({
          file: token.file,
          path: `${token.path}.${alias.valuePath}`,
          message: `referenced token does not exist: ${alias.target}`,
        });
      } else if (target.file !== token.file) {
        crossFileAliasCount += 1;
      }
    }
  }

  errors.push(...findCycles(tokens));

  if (errors.length > 0) {
    throw new TokenAliasValidationError(errors);
  }

  return {
    aliasCount,
    crossFileAliasCount,
    fileCount: fileNames.length,
    tokenCount: tokens.size,
  };
}

export async function validateFoundationTokenAliases(
  rootDirectory = process.cwd(),
) {
  return validateTokenAliasesInDirectory(
    resolve(rootDirectory, "foundations"),
    rootDirectory,
  );
}
