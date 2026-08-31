import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";

import {
  packagePageUrl,
  packageVersionExists,
  publishPackages,
  publishSummary,
} from "../src/npm-package-publisher.mjs";

const packages = [
  {
    directory: "/tmp/design-tokens",
    name: "@libitums/design-tokens",
    pageSlug: "design-tokens",
  },
  {
    directory: "/tmp/icons",
    name: "@libitums/icons",
    pageSlug: "icons",
  },
];

function notFound() {
  return Object.assign(new Error("missing"), { stderr: "npm error code E404" });
}

test("registry의 404만 미배포 version으로 판정한다", async () => {
  assert.equal(
    await packageVersionExists("@libitums/icons", "1.2.3", {
      execute: async () => {
        throw notFound();
      },
    }),
    false,
  );

  await assert.rejects(
    () =>
      packageVersionExists("@libitums/icons", "1.2.3", {
        execute: async () => {
          throw Object.assign(new Error("forbidden"), { stderr: "npm error E403" });
        },
      }),
    /Could not check/,
  );
});

test("조회가 모두 끝난 뒤 없는 package만 publish한다", async () => {
  const calls = [];
  const execute = async (arguments_) => {
    calls.push(arguments_);
    if (arguments_[0] === "view") {
      if (arguments_[1].startsWith("@libitums/icons@")) {
        return { stdout: '"1.2.3"\n' };
      }
      throw notFound();
    }
    return { stdout: "" };
  };

  const results = await publishPackages({
    execute,
    npmTag: "latest",
    packages,
    version: "1.2.3",
  });

  assert.deepEqual(
    results.map(({ name, status }) => ({ name, status })),
    [
      { name: "@libitums/design-tokens", status: "published" },
      { name: "@libitums/icons", status: "already-published" },
    ],
  );
  assert.equal(calls.filter(([command]) => command === "view").length, 2);
  assert.deepEqual(
    calls.slice(0, 2).map(([command]) => command),
    ["view", "view"],
  );
  assert.deepEqual(
    calls.filter(([command]) => command === "publish"),
    [
      [
        "publish",
        "/tmp/design-tokens",
        "--tag=latest",
        "--registry=https://npm.pkg.github.com",
        "--access=restricted",
      ],
    ],
  );
});

test("상대 package directory를 절대 local 경로로 배포한다", async () => {
  const calls = [];
  const execute = async (arguments_) => {
    calls.push(arguments_);
    if (arguments_[0] === "view") {
      throw notFound();
    }
    return { stdout: "" };
  };
  const rootDirectory = "/workspace/design-system";

  await publishPackages({
    execute,
    npmTag: "canary",
    packages: [
      {
        directory: "packages/design-tokens",
        name: "@libitums/design-tokens",
        pageSlug: "design-tokens",
      },
    ],
    rootDirectory,
    version: "0.0.0-canary.1.0123456",
  });

  const publishCall = calls.find(([command]) => command === "publish");
  assert.equal(
    publishCall[1],
    resolve(rootDirectory, "packages/design-tokens"),
  );
});

test("같은 version이 모두 존재하면 npm publish를 실행하지 않는다", async () => {
  const calls = [];
  const execute = async (arguments_) => {
    calls.push(arguments_);
    return { stdout: '"1.2.3"\n' };
  };

  const results = await publishPackages({
    execute,
    npmTag: "latest",
    packages,
    version: "1.2.3",
  });

  assert.equal(calls.filter(([command]) => command === "publish").length, 0);
  assert.deepEqual(
    results.map(({ status }) => status),
    ["already-published", "already-published"],
  );
});

test("배포 summary에 package URL, version과 결과를 남긴다", () => {
  const results = packages.map((package_) => ({
    ...package_,
    status: "published",
  }));
  const summary = publishSummary({
    channel: "canary",
    npmTag: "canary",
    owner: "libitums",
    results,
    version: "1.2.3-canary.42.0123456",
  });

  assert.equal(
    packagePageUrl("libitums", packages[0]),
    "https://github.com/orgs/libitums/packages/npm/package/design-tokens",
  );
  assert.match(summary, /Version: `1\.2\.3-canary\.42\.0123456`/);
  assert.match(summary, /package\/design-tokens/);
  assert.match(summary, /package\/icons/);
  assert.match(summary, /published/);
});
