#!/usr/bin/env node

import { parseOpenApiSpec } from "@amockgen/core";
import { createMockServer } from "@amockgen/mock-server";
import { Command } from "commander";
import { resolveSpecFile } from "./resolver";
import { setupWatcher } from "./watcher";

let currentServer: any = null;
let isInitialBoot = true;

function logBanner(port: number, specPath: string) {
  if (isInitialBoot) {
    console.log(`
┌────────────────────────────────────────────────────────┐
│  🚀 API Mock Server & Documentation Running            │
│                                                        │
│  • Interactive Docs:  http://localhost:${port}/docs       │
│  • Mock API Base:     http://localhost:${port}            │
│  • Spec File:         ${specPath}                        │
│  • Status:            Active                           │
└────────────────────────────────────────────────────────┘
    `);
    isInitialBoot = false;
  }
}

async function startOrReload(specPath: string, port: number) {
  if (currentServer) {
    console.log(`Parsing OpenAPI spec: ${specPath}`);
    await currentServer.close();
  } else {
    console.log(`Parsing OpenAPI spec: ${specPath}`);
  }

  const routes = await parseOpenApiSpec(specPath);
  const server = await createMockServer({
    port,
    routes,
    openApiSpecPath: specPath,
  });

  await server.listen({ port, host: "0.0.0.0" });
  currentServer = server;

  logBanner(port, specPath);
}

const program = new Command();

program
  .name("amockgen")
  .description("Zero-config stateful API mocking CLI")
  .option("-s, --spec <path>", "Path to OpenAPI spec file")
  .option("-p, --port <number>", "Port for mock server", "8083")
  .action(async (options) => {
    const port = parseInt(options.port, 10);
    const specPath = resolveSpecFile(options.spec);

    await startOrReload(specPath, port);
    setupWatcher(specPath, () => startOrReload(specPath, port));
  });

program.parse(process.argv);
