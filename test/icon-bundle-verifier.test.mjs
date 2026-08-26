import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  IconBundleVerificationError,
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
      svgModules: ["asset|/fixture/node_modules/@libitum/icons/heart.svg"],
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

test("module·payload·산출물·raw/gzip 기준을 모두 만족하면 통과한다", () => {
  const measurement = validMeasurement();
  assert.equal(evaluateIconBundleMeasurement(measurement), measurement);
});

test("미사용 아이콘 포함과 budget 초과를 구분해 실패 처리한다", () => {
  const measurement = validMeasurement();
  measurement.singleIcon.containsUnusedPayload = true;
  measurement.singleIcon.svgModules.push(
    "asset|/fixture/node_modules/@libitum/icons/arrow-down.svg",
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

  assert.equal(result.sourceBytes, 310);
  assert.equal(result.singleIcon.svgModules.length, 1);
  assert.equal(result.singleIcon.containsRepresentativePayload, true);
  assert.equal(result.singleIcon.containsUnusedPayload, false);
  assert.equal(result.delta.rawBytes <= result.budgets.rawBytes, true);
  assert.equal(result.delta.gzipBytes <= result.budgets.gzipBytes, true);
});
