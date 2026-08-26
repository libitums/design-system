import { appendFile } from "node:fs/promises";

import {
  publishPackages,
  publishSummary,
} from "../src/npm-package-publisher.mjs";

const requiredEnvironment = [
  "GITHUB_REPOSITORY_OWNER",
  "GITHUB_STEP_SUMMARY",
  "NODE_AUTH_TOKEN",
  "NPM_TAG",
  "PUBLISH_CHANNEL",
  "PUBLISH_VERSION",
];
for (const name of requiredEnvironment) {
  if (!process.env[name]) {
    throw new Error(`${name} is required`);
  }
}

const results = await publishPackages({
  npmTag: process.env.NPM_TAG,
  version: process.env.PUBLISH_VERSION,
});
const summary = publishSummary({
  channel: process.env.PUBLISH_CHANNEL,
  npmTag: process.env.NPM_TAG,
  owner: process.env.GITHUB_REPOSITORY_OWNER,
  results,
  version: process.env.PUBLISH_VERSION,
});

await appendFile(process.env.GITHUB_STEP_SUMMARY, summary, "utf8");

for (const result of results) {
  console.log(`${result.name}@${process.env.PUBLISH_VERSION}: ${result.status}`);
}
