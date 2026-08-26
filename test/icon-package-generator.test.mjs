import assert from "node:assert/strict";
import { createRequire } from "node:module";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  generateIconPackage,
  toIconExportName,
  writeIconPackage,
} from "../src/icon-package-generator.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

function svg(viewBox = "0 0 10 10") {
  return `<svg width="24" height="24" viewBox="${viewBox}" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M1 1h8v8H1z"/></svg>`;
}

async function createWorkspace(t, icons) {
  const rootDirectory = await mkdtemp(join(tmpdir(), "libitum-icons-"));
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));
  await writeFile(
    join(rootDirectory, "package.json"),
    `${JSON.stringify({ version: "1.2.3" })}\n`,
    "utf8",
  );

  for (const [path, contents] of Object.entries(icons)) {
    const [category, fileName] = path.split("/");
    for (const [variant, viewBox] of [
      ["padding", "0 0 10 10"],
      ["no-padding", "1 1 8 8"],
    ]) {
      const directory = join(
        rootDirectory,
        "assets",
        "icons",
        variant,
        category,
      );
      await mkdir(directory, { recursive: true });
      await writeFile(
        join(directory, fileName),
        contents ?? svg(viewBox),
        "utf8",
      );
    }
  }

  return rootDirectory;
}

test("아이콘 파일명을 안전한 lowercase kebab-case export 이름으로 변환한다", () => {
  assert.equal(toIconExportName("heart-break-02.svg"), "heart-break-02");
  assert.equal(toIconExportName("A-to-Z.svg"), "a-to-z");
  assert.equal(toIconExportName("Diamond-02"), "diamond-02");
  assert.equal(toIconExportName("My Icon.svg"), "my-icon");
  assert.throws(
    () => toIconExportName("123.svg"),
    /Cannot create a safe icon export name/,
  );
});

test("현재 815개 아이콘을 충돌 없는 개별 export로 생성한다", async () => {
  const result = await generateIconPackage(repositoryRoot);
  const packageManifest = JSON.parse(result.packageManifest);
  const manifest = JSON.parse(result.manifest);

  assert.equal(result.icons.length, 815);
  assert.equal(new Set(result.icons.map((icon) => icon.exportName)).size, 815);
  assert.equal(manifest.icons.length, 815);
  assert.equal(packageManifest.name, "@libitums/icons");
  assert.equal(packageManifest.version, "0.0.0");
  assert.equal(packageManifest.sideEffects, false);
  assert.deepEqual(packageManifest.repository, {
    type: "git",
    url: "https://github.com/libitums/design-system.git",
  });
  assert.deepEqual(packageManifest.publishConfig, {
    access: "restricted",
    registry: "https://npm.pkg.github.com",
  });
  assert.deepEqual(packageManifest.files, [
    "*.svg",
    "no-padding",
    "manifest.json",
    "svg.d.ts",
  ]);
  assert.equal(Object.keys(packageManifest.exports).length, 1632);
  assert.deepEqual(
    result.icons
      .filter((icon) => /[A-Z]/.test(icon.sourceName))
      .map(({ exportName, sourceName }) => ({ exportName, sourceName })),
    [
      { exportName: "a-to-z", sourceName: "A-to-Z" },
      { exportName: "diamond-02", sourceName: "Diamond-02" },
      { exportName: "dumbbell", sourceName: "Dumbbell" },
      { exportName: "dumbbell-02", sourceName: "Dumbbell-02" },
    ],
  );
  assert.deepEqual(packageManifest.exports["./heart"], {
    types: "./svg.d.ts",
    default: "./heart.svg",
  });
  assert.deepEqual(packageManifest.exports["./no-padding/heart"], {
    types: "./svg.d.ts",
    default: "./no-padding/heart.svg",
  });
  assert.deepEqual(
    manifest.icons.find((icon) => icon.name === "heart"),
    {
      name: "heart",
      sourceName: "heart",
      category: "1-game",
      variants: {
        padding: "./heart",
        "no-padding": "./no-padding/heart",
      },
    },
  );
});

test("padding 기본 경로와 no-padding 별도 경로를 실제 package에서 해석한다", async (t) => {
  const rootDirectory = await createWorkspace(t, {
    "1-game/Heart.svg": undefined,
    "8-ui/arrow-down.svg": undefined,
  });
  const result = await writeIconPackage(rootDirectory);
  const packageDirectory = join(
    rootDirectory,
    "node_modules",
    "@libitums",
    "icons",
  );
  await cp(result.outputDirectory, packageDirectory, { recursive: true });

  const require = createRequire(join(rootDirectory, "consumer.cjs"));
  const paddingPath = require.resolve("@libitums/icons/heart");
  const noPaddingPath = require.resolve("@libitums/icons/no-padding/heart");

  assert.equal(
    paddingPath,
    await realpath(join(packageDirectory, "heart.svg")),
  );
  assert.equal(
    noPaddingPath,
    await realpath(join(packageDirectory, "no-padding", "heart.svg")),
  );
  assert.match(await readFile(paddingPath, "utf8"), /viewBox="0 0 10 10"/);
  assert.match(await readFile(noPaddingPath, "utf8"), /viewBox="1 1 8 8"/);
  assert.equal(result.svgFileCount, 4);
});

test("정규화 후 같은 export 이름이 되는 아이콘은 생성에 실패한다", async (t) => {
  const rootDirectory = await createWorkspace(t, {
    "1-game/my_icon.svg": undefined,
    "8-ui/my-icon.svg": undefined,
  });

  await assert.rejects(
    () => generateIconPackage(rootDirectory),
    /Icon export name collision: .* both map to my-icon/,
  );
});
