import { readFile, readdir } from "node:fs/promises";
import { basename, join, relative, resolve, sep } from "node:path";

const iconVariants = Object.freeze(["padding", "no-padding"]);
const supportedElements = new Set(["path", "rect", "ellipse"]);

function portablePath(path) {
  return path.split(sep).join("/");
}

function createError(code, file, message) {
  return { code, file, message };
}

class SvgDocumentParseError extends Error {
  constructor(message) {
    super(message);
    this.name = "SvgDocumentParseError";
  }
}

function assertValidEntityReferences(value, context) {
  const withoutEntities = value.replace(
    /&(?:amp|lt|gt|quot|apos|#\d+|#x[\dA-Fa-f]+);/g,
    "",
  );
  if (withoutEntities.includes("&")) {
    throw new SvgDocumentParseError(
      `${context} contains an invalid XML entity reference`,
    );
  }
}

function parseAttributes(source, context) {
  const attributes = new Map();
  let index = 0;

  while (index < source.length) {
    while (/\s/.test(source[index] ?? "")) {
      index += 1;
    }
    if (index === source.length) {
      break;
    }

    const nameMatch = /^[A-Za-z_:][A-Za-z0-9_.:-]*/.exec(
      source.slice(index),
    );
    if (nameMatch === null) {
      throw new SvgDocumentParseError(`${context} has an invalid attribute name`);
    }

    const name = nameMatch[0];
    index += name.length;
    while (/\s/.test(source[index] ?? "")) {
      index += 1;
    }
    if (source[index] !== "=") {
      throw new SvgDocumentParseError(
        `${context} attribute ${name} must use = and a quoted value`,
      );
    }

    index += 1;
    while (/\s/.test(source[index] ?? "")) {
      index += 1;
    }
    const quote = source[index];
    if (quote !== '"' && quote !== "'") {
      throw new SvgDocumentParseError(
        `${context} attribute ${name} must use a quoted value`,
      );
    }

    const valueStart = index + 1;
    const valueEnd = source.indexOf(quote, valueStart);
    if (valueEnd === -1) {
      throw new SvgDocumentParseError(
        `${context} attribute ${name} has an unterminated value`,
      );
    }

    const value = source.slice(valueStart, valueEnd);
    if (value.includes("<")) {
      throw new SvgDocumentParseError(
        `${context} attribute ${name} contains an unescaped < character`,
      );
    }
    assertValidEntityReferences(value, `${context} attribute ${name}`);

    if (attributes.has(name)) {
      throw new SvgDocumentParseError(
        `${context} contains duplicate attribute ${name}`,
      );
    }
    attributes.set(name, value);
    index = valueEnd + 1;
  }

  return attributes;
}

function parseSvgDocument(contents) {
  let source = contents.replace(/^\uFEFF/, "").trim();
  if (source.startsWith("<?xml")) {
    const declaration = /^<\?xml\s+[^?]*\?>/.exec(source);
    if (declaration === null) {
      throw new SvgDocumentParseError("XML declaration is malformed");
    }
    source = source.slice(declaration[0].length).trimStart();
  }

  const root = /^<svg(?=\s|>)([^>]*)>([\s\S]*)<\/svg>$/.exec(source);
  if (root === null) {
    throw new SvgDocumentParseError(
      "document must contain exactly one non-self-closing svg root element",
    );
  }

  const rootAttributes = parseAttributes(root[1], "svg");
  const elements = [];
  let inner = root[2];

  while (inner.trimStart() !== "") {
    inner = inner.trimStart();
    const element = /^<([A-Za-z][A-Za-z0-9:-]*)([^>]*)\/>/.exec(inner);
    if (element === null) {
      throw new SvgDocumentParseError(
        "svg children must be self-closing path, rect, or ellipse elements",
      );
    }

    const name = element[1];
    if (!supportedElements.has(name)) {
      throw new SvgDocumentParseError(
        `unsupported svg child element: ${name}`,
      );
    }
    elements.push({
      attributes: parseAttributes(element[2], name),
      name,
    });
    inner = inner.slice(element[0].length);
  }

  if (elements.length === 0) {
    throw new SvgDocumentParseError(
      "svg must contain at least one path, rect, or ellipse element",
    );
  }

  return { elements, rootAttributes };
}

function parseViewBox(value) {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }

  const parts = value.trim().split(/[\s,]+/);
  if (parts.length !== 4) {
    return undefined;
  }
  const numbers = parts.map(Number);
  if (!numbers.every(Number.isFinite) || numbers[2] <= 0 || numbers[3] <= 0) {
    return undefined;
  }
  return numbers;
}

function validateViewBox(document, variant, file, errors) {
  const rawViewBox = document.rootAttributes.get("viewBox");
  const viewBox = parseViewBox(rawViewBox);
  if (viewBox === undefined) {
    errors.push(
      createError(
        "viewbox",
        file,
        "svg viewBox must contain four finite numbers with positive width and height",
      ),
    );
    return;
  }

  if (
    variant === "padding" &&
    !viewBox.every((value, index) => value === [0, 0, 10, 10][index])
  ) {
    errors.push(
      createError(
        "viewbox",
        file,
        `padding icon viewBox must be 0 0 10 10, received: ${rawViewBox}`,
      ),
    );
  }
}

function styleFill(style) {
  if (style === undefined) {
    return undefined;
  }

  for (const declaration of style.split(";")) {
    const separator = declaration.indexOf(":");
    if (separator === -1) {
      continue;
    }
    const property = declaration.slice(0, separator).trim().toLowerCase();
    if (property === "fill") {
      return declaration.slice(separator + 1).trim();
    }
  }
  return undefined;
}

function validateFill(document, file, errors) {
  const rootFill = document.rootAttributes.get("fill");
  if (rootFill !== "currentColor") {
    errors.push(
      createError(
        "fill",
        file,
        `svg root fill must be currentColor, received: ${rootFill ?? "missing"}`,
      ),
    );
  }

  const rootStyleFill = styleFill(document.rootAttributes.get("style"));
  if (rootStyleFill !== undefined && rootStyleFill !== "currentColor") {
    errors.push(
      createError(
        "fill",
        file,
        `svg style fill must be currentColor, received: ${rootStyleFill}`,
      ),
    );
  }

  document.elements.forEach((element, index) => {
    const fill = element.attributes.get("fill");
    const inlineFill = styleFill(element.attributes.get("style"));
    for (const [source, value] of [
      ["fill", fill],
      ["style fill", inlineFill],
    ]) {
      if (value !== undefined && value !== "currentColor") {
        errors.push(
          createError(
            "fill",
            file,
            `${element.name} ${source} must be currentColor, received: ${value} (child ${index + 1})`,
          ),
        );
      }
    }
  });
}

async function listSvgFiles(directory) {
  const files = [];

  async function visit(currentDirectory) {
    const entries = (await readdir(currentDirectory, { withFileTypes: true })).sort(
      (left, right) => left.name.localeCompare(right.name),
    );
    for (const entry of entries) {
      const entryPath = join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        await visit(entryPath);
      } else if (entry.isFile() && entry.name.endsWith(".svg")) {
        files.push(entryPath);
      }
    }
  }

  await visit(directory);
  return files;
}

async function validateSvgFile(filePath, file, variant) {
  let document;
  try {
    document = parseSvgDocument(await readFile(filePath, "utf8"));
  } catch (error) {
    return [
      createError(
        "parse-error",
        file,
        `invalid SVG: ${error.message}`,
      ),
    ];
  }

  const errors = [];
  validateViewBox(document, variant, file, errors);
  validateFill(document, file, errors);
  return errors;
}

function findDuplicateNames(files, variantDirectory, variant) {
  const names = new Map();
  for (const filePath of files) {
    const name = basename(filePath).toLowerCase();
    const paths = names.get(name) ?? [];
    paths.push(portablePath(relative(variantDirectory, filePath)));
    names.set(name, paths);
  }

  const errors = [];
  for (const [name, paths] of names) {
    if (paths.length > 1) {
      errors.push(
        createError(
          "duplicate-name",
          `assets/icons/${variant}`,
          `duplicate filename ${name}: ${paths.join(", ")}`,
        ),
      );
    }
  }
  return errors;
}

function compareVariantPairs(relativeFilesByVariant) {
  const errors = [];
  const padding = relativeFilesByVariant.get("padding");
  const noPadding = relativeFilesByVariant.get("no-padding");

  for (const path of padding) {
    if (!noPadding.has(path)) {
      errors.push(
        createError(
          "missing-pair",
          `assets/icons/no-padding/${path}`,
          `missing no-padding pair for assets/icons/padding/${path}`,
        ),
      );
    }
  }
  for (const path of noPadding) {
    if (!padding.has(path)) {
      errors.push(
        createError(
          "missing-pair",
          `assets/icons/padding/${path}`,
          `missing padding pair for assets/icons/no-padding/${path}`,
        ),
      );
    }
  }

  return errors;
}

export function formatSvgIconError(error) {
  return `${error.file} — [${error.code}] ${error.message}`;
}

export class SvgIconValidationError extends Error {
  constructor(errors) {
    super(
      [
        `SVG icon validation failed with ${errors.length} error(s):`,
        ...errors.map((error) => `- ${formatSvgIconError(error)}`),
      ].join("\n"),
    );
    this.name = "SvgIconValidationError";
    this.errors = errors;
  }
}

export async function validateSvgIcons(rootDirectory = process.cwd()) {
  const iconsDirectory = resolve(rootDirectory, "assets", "icons");
  const filesByVariant = new Map();
  const relativeFilesByVariant = new Map();
  const errors = [];

  for (const variant of iconVariants) {
    const variantDirectory = join(iconsDirectory, variant);
    let files;
    try {
      files = await listSvgFiles(variantDirectory);
    } catch (error) {
      errors.push(
        createError(
          "parse-error",
          portablePath(relative(rootDirectory, variantDirectory)),
          `cannot read icon variant directory: ${error.message}`,
        ),
      );
      files = [];
    }

    if (files.length === 0) {
      errors.push(
        createError(
          "parse-error",
          portablePath(relative(rootDirectory, variantDirectory)),
          "no SVG icon files found",
        ),
      );
    }

    filesByVariant.set(variant, files);
    relativeFilesByVariant.set(
      variant,
      new Set(
        files.map((filePath) =>
          portablePath(relative(variantDirectory, filePath)),
        ),
      ),
    );
    errors.push(...findDuplicateNames(files, variantDirectory, variant));
  }

  errors.push(...compareVariantPairs(relativeFilesByVariant));

  const validations = [];
  for (const variant of iconVariants) {
    for (const filePath of filesByVariant.get(variant)) {
      const file = portablePath(relative(rootDirectory, filePath));
      validations.push(validateSvgFile(filePath, file, variant));
    }
  }
  errors.push(...(await Promise.all(validations)).flat());
  errors.sort(
    (left, right) =>
      left.file.localeCompare(right.file) ||
      left.code.localeCompare(right.code) ||
      left.message.localeCompare(right.message),
  );

  if (errors.length > 0) {
    throw new SvgIconValidationError(errors);
  }

  const allRelativeFiles = new Set(
    [...relativeFilesByVariant.values()].flatMap((paths) => [...paths]),
  );
  const categories = new Set(
    [...allRelativeFiles].map((path) => path.split("/")[0]),
  );

  return {
    categoryCount: categories.size,
    fileCount: [...filesByVariant.values()].reduce(
      (sum, files) => sum + files.length,
      0,
    ),
    pairCount: relativeFilesByVariant.get("padding").size,
    variantCounts: Object.fromEntries(
      iconVariants.map((variant) => [variant, filesByVariant.get(variant).length]),
    ),
  };
}
