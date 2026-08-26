import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { packagePublishMetadata } from "../src/package-publish-config.mjs";
import {
  createPublishPlan,
  preparePublish,
} from "../src/publish-preparer.mjs";

const sha = "0123456789abcdef0123456789abcdef01234567";

async function createWorkspace(t, version = "1.2.3") {
  const rootDirectory = await mkdtemp(join(tmpdir(), "libitum-publish-"));
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));

  await writeFile(
    join(rootDirectory, "package.json"),
    `${JSON.stringify({ version })}\n`,
    "utf8",
  );
  await writeFile(
    join(rootDirectory, "package-lock.json"),
    `${JSON.stringify({ version, packages: { "": { version } } })}\n`,
    "utf8",
  );
  await writeFile(
    join(rootDirectory, "CHANGELOG.md"),
    `## [${version}] - 2026-08-26\n`,
    "utf8",
  );

  for (const [directory, name] of [
    ["design-tokens", "@libitums/design-tokens"],
    ["icons", "@libitums/icons"],
  ]) {
    const outputDirectory = join(rootDirectory, "dist", directory);
    await mkdir(outputDirectory, { recursive: true });
    await writeFile(
      join(outputDirectory, "package.json"),
      `${JSON.stringify({ name, version, ...packagePublishMetadata() })}\n`,
      "utf8",
    );
  }

  return rootDirectory;
}

test("stable은 현재 main의 release version을 latest로 준비한다", () => {
  assert.deepEqual(
    createPublishPlan({
      channel: "stable",
      defaultBranch: "main",
      refName: "main",
      rootVersion: "1.2.3",
    }),
    {
      channel: "stable",
      npmTag: "latest",
      version: "1.2.3",
    },
  );
});

test("stable은 main 외 ref와 개발 version을 거부한다", () => {
  assert.throws(
    () =>
      createPublishPlan({
        channel: "stable",
        defaultBranch: "main",
        refName: "feature",
        rootVersion: "1.2.3",
      }),
    /only be published from main/,
  );
  assert.throws(
    () =>
      createPublishPlan({
        channel: "stable",
        defaultBranch: "main",
        refName: "main",
        rootVersion: "0.0.0",
      }),
    /development version/,
  );
});

test("canary는 run과 commit이 포함된 고유 prerelease version을 만든다", () => {
  assert.deepEqual(
    createPublishPlan({
      channel: "canary",
      defaultBranch: "main",
      refName: "feature",
      rootVersion: "1.2.3",
      runNumber: "42",
      sha,
    }),
    {
      channel: "canary",
      npmTag: "canary",
      version: "1.2.3-canary.42.0123456",
    },
  );
});

test("canary 준비 시 두 package manifest version만 함께 교체한다", async (t) => {
  const rootDirectory = await createWorkspace(t);
  const result = await preparePublish(rootDirectory, {
    channel: "canary",
    defaultBranch: "main",
    refName: "feature",
    runNumber: "42",
    sha,
  });

  assert.equal(result.version, "1.2.3-canary.42.0123456");
  for (const package_ of result.packages) {
    const manifest = JSON.parse(await readFile(package_.manifestPath, "utf8"));
    assert.equal(manifest.version, result.version);
  }
});

test("stable 준비 시 version이 확정된 changelog section을 요구한다", async (t) => {
  const rootDirectory = await createWorkspace(t);
  await writeFile(join(rootDirectory, "CHANGELOG.md"), "## [Unreleased]\n", "utf8");

  await assert.rejects(
    () =>
      preparePublish(rootDirectory, {
        channel: "stable",
        defaultBranch: "main",
        refName: "main",
      }),
    /no dated 1.2.3 release section/,
  );
});

test("root package와 lockfile version이 다르면 배포를 거부한다", async (t) => {
  const rootDirectory = await createWorkspace(t);
  await writeFile(
    join(rootDirectory, "package-lock.json"),
    `${JSON.stringify({ version: "1.2.4", packages: { "": { version: "1.2.4" } } })}\n`,
    "utf8",
  );

  await assert.rejects(
    () =>
      preparePublish(rootDirectory, {
        channel: "stable",
        defaultBranch: "main",
        refName: "main",
      }),
    /versions must match/,
  );
});
