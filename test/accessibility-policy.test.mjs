import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const accessibility = await readFile(
  new URL("../foundations/accessibility.md", import.meta.url),
  "utf8",
);
const button = await readFile(
  new URL("../components/button.md", import.meta.url),
  "utf8",
);

test("Brand Button의 primary/white 대비 예외 범위를 문서 계약으로 고정한다", () => {
  assert.match(accessibility, /Brand Button/);
  assert.match(accessibility, /`brand\.primary` #F46B18/);
  assert.match(accessibility, /`white` #FFFFFF/);
  assert.match(accessibility, /3\.016:1/);
  assert.match(accessibility, /Default.*Pressed.*Loading/s);
  assert.match(accessibility, /승인된 예외/);
  assert.match(accessibility, /WCAG 2\.2 Level AA를 충족한 것으로 기록하지 않습니다/);
  assert.match(accessibility, /그 밖의.*4\.5:1.*실패/s);
});

test("Brand Button 스펙은 새 accent 토큰 없이 primary와 white를 사용한다", () => {
  assert.doesNotMatch(button, /background\.accent/);
  assert.match(button, /\| Default \| `brand\.primary` #F46B18 \| `white` #FFFFFF \| — \|/);
  assert.match(button, /\| Pressed \| `brand\.primary` #F46B18 \| `white` #FFFFFF \| — \|/);
  assert.match(
    button,
    /\| Loading \| `brand\.primary` #F46B18 \| `white` #FFFFFF \| `white` #FFFFFF \|/,
  );
});
