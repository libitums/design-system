import { appendFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { preparePublish } from "../src/publish-preparer.mjs";

const rootDirectory = fileURLToPath(new URL("..", import.meta.url));
const outputFile = process.env.GITHUB_OUTPUT;
if (!outputFile) {
  throw new Error("GITHUB_OUTPUT is required");
}

const result = await preparePublish(rootDirectory, {
  channel: process.env.PUBLISH_CHANNEL,
  defaultBranch: process.env.DEFAULT_BRANCH,
  refName: process.env.GITHUB_REF_NAME,
  runNumber: process.env.GITHUB_RUN_NUMBER,
  sha: process.env.GITHUB_SHA,
});

await appendFile(
  outputFile,
  [`channel=${result.channel}`, `npm_tag=${result.npmTag}`, `version=${result.version}`, ""].join(
    "\n",
  ),
  "utf8",
);

console.log(
  `Prepared ${result.packages.length} packages for ${result.channel} ${result.version} with dist-tag ${result.npmTag}.`,
);
