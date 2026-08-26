import { readFile, readdir } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

const markdownRoots = Object.freeze([
  "README.md",
  "AGENTS.md",
  "foundations",
  "components",
]);

const inlineLinkPattern = /!?\[[^\]]*\]\((<[^>]+>|[^)\s]+)(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\)/g;
const referenceDefinitionPattern = /^\s*\[[^\]]+\]:\s*(<[^>]+>|\S+)/;
const fencePattern = /^\s*(`{3,}|~{3,})/;
const schemePattern = /^[A-Za-z][A-Za-z0-9+.-]*:/;

function portablePath(path) {
  return path.split(sep).join("/");
}

async function listMarkdownFiles(rootDirectory) {
  const files = [];

  async function visit(path) {
    const entries = (await readdir(path, { withFileTypes: true })).sort(
      (left, right) => left.name.localeCompare(right.name),
    );

    for (const entry of entries) {
      const entryPath = join(path, entry.name);
      if (entry.isDirectory()) {
        await visit(entryPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(entryPath);
      }
    }
  }

  for (const root of markdownRoots) {
    const path = resolve(rootDirectory, root);
    if (root.endsWith(".md")) {
      files.push(path);
    } else {
      await visit(path);
    }
  }

  return files;
}

function unwrapDestination(destination) {
  return destination.startsWith("<") && destination.endsWith(">")
    ? destination.slice(1, -1)
    : destination;
}

function extractMarkdownLinks(contents) {
  const links = [];
  const lines = contents.split(/\r?\n/);
  let fenceMarker;

  lines.forEach((line, lineIndex) => {
    const fence = fencePattern.exec(line)?.[1];
    if (fence !== undefined) {
      if (fenceMarker === undefined) {
        fenceMarker = fence[0];
      } else if (fence[0] === fenceMarker) {
        fenceMarker = undefined;
      }
      return;
    }
    if (fenceMarker !== undefined) {
      return;
    }

    for (const match of line.matchAll(inlineLinkPattern)) {
      const rawDestination = match[1];
      const destinationBoundary = match[0].indexOf("](") + 2;
      const destinationIndex = match[0].indexOf(
        rawDestination,
        destinationBoundary,
      );
      links.push({
        column: match.index + destinationIndex + 1,
        line: lineIndex + 1,
        target: unwrapDestination(rawDestination),
      });
    }

    const definition = referenceDefinitionPattern.exec(line);
    if (definition !== null) {
      const rawDestination = definition[1];
      const destinationBoundary = line.indexOf("]:") + 2;
      links.push({
        column: line.indexOf(rawDestination, destinationBoundary) + 1,
        line: lineIndex + 1,
        target: unwrapDestination(rawDestination),
      });
    }
  });

  return links;
}

function cleanHeadingText(text) {
  return text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[`*_~]/g, "")
    .trim();
}

export function githubHeadingSlug(text) {
  return cleanHeadingText(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, "")
    .replace(/\s+/g, "-");
}

function extractMarkdownAnchors(contents) {
  const anchors = new Set();
  const slugCounts = new Map();
  let fenceMarker;

  for (const line of contents.split(/\r?\n/)) {
    const fence = fencePattern.exec(line)?.[1];
    if (fence !== undefined) {
      if (fenceMarker === undefined) {
        fenceMarker = fence[0];
      } else if (fence[0] === fenceMarker) {
        fenceMarker = undefined;
      }
      continue;
    }
    if (fenceMarker !== undefined) {
      continue;
    }

    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading !== null) {
      const baseSlug = githubHeadingSlug(heading[2]);
      if (baseSlug !== "") {
        const count = slugCounts.get(baseSlug) ?? 0;
        anchors.add(count === 0 ? baseSlug : `${baseSlug}-${count}`);
        slugCounts.set(baseSlug, count + 1);
      }
    }

    for (const anchor of line.matchAll(
      /<a\s+[^>]*(?:id|name)=["']([^"']+)["'][^>]*>/gi,
    )) {
      anchors.add(anchor[1]);
    }
  }

  return anchors;
}

async function pathExistsWithExactCase(rootDirectory, targetPath) {
  const targetRelativePath = relative(rootDirectory, targetPath);
  if (targetRelativePath === "") {
    return true;
  }

  let currentPath = rootDirectory;
  for (const segment of targetRelativePath.split(sep)) {
    let entries;
    try {
      entries = await readdir(currentPath, { withFileTypes: true });
    } catch {
      return false;
    }
    if (!entries.some((entry) => entry.name === segment)) {
      return false;
    }
    currentPath = join(currentPath, segment);
  }

  return true;
}

function decodeLinkPart(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
}

function splitInternalTarget(target) {
  const hashIndex = target.indexOf("#");
  const targetWithoutFragment =
    hashIndex === -1 ? target : target.slice(0, hashIndex);
  const queryIndex = targetWithoutFragment.indexOf("?");

  return {
    fragment:
      hashIndex === -1 ? undefined : decodeLinkPart(target.slice(hashIndex + 1)),
    path: decodeLinkPart(
      queryIndex === -1
        ? targetWithoutFragment
        : targetWithoutFragment.slice(0, queryIndex),
    ),
  };
}

function createError(code, link, file, message) {
  return {
    code,
    column: link.column,
    file,
    line: link.line,
    message,
    target: link.target,
  };
}

function externalPolicyError(link, file) {
  if (link.target.startsWith("https://")) {
    if (file.startsWith("components/")) {
      return createError(
        "external-policy",
        link,
        file,
        "component specs must be self-contained and cannot use external links",
      );
    }
    return undefined;
  }

  if (link.target.startsWith("//") || schemePattern.test(link.target)) {
    return createError(
      "external-policy",
      link,
      file,
      "external references must use an explicit HTTPS URL",
    );
  }

  if (link.target.startsWith("/")) {
    return createError(
      "external-policy",
      link,
      file,
      "repository-internal links must use a relative path",
    );
  }

  return undefined;
}

async function validateInternalLink(context) {
  const { anchorCache, file, filePath, link, rootDirectory } = context;
  const target = splitInternalTarget(link.target);

  if (
    target.path === undefined ||
    (target.fragment === undefined && link.target.includes("#"))
  ) {
    return createError(
      "missing-path",
      link,
      file,
      "link contains invalid percent encoding",
    );
  }

  const targetPath =
    target.path === "" ? filePath : resolve(dirname(filePath), target.path);
  const relativeTarget = relative(rootDirectory, targetPath);
  if (
    relativeTarget.startsWith(`..${sep}`) ||
    relativeTarget === ".." ||
    isAbsolute(relativeTarget)
  ) {
    return createError(
      "external-policy",
      link,
      file,
      "repository-internal link resolves outside the repository",
    );
  }

  if (!(await pathExistsWithExactCase(rootDirectory, targetPath))) {
    return createError(
      "missing-path",
      link,
      file,
      `path does not exist with exact casing: ${portablePath(relativeTarget)}`,
    );
  }

  if (target.fragment !== undefined && target.fragment !== "") {
    if (!targetPath.endsWith(".md")) {
      return createError(
        "missing-anchor",
        link,
        file,
        "anchors are only supported for Markdown targets",
      );
    }

    let anchors = anchorCache.get(targetPath);
    if (anchors === undefined) {
      anchors = extractMarkdownAnchors(await readFile(targetPath, "utf8"));
      anchorCache.set(targetPath, anchors);
    }

    if (!anchors.has(target.fragment)) {
      return createError(
        "missing-anchor",
        link,
        file,
        `anchor does not exist in ${portablePath(relativeTarget)}: #${target.fragment}`,
      );
    }
  }

  return undefined;
}

export function formatMarkdownLinkError(error) {
  return `${error.file}:${error.line}:${error.column} — [${error.code}] ${error.message}: ${error.target}`;
}

export class MarkdownLinkValidationError extends Error {
  constructor(errors) {
    super(
      [
        `Markdown link validation failed with ${errors.length} error(s):`,
        ...errors.map((error) => `- ${formatMarkdownLinkError(error)}`),
      ].join("\n"),
    );
    this.name = "MarkdownLinkValidationError";
    this.errors = errors;
  }
}

export async function validateMarkdownLinks(rootDirectory = process.cwd()) {
  const files = await listMarkdownFiles(rootDirectory);
  const anchorCache = new Map();
  const errors = [];
  let externalLinkCount = 0;
  let internalLinkCount = 0;

  for (const filePath of files) {
    const file = portablePath(relative(rootDirectory, filePath));
    const links = extractMarkdownLinks(await readFile(filePath, "utf8"));

    for (const link of links) {
      const policyError = externalPolicyError(link, file);
      if (
        link.target.startsWith("//") ||
        schemePattern.test(link.target)
      ) {
        externalLinkCount += 1;
        if (policyError !== undefined) {
          errors.push(policyError);
        }
        continue;
      }

      if (policyError !== undefined) {
        errors.push(policyError);
        continue;
      }

      internalLinkCount += 1;
      const internalError = await validateInternalLink({
        anchorCache,
        file,
        filePath,
        link,
        rootDirectory,
      });
      if (internalError !== undefined) {
        errors.push(internalError);
      }
    }
  }

  if (errors.length > 0) {
    throw new MarkdownLinkValidationError(errors);
  }

  return {
    externalLinkCount,
    fileCount: files.length,
    internalLinkCount,
    linkCount: externalLinkCount + internalLinkCount,
  };
}
