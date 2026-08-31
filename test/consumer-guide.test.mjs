import assert from "node:assert/strict";
import { cp, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { writeCssVariables } from "../src/css-token-generator.mjs";

import { publishedPackages } from "../src/package-publish-config.mjs";
import {
  isExportedSubpath,
  subpathFromSpecifier,
} from "../src/workspace-layout.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

const guideSpecifiers = Object.freeze([
  "@libitums/design-tokens",
  "@libitums/design-tokens/css/variables.css",
  "@libitums/design-tokens/css/typography.css",
  "@libitums/icons/heart",
  "@libitums/icons/no-padding/heart",
  "@libitums/icons/manifest.json",
]);

async function readPackageManifests() {
  return Object.fromEntries(
    await Promise.all(
      publishedPackages.map(async (definition) => [
        definition.name,
        JSON.parse(
          await readFile(
            join(repositoryRoot, definition.directory, "package.json"),
            "utf8",
          ),
        ),
      ]),
    ),
  );
}

test("소비 가이드가 실제 package export와 인증 설정을 사용한다", async () => {
  const [guide, manifests] = await Promise.all([
    readFile(new URL("../CONSUMING.md", import.meta.url), "utf8"),
    readPackageManifests(),
  ]);

  assert.match(guide, /@libitums:registry=https:\/\/npm\.pkg\.github\.com/);
  assert.match(guide, /--save-exact/);

  for (const specifier of guideSpecifiers) {
    assert.equal(
      guide.includes(specifier),
      true,
      `Missing guide path: ${specifier}`,
    );
  }
});

test("가이드가 안내한 import 경로가 배포 package의 공개 export로 해석된다", async () => {
  const manifests = await readPackageManifests();

  for (const specifier of guideSpecifiers) {
    const owner = Object.values(manifests).find(
      (manifest) => subpathFromSpecifier(specifier, manifest.name) !== undefined,
    );
    assert.notEqual(owner, undefined, `No package owns ${specifier}`);

    const subpath = subpathFromSpecifier(specifier, owner.name);
    assert.equal(
      isExportedSubpath(subpath, owner.exports),
      true,
      `${specifier} is not exported by ${owner.name}`,
    );
  }

  const tokens = manifests["@libitums/design-tokens"];
  const icons = manifests["@libitums/icons"];

  assert.equal(tokens.exports["."].import, "./dist/index.js");
  assert.equal(tokens.exports["./css/variables.css"], "./dist/css/variables.css");
  assert.equal(
    tokens.exports["./css/typography.css"],
    "./dist/css/typography.css",
  );
  assert.equal(icons.exports["./*"].default, "./dist/*.svg");
  assert.equal(
    icons.exports["./no-padding/*"].default,
    "./dist/no-padding/*.svg",
  );
  assert.equal(icons.exports["./manifest.json"], "./dist/manifest.json");
});

test("소비 가이드가 token 요청과 lockstep upgrade 기준을 포함한다", async () => {
  const guide = await readFile(
    new URL("../CONSUMING.md", import.meta.url),
    "utf8",
  );

  assert.match(guide, /## 하드코딩과 token 요청/);
  assert.match(guide, /\[FE\]\[Design-system\]/);
  assert.match(guide, /raw 값이나 의미가 다른 token/);
  assert.match(guide, /spacing\[16\]/);
  assert.doesNotMatch(guide, /spacing\.16/);
  assert.match(guide, /## Version upgrade/);
  assert.match(guide, /같은 exact version/);
  assert.match(guide, /package\.json.*lockfile/);
  assert.match(guide, /Font Delivery/);
  assert.match(guide, /font\.family\.\*.*Web용 font-family stack/);
  assert.doesNotMatch(guide, /CSS 전용 이름/);
  assert.match(guide, /accessible name/);
});

test("소비 가이드가 registry 연결과 인증 위치를 분리해 안내한다", async () => {
  const guide = await readFile(
    new URL("../CONSUMING.md", import.meta.url),
    "utf8",
  );
  const section = guide.slice(
    guide.indexOf("## Registry와 접근 권한"),
    guide.indexOf("## 설치"),
  );

  assert.notEqual(section, "", "Registry 섹션을 찾지 못했습니다");

  const committedNpmrc = section.match(/```ini\n([\s\S]*?)```/);
  assert.notEqual(committedNpmrc, null, "커밋 대상 .npmrc 예시가 없습니다");
  assert.equal(
    committedNpmrc[1].trim(),
    "@libitums:registry=https://npm.pkg.github.com",
    "저장소에 커밋하는 .npmrc 예시에 인증 항목이 들어 있습니다",
  );

  assert.match(section, /v10\.34\.2/);
  assert.match(section, /v11\.5\.3/);
  assert.match(section, /Ignored project-level auth setting/);
  assert.match(section, /`401`/);

  assert.match(
    section,
    /pnpm config set "\/\/npm\.pkg\.github\.com\/:_authToken"/,
  );
  assert.match(section, /~\/\.npmrc/);

  assert.match(section, /actions\/setup-node/);
  assert.match(section, /packages: read/);
  assert.match(section, /NODE_AUTH_TOKEN: \$\{\{ secrets\.GITHUB_TOKEN \}\}/);

  const checklist = guide.slice(guide.indexOf("## 소비 체크리스트"));
  assert.match(checklist, /저장소 `\.npmrc`에는 registry 연결만 있고/);
  assert.match(checklist, /인증이 사용자 수준 설정이나 CI의 `NODE_AUTH_TOKEN`/);
});

test("배포 package의 CSS export 경로가 생성 위치와 일치하고 icon.size 변수를 담는다", async (t) => {
  const rootDirectory = await mkdtemp(join(tmpdir(), "libitum-icon-size-"));
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));
  await cp(
    fileURLToPath(new URL("../foundations", import.meta.url)),
    join(rootDirectory, "foundations"),
    { recursive: true },
  );

  const manifests = await readPackageManifests();
  const tokens = manifests["@libitums/design-tokens"];
  const specifier = "@libitums/design-tokens/css/variables.css";
  const subpath = subpathFromSpecifier(specifier, tokens.name);

  assert.equal(isExportedSubpath(subpath, tokens.exports), true);

  const result = await writeCssVariables(rootDirectory);
  const exportedPath = join(
    rootDirectory,
    "packages",
    "design-tokens",
    tokens.exports[subpath],
  );

  assert.equal(
    result.outputFile,
    exportedPath,
    "생성 위치와 package export 대상이 어긋납니다",
  );

  const css = await readFile(exportedPath, "utf8");
  for (const step of ["xs", "sm", "md", "lg", "xl"]) {
    assert.match(css, new RegExp(`--libitum-icon-size-${step}: var\\(`));
  }
});

test("저장소 문서에 실제 인증 token 값이 없다", async () => {
  const secretPatterns = [
    /gh[pousr]_[A-Za-z0-9]{16,}/,
    /github_pat_[A-Za-z0-9_]{20,}/,
    /npm_[A-Za-z0-9]{30,}/,
  ];
  const skippedDirectories = new Set([
    ".git",
    "node_modules",
    "dist",
    "coverage",
  ]);
  const entries = await readdir(repositoryRoot, {
    recursive: true,
    withFileTypes: true,
  });
  const documents = entries.filter(
    (entry) =>
      entry.isFile() &&
      entry.name.endsWith(".md") &&
      !relative(repositoryRoot, entry.parentPath)
        .split(sep)
        .some((segment) => skippedDirectories.has(segment)),
  );

  assert.equal(documents.length > 0, true, "검사할 Markdown 문서가 없습니다");

  for (const document of documents) {
    const path = join(document.parentPath, document.name);
    const contents = await readFile(path, "utf8");
    for (const pattern of secretPatterns) {
      // 실패 메시지에 문서 본문을 싣지 않도록 boolean으로 비교합니다.
      assert.equal(
        pattern.test(contents),
        false,
        `${relative(repositoryRoot, path)}에 ${pattern} 형태의 token 값이 있습니다`,
      );
    }
  }
});
