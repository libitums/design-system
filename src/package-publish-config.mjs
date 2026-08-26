export const npmRegistry = "https://npm.pkg.github.com";

export const packageRepository = Object.freeze({
  type: "git",
  url: "https://github.com/libitums/design-system.git",
});

export const publishedPackages = Object.freeze([
  Object.freeze({
    directory: "dist/design-tokens",
    name: "@libitums/design-tokens",
    pageSlug: "design-tokens",
  }),
  Object.freeze({
    directory: "dist/icons",
    name: "@libitums/icons",
    pageSlug: "icons",
  }),
]);

export function packagePublishMetadata() {
  return {
    repository: { ...packageRepository },
    publishConfig: {
      access: "restricted",
      registry: npmRegistry,
    },
  };
}
