import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { publishedPackages } from "../src/package-publish-config.mjs";
import {
  WorkspaceLayoutValidationError,
  assertDependencyDirection,
  assertPublicPackageSpecifier,
  isAllowedDependency,
  isExportedSubpath,
  layerOrder,
  listWorkspacePackages,
  subpathFromSpecifier,
  validatePublishAllowlist,
  validateWorkspaceDependencies,
  validateWorkspaceLayout,
  workspaceDirectories,
  workspaceGlobs,
} from "../src/workspace-layout.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function createWorkspace(t) {
  const rootDirectory = await mkdtemp(join(tmpdir(), "libitum-workspace-"));
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));

  await Promise.all(
    workspaceDirectories.map((directory) =>
      mkdir(join(rootDirectory, directory.path), { recursive: true }),
    ),
  );
  await writeJson(join(rootDirectory, "package.json"), {
    name: "@libitums/design-system",
    private: true,
    workspaces: [...workspaceGlobs],
  });

  return rootDirectory;
}

async function addMember(rootDirectory, memberPath, manifest) {
  await mkdir(join(rootDirectory, memberPath), { recursive: true });
  await writeJson(join(rootDirectory, memberPath, "package.json"), manifest);
}

test("workspace glob과 계층 의존 순서를 고정한다", () => {
  assert.deepEqual(workspaceGlobs, ["packages/*", "examples/*"]);
  assert.deepEqual(layerOrder, ["source", "tooling", "packages", "examples"]);
  assert.deepEqual(
    workspaceDirectories.map((directory) => directory.path),
    [
      "foundations",
      "components",
      "assets",
      "src",
      "scripts",
      "test",
      "packages",
      "examples",
    ],
  );
  assert.deepEqual(
    workspaceDirectories
      .filter((directory) => directory.workspace)
      .map((directory) => directory.path),
    ["packages", "examples"],
  );
  assert.deepEqual(
    workspaceDirectories
      .filter((directory) => directory.publishable)
      .map((directory) => directory.path),
    ["packages"],
  );
  assert.equal(
    workspaceDirectories.find((directory) => directory.path === "src")
      .plannedPath,
    "tooling",
  );
});

test("역방향 의존을 거부한다", () => {
  assert.equal(isAllowedDependency("packages", "source"), true);
  assert.equal(isAllowedDependency("packages", "tooling"), true);
  assert.equal(isAllowedDependency("packages", "packages"), true);
  assert.equal(isAllowedDependency("examples", "packages"), true);
  assert.equal(isAllowedDependency("packages", "examples"), false);
  assert.equal(isAllowedDependency("tooling", "packages"), false);
  assert.equal(isAllowedDependency("source", "tooling"), false);

  assert.throws(
    () => assertDependencyDirection("packages", "examples"),
    /Reverse dependency is not allowed/,
  );
  assert.throws(() => isAllowedDependency("packages", "unknown"), /Unknown workspace layer/);
});

test("package 간 비공개 경로 import를 거부한다", () => {
  const manifest = {
    name: "@libitums/icons",
    exports: {
      "./heart": { default: "./heart.svg" },
      "./no-padding/*": { default: "./no-padding/*.svg" },
      "./manifest.json": "./manifest.json",
    },
  };

  assert.equal(subpathFromSpecifier("@libitums/icons", "@libitums/icons"), ".");
  assert.equal(
    subpathFromSpecifier("@libitums/icons/heart", "@libitums/icons"),
    "./heart",
  );
  assert.equal(
    subpathFromSpecifier("@libitums/design-tokens", "@libitums/icons"),
    undefined,
  );

  assert.equal(isExportedSubpath("./heart", manifest.exports), true);
  assert.equal(isExportedSubpath("./no-padding/heart", manifest.exports), true);
  assert.equal(isExportedSubpath("./manifest.json", manifest.exports), true);
  assert.equal(isExportedSubpath("./no-padding/", manifest.exports), false);
  assert.equal(isExportedSubpath("./src/internal.mjs", manifest.exports), false);

  assert.equal(isExportedSubpath(".", undefined), true);
  assert.equal(isExportedSubpath("./heart", undefined), false);
  assert.equal(isExportedSubpath(".", "./index.js"), true);
  assert.equal(isExportedSubpath(".", null), false);
  assert.equal(isExportedSubpath(".", 0), false);

  assert.throws(
    () => assertPublicPackageSpecifier("@libitums/icons/src/internal.mjs", manifest),
    /Private path import is not allowed/,
  );
  assert.doesNotThrow(() =>
    assertPublicPackageSpecifier("@libitums/icons/heart", manifest),
  );
  assert.doesNotThrow(() =>
    assertPublicPackageSpecifier("@libitums/design-tokens/css/variables.css", manifest),
  );
});

test("저장소가 workspace 계약을 만족한다", async () => {
  const result = await validateWorkspaceLayout(repositoryRoot);
  const members = await listWorkspacePackages(repositoryRoot);

  assert.equal(result.directoryCount, workspaceDirectories.length);
  assert.equal(result.publishedPackageCount, publishedPackages.length);
  assert.equal(result.packageCount, publishedPackages.length);
  assert.equal(result.exampleCount, 0);
  assert.deepEqual(
    members.map((member) => member.path),
    publishedPackages.map((definition) => definition.directory),
  );
});

test("배포 대상 package manifest가 추적되고 루트 version과 일치한다", async () => {
  const rootPackage = JSON.parse(
    await readFile(join(repositoryRoot, "package.json"), "utf8"),
  );

  for (const definition of publishedPackages) {
    const manifest = JSON.parse(
      await readFile(
        join(repositoryRoot, definition.directory, "package.json"),
        "utf8",
      ),
    );

    assert.equal(manifest.name, definition.name);
    assert.equal(
      manifest.version,
      rootPackage.version,
      `${definition.name} version must match the root package version`,
    );
    assert.notEqual(manifest.private, true);
    assert.deepEqual(manifest.files, ["dist"]);
  }
});

test("루트 package.json과 lockfile이 workspace를 선언한다", async () => {
  const [manifest, lockfile] = await Promise.all(
    ["package.json", "package-lock.json"].map(async (fileName) =>
      JSON.parse(await readFile(join(repositoryRoot, fileName), "utf8")),
    ),
  );

  assert.equal(manifest.private, true);
  assert.deepEqual(manifest.workspaces, [...workspaceGlobs]);
  assert.deepEqual(lockfile.packages[""].workspaces, [...workspaceGlobs]);
});

test("workspace 디렉터리가 없으면 실패한다", async (t) => {
  const rootDirectory = await createWorkspace(t);
  await rm(join(rootDirectory, "examples"), { recursive: true });

  await assert.rejects(
    () => validateWorkspaceLayout(rootDirectory),
    (error) => {
      assert.equal(error instanceof WorkspaceLayoutValidationError, true);
      assert.deepEqual(error.errors, [
        "Workspace path must be a directory: examples",
      ]);
      return true;
    },
  );
});

test("루트가 workspace glob을 선언하지 않으면 실패한다", async (t) => {
  const rootDirectory = await createWorkspace(t);
  await writeJson(join(rootDirectory, "package.json"), {
    name: "@libitums/design-system",
    private: false,
  });

  await assert.rejects(
    () => validateWorkspaceLayout(rootDirectory),
    (error) => {
      assert.deepEqual(error.errors, [
        'Root package.json must set "private": true',
        "Root package.json must declare workspaces packages/*, examples/*; received (none)",
      ]);
      return true;
    },
  );
});

test("examples package가 private이 아니면 실패한다", async (t) => {
  const rootDirectory = await createWorkspace(t);
  await addMember(rootDirectory, "examples/lynx-fixture", {
    name: "@libitums/example-lynx-fixture",
    version: "0.0.0",
  });

  await assert.rejects(
    () => validateWorkspaceLayout(rootDirectory),
    (error) => {
      assert.deepEqual(error.errors, [
        'examples/lynx-fixture must set "private": true',
      ]);
      return true;
    },
  );
});

test("배포 대상 package가 private이면 실패한다", async (t) => {
  const rootDirectory = await createWorkspace(t);
  await addMember(rootDirectory, "packages/icons", {
    name: "@libitums/icons",
    private: true,
    version: "0.0.0",
  });

  await assert.rejects(
    () => validateWorkspaceLayout(rootDirectory),
    (error) => {
      assert.deepEqual(error.errors, [
        'packages/icons is publishable and must not set "private": true',
      ]);
      return true;
    },
  );
});

test("package가 example에 의존하면 실패한다", async (t) => {
  const rootDirectory = await createWorkspace(t);
  await addMember(rootDirectory, "packages/icons", {
    name: "@libitums/icons",
    version: "0.0.0",
    dependencies: { "@libitums/example-lynx-fixture": "0.0.0" },
  });
  await addMember(rootDirectory, "examples/lynx-fixture", {
    name: "@libitums/example-lynx-fixture",
    private: true,
    version: "0.0.0",
  });

  await assert.rejects(
    () => validateWorkspaceLayout(rootDirectory),
    (error) => {
      assert.deepEqual(error.errors, [
        "packages/icons (packages) must not depend on examples/lynx-fixture (examples)",
      ]);
      return true;
    },
  );
});

test("example이 package에 의존하는 것은 허용한다", async (t) => {
  const rootDirectory = await createWorkspace(t);
  await addMember(rootDirectory, "packages/icons", {
    name: "@libitums/icons",
    version: "0.0.0",
  });
  await addMember(rootDirectory, "examples/lynx-fixture", {
    name: "@libitums/example-lynx-fixture",
    private: true,
    version: "0.0.0",
    devDependencies: { "@libitums/icons": "0.0.0" },
  });

  const result = await validateWorkspaceLayout(rootDirectory);

  assert.equal(result.packageCount, 1);
  assert.equal(result.exampleCount, 1);
  assert.deepEqual(
    validateWorkspaceDependencies(await listWorkspacePackages(rootDirectory)),
    [],
  );
});

test("배포는 workspace 전체가 아닌 명시적 allowlist를 사용한다", async () => {
  const [publishWorkflow, publishScript] = await Promise.all([
    readFile(join(repositoryRoot, ".github", "workflows", "publish.yml"), "utf8"),
    readFile(join(repositoryRoot, "scripts", "publish-packages.mjs"), "utf8"),
  ]);

  assert.equal(publishedPackages.length > 0, true);
  for (const definition of publishedPackages) {
    assert.equal(definition.directory.startsWith("examples/"), false);
  }

  for (const source of [publishWorkflow, publishScript]) {
    assert.doesNotMatch(source, /--workspaces\b/);
    assert.doesNotMatch(source, /\s-ws\b/);
    assert.doesNotMatch(source, /--workspace=/);
  }
  assert.match(publishWorkflow, /run: node scripts\/publish-packages\.mjs/);
});

test("배포 allowlist가 알 수 없는 경로와 배포 불가 계층을 거부한다", () => {
  assert.deepEqual(validatePublishAllowlist(), []);
  assert.deepEqual(validatePublishAllowlist([{ directory: "packages/icons" }]), []);
  assert.deepEqual(
    validatePublishAllowlist([{ directory: "dist/design-tokens" }]),
    [
      "Publish allowlist must not include an unrecognized directory: dist/design-tokens",
    ],
  );
  assert.deepEqual(validatePublishAllowlist([]), [
    "Publish allowlist must name at least one package",
  ]);
  assert.deepEqual(
    validatePublishAllowlist([{ directory: "dists/design-tokens" }]),
    [
      "Publish allowlist must not include an unrecognized directory: dists/design-tokens",
    ],
  );
  assert.deepEqual(
    validatePublishAllowlist([{ directory: "examples/lynx-fixture" }]),
    [
      "Publish allowlist must not include examples/lynx-fixture from the examples layer",
    ],
  );
});

test("루트 workspaces가 배열이 아니면 실패한다", async (t) => {
  const rootDirectory = await createWorkspace(t);
  await writeJson(join(rootDirectory, "package.json"), {
    name: "@libitums/design-system",
    private: true,
    workspaces: { packages: ["packages/*", "examples/*"] },
  });

  await assert.rejects(
    () => validateWorkspaceLayout(rootDirectory),
    (error) => {
      assert.deepEqual(error.errors, [
        'Root package.json must declare workspaces packages/*, examples/*; received {"packages":["packages/*","examples/*"]}',
      ]);
      return true;
    },
  );
});

test("package.json이 객체가 아닌 디렉터리는 workspace member로 세지 않는다", async (t) => {
  const rootDirectory = await createWorkspace(t);
  await mkdir(join(rootDirectory, "examples/not-a-package"), { recursive: true });
  await writeFile(
    join(rootDirectory, "examples/not-a-package/package.json"),
    "null\n",
    "utf8",
  );

  const result = await validateWorkspaceLayout(rootDirectory);

  assert.equal(result.exampleCount, 0);
  assert.deepEqual(await listWorkspacePackages(rootDirectory), []);
});

test("저장소 문서가 workspace 계약과 소유 경계를 기록한다", async () => {
  const [readme, agents, consuming, packagesReadme, examplesReadme] =
    await Promise.all(
      [
        "README.md",
        "AGENTS.md",
        "CONSUMING.md",
        "packages/README.md",
        "examples/README.md",
      ].map((fileName) => readFile(join(repositoryRoot, fileName), "utf8")),
    );

  assert.match(readme, /## Workspace 구조/);
  for (const source of [readme, agents]) {
    assert.match(source, /packages\//);
    assert.match(source, /examples\//);
    assert.match(source, /역방향 의존/);
    assert.match(source, /비공개 경로/);
    assert.match(source, /allowlist/);
    assert.match(source, /private: true/);
  }

  assert.match(packagesReadme, /private: true`를 설정하지 않습니다/);
  assert.match(examplesReadme, /반드시 `private: true`/);

  assert.match(consuming, /## 저장소 경계/);
  assert.match(consuming, /package 설치와 공개된 설정 연결까지/);

  for (const source of [readme, agents, consuming]) {
    assert.doesNotMatch(source, /ui-lynx/);
    assert.doesNotMatch(source, /모노레포/);
  }
});
