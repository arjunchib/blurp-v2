// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt@0.32.0/mod.ts";

const BUILD_DIR = "./packages/node";

await emptyDir(BUILD_DIR);

await build({
  entryPoints: [
    "./src/runtimes/node.ts",
    {
      name: "./jsx-runtime",
      path: "./jsx-runtime.ts",
    },
  ],
  outDir: BUILD_DIR,
  test: false,
  // typeCheck: false,
  scriptModule: false,
  // declaration: false,
  packageManager: "pnpm",
  skipSourceOutput: true,
  // esModule: false,
  // compilerOptions: {
  //   lib: ["esnext",],
  // },
  shims: {
    timers: true,
    undici: true,
    // crypto: true,
    // see JS docs for overview and more options
    deno: true,
    // custom: [
    //   {
    //     module: "never",
    //     typesPackage: {
    //       name: "@cloudflare/workers-types",
    //       version: "4.20221111.1",
    //     },
    //     globalNames: [
    //       { name: "Request", typeOnly: true },
    //       { name: "Response", typeOnly: true },
    //       { name: "URL", typeOnly: true },
    //     ],
    //   },
    //   {
    //     module: "never",
    //     globalNames: [{ name: "Deno", typeOnly: true }],
    //   },
    // ],
  },
  mappings: {
    "https://deno.land/x/discord_api_types@0.37.17/v10.ts": {
      name: "discord-api-types",
      version: "0.37.17",
      subPath: "v10",
    },
    "https://deno.land/x/discord_api_types@0.37.17/voice/v4.ts": {
      name: "discord-api-types",
      version: "0.37.17",
      subPath: "voice/v4",
    },
    // "https://deno.land/x/discord_api_types@0.37.17/utils/internals.ts": {
    //   name: "discord-api-types",
    //   version: "0.37.17",
    //   subPath: "utils/v10",
    // },
    "./src/common.ts": "@disco/common",
  },
  package: {
    // package.json properties
    name: "@disco/node",
    version: Deno.args[0],
    description: "Your package.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/username/repo.git",
    },
    bugs: {
      url: "https://github.com/username/repo/issues",
    },
  },
});

// post build steps
// Deno.copyFileSync("LICENSE", "npm/LICENSE");
