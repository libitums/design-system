import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  IconBundleVerificationError,
  assertSuccessfulBuildStats,
  calculateIconBundleBudgets,
  evaluateIconBundleMeasurement,
  verifyIconBundle,
} from "../src/icon-bundle-verifier.mjs";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

function validMeasurement() {
  return {
    baseline: {
      containsRepresentativePayload: false,
      containsUnusedPayload: false,
      files: [{ path: "static/js/main.js", rawBytes: 50, gzipBytes: 70 }],
      gzipBytes: 70,
      rawBytes: 50,
      svgModules: [],
    },
    budgets: { rawBytes: 544, gzipBytes: 438 },
    delta: { rawBytes: 442, gzipBytes: 332 },
    singleIcon: {
      containsRepresentativePayload: true,
      containsUnusedPayload: false,
      files: [{ path: "static/js/main.js", rawBytes: 492, gzipBytes: 402 }],
      gzipBytes: 402,
      rawBytes: 492,
      svgModules: ["asset|/fixture/node_modules/@libitums/icons/dist/heart.svg"],
    },
    sourceBytes: 310,
  };
}

test("base64 인라인과 wrapper 여유를 원본 크기 기반 budget으로 계산한다", () => {
  assert.deepEqual(calculateIconBundleBudgets(310), {
    rawBytes: 544,
    gzipBytes: 438,
  });
});

test("Rspeedy compilation 오류를 산출물 검증 전에 보고한다", () => {
  assert.throws(
    () =>
      assertSuccessfulBuildStats(
        {
          hasErrors: () => true,
          toString: () => "Module not found: ./missing.svg",
        },
        "single-icon",
      ),
    /Rspeedy build failed for single-icon:\nModule not found: \.\/missing\.svg/,
  );
});

test("module·payload·산출물·raw/gzip 기준을 모두 만족하면 통과한다", () => {
  const measurement = validMeasurement();
  assert.equal(evaluateIconBundleMeasurement(measurement), measurement);
});

test("미사용 아이콘 포함과 budget 초과를 구분해 실패 처리한다", () => {
  const measurement = validMeasurement();
  measurement.singleIcon.containsUnusedPayload = true;
  measurement.singleIcon.svgModules.push(
    "asset|/fixture/node_modules/@libitums/icons/dist/arrow-down.svg",
  );
  measurement.delta = { rawBytes: 545, gzipBytes: 439 };

  assert.throws(
    () => evaluateIconBundleMeasurement(measurement),
    (error) => {
      assert.equal(error instanceof IconBundleVerificationError, true);
      assert.equal(error.errors.length, 4);
      assert.match(error.message, /must contain only heart\.svg/);
      assert.match(error.message, /contains unused arrow-down\.svg/);
      assert.match(error.message, /raw bundle delta 545B exceeds 544B/);
      assert.match(error.message, /gzip bundle delta 439B exceeds 438B/);
      return true;
    },
  );
});

test("현재 package의 단일 아이콘 Rspeedy production bundle을 검증한다", async () => {
  const result = await verifyIconBundle(repositoryRoot);

  assert.equal(typeof result.sourceBytes, "number");
  assert.ok(result.sourceBytes > 0);
  assert.deepEqual(
    result.budgets,
    calculateIconBundleBudgets(result.sourceBytes),
  );
  assert.equal(result.singleIcon.svgModules.length, 1);
  assert.equal(result.singleIcon.containsRepresentativePayload, true);
  assert.equal(result.singleIcon.containsUnusedPayload, false);
  assert.equal(result.delta.rawBytes <= result.budgets.rawBytes, true);
  assert.equal(result.delta.gzipBytes <= result.budgets.gzipBytes, true);
});

test("Lynx build가 XML을 인라인하지 않거나 asset module을 끌어오면 실패한다", () => {
  const base = {
    baseline: { svgModules: [], containsRepresentativePayload: false, containsUnusedPayload: false, files: [{ path: "static/js/main.js" }] },
    budgets: { gzipBytes: 1000, rawBytes: 1000 },
    delta: { gzipBytes: 0, rawBytes: 0 },
    singleIcon: {
      containsRepresentativePayload: true,
      containsUnusedPayload: false,
      files: [{ path: "static/js/main.js" }],
      svgModules: ["asset|/fixture/node_modules/@libitums/icons/dist/heart.svg"],
    },
  };
  const lynxIcon = {
    containsRepresentativeXml: true,
    containsUnusedXml: false,
    svgModules: [],
  };

  assert.doesNotThrow(() =>
    evaluateIconBundleMeasurement({ ...base, lynxIcon }),
  );
  assert.throws(
    () =>
      evaluateIconBundleMeasurement({
        ...base,
        lynxIcon: { ...lynxIcon, containsRepresentativeXml: false },
      }),
    /does not inline the heart SVG XML/,
  );
  assert.throws(
    () =>
      evaluateIconBundleMeasurement({
        ...base,
        lynxIcon: { ...lynxIcon, containsUnusedXml: true },
      }),
    /contains unused arrow-down SVG XML/,
  );
  assert.throws(
    () =>
      evaluateIconBundleMeasurement({
        ...base,
        lynxIcon: { ...lynxIcon, svgModules: ["asset|heart.svg"] },
      }),
    /must not pull SVG asset modules/,
  );
});
