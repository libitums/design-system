import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

test("수동 stable·canary 배포 workflow의 권한과 보호 조건을 고정한다", async () => {
  const workflow = (
    await readFile(
      join(repositoryRoot, ".github", "workflows", "publish.yml"),
      "utf8",
    )
  ).replaceAll("\r\n", "\n");

  assert.match(workflow, /^on:\n  workflow_dispatch:/m);
  assert.match(workflow, /^          - canary\n          - stable$/m);
  assert.match(workflow, /^permissions:\n  contents: read\n  packages: write$/m);
  assert.match(workflow, /^  cancel-in-progress: false$/m);
  assert.match(workflow, /^        if: inputs\.channel == 'stable'$/m);
  assert.match(workflow, /test "\$GITHUB_SHA" = "\$\(git rev-parse FETCH_HEAD\)"/);
  assert.match(workflow, /^          registry-url: https:\/\/npm\.pkg\.github\.com$/m);
  assert.match(workflow, /^          scope: '@libitum'$/m);
  assert.match(workflow, /^          NODE_AUTH_TOKEN: \$\{\{ secrets\.GITHUB_TOKEN \}\}$/m);
  assert.match(workflow, /^        run: node scripts\/prepare-publish\.mjs$/m);
  assert.match(workflow, /^        run: node scripts\/publish-packages\.mjs$/m);
  for (const command of [
    "npm run validate",
    "npm test",
    "npm run build",
    "npm run check:generated",
    "npm run check:icon-bundle",
  ]) {
    assert.match(workflow, new RegExp(`^        run: ${command}$`, "m"));
  }
  assert.match(workflow, /^  release:\n    name: Create stable release$/m);
  assert.match(workflow, /^    permissions:\n      contents: write$/m);
  assert.match(workflow, /gh release create/);
});
