import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  ExampleConsumerVerificationError,
  classifySpecifiers,
  evaluateExampleConsumerMeasurement,
  exampleConsumerPolicy,
  extractPackageSpecifiers,
} from "../src/example-consumer-verifier.mjs";
import { publishedPackages } from "../src/package-publish-config.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

const manifests = [
  {
    name: "@libitums/design-tokens",
    exports: {
      ".": { import: "./dist/index.js" },
      "./css/variables.css": "./dist/css/variables.css",
    },
  },
  {
    name: "@libitums/icons",
    exports: {
      "./lynx": { default: "./dist/lynx/index.js" },
      "./lynx/*": { default: "./dist/lynx/*.js" },
    },
  },
];

function validMeasurement() {
  return {
    emittedFiles: [{ path: "main.lynx.bundle", rawBytes: 122512 }],
    missingMarkers: [],
    privateSpecifiers: [],
    publicSpecifiers: ["@libitums/design-tokens", "@libitums/icons/lynx/heart"],
  };
}

test("소스에서 design-system package 경로만 골라낸다", () => {
  const source = [
    'import { color } from "@libitums/design-tokens";',
    'import heart from "@libitums/icons/lynx/heart";',
    'import "@libitums/design-tokens/css/variables.css";',
    'import "./App.css";',
    'import { root } from "@lynx-js/react";',
    'export { withIconColor } from "@libitums/icons/lynx";',
    'const lazy = await import("@libitums/icons/lynx/no-padding/heart");',
  ].join("\n");

  assert.deepEqual(extractPackageSpecifiers(source), [
    "@libitums/design-tokens",
    "@libitums/design-tokens/css/variables.css",
    "@libitums/icons/lynx",
    "@libitums/icons/lynx/heart",
    "@libitums/icons/lynx/no-padding/heart",
  ]);
});

test("같은 경로를 여러 번 import해도 한 번만 센다", () => {
  const source = [
    'import heart from "@libitums/icons/lynx/heart";',
    'import again from "@libitums/icons/lynx/heart";',
  ].join("\n");

  assert.deepEqual(extractPackageSpecifiers(source), [
    "@libitums/icons/lynx/heart",
  ]);
});

test("공개 export가 아닌 경로와 소유자 없는 경로를 구분해 보고한다", () => {
  const result = classifySpecifiers(
    [
      "@libitums/design-tokens",
      "@libitums/design-tokens/css/variables.css",
      "@libitums/icons/lynx/heart",
      "@libitums/design-tokens/dist/index.js",
      "@libitums/example-lynx-consumer",
    ],
    manifests,
  );

  assert.deepEqual(result.publicSpecifiers, [
    "@libitums/design-tokens",
    "@libitums/design-tokens/css/variables.css",
    "@libitums/icons/lynx/heart",
  ]);
  assert.deepEqual(result.privateSpecifiers, [
    "@libitums/design-tokens/dist/index.js is not an export of @libitums/design-tokens",
    "@libitums/example-lynx-consumer is not owned by a published package",
  ]);
});

test("공개 경로 import와 산출물 marker를 모두 만족하면 통과한다", () => {
  const measurement = validMeasurement();
  assert.equal(
    evaluateExampleConsumerMeasurement(measurement),
    measurement,
  );
});

test("비공개 경로 사용과 marker 누락을 각각 실패 처리한다", () => {
  const measurement = validMeasurement();
  measurement.privateSpecifiers = [
    "@libitums/icons/dist/heart.svg is not an export of @libitums/icons",
  ];
  measurement.missingMarkers = ["brand color token", "padding icon XML"];

  assert.throws(
    () => evaluateExampleConsumerMeasurement(measurement),
    (error) => {
      assert.equal(error instanceof ExampleConsumerVerificationError, true);
      assert.equal(error.errors.length, 3);
      assert.match(error.message, /non-public path: @libitums\/icons\/dist\/heart\.svg/);
      assert.match(error.message, /missing the brand color token/);
      assert.match(error.message, /missing the padding icon XML/);
      return true;
    },
  );
});

test("package를 하나도 import하지 않은 fixture를 실패 처리한다", () => {
  const measurement = validMeasurement();
  measurement.publicSpecifiers = [];
  measurement.emittedFiles = [];

  assert.throws(
    () => evaluateExampleConsumerMeasurement(measurement),
    (error) => {
      assert.equal(error.errors.length, 2);
      assert.match(error.message, /must import at least one design-system package path/);
      assert.match(error.message, /build emitted no files/);
      return true;
    },
  );
});

// 실제 build 검증은 `npm run check:example-consumer`가 단독 process로 수행합니다.
// packages/*/dist를 다시 생성하므로 병렬 test file에서 함께 돌리면
// 같은 디렉터리를 재작성하는 다른 검증과 충돌합니다.
test("fixture가 공개 경로만 import한다", async () => {
  const sourceDirectory = join(
    repositoryRoot,
    exampleConsumerPolicy.directory,
    exampleConsumerPolicy.sourceDirectory,
  );
  const files = (await readdir(sourceDirectory, { recursive: true })).filter(
    (file) => /\.(?:jsx?|css)$/.test(file),
  );
  const sources = await Promise.all(
    files.map((file) => readFile(join(sourceDirectory, file), "utf8")),
  );
  const packageManifests = await Promise.all(
    publishedPackages.map(async (definition) =>
      JSON.parse(
        await readFile(
          join(repositoryRoot, definition.directory, "package.json"),
          "utf8",
        ),
      ),
    ),
  );
  const { publicSpecifiers, privateSpecifiers } = classifySpecifiers(
    extractPackageSpecifiers(sources.join("\n")),
    packageManifests,
  );

  assert.deepEqual(privateSpecifiers, []);
  assert.deepEqual(publicSpecifiers, [
    "@libitums/design-tokens",
    "@libitums/design-tokens/css/typography.css",
    "@libitums/design-tokens/css/variables.css",
    "@libitums/icons/lynx",
    "@libitums/icons/lynx/heart",
    "@libitums/icons/lynx/no-padding/heart",
  ]);
});
