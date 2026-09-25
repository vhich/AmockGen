import { NormalizedRoute, generateMockData } from "@amockgen/core";
import { getDocsHTML } from "@amockgen/docs-ui";
import Fastify from "fastify";
import fs from "fs";
import { formatMethod, formatStatus } from "./logger";
import { registerRoutes } from "./router";
import { MockStore } from "./store";

export interface ServerOptions {
  port: number;
  routes: NormalizedRoute[];
  openApiSpecPath: string;
}

export async function createMockServer(options: ServerOptions) {
  const app = Fastify({ logger: false });
  const mockStore = new MockStore();

  // Allow empty bodies when Content-Type is application/json (DELETE fix)
  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (req, body, done) => {
      try {
        const json = body ? JSON.parse(body as string) : {};
        done(null, json);
      } catch (err: any) {
        err.statusCode = 400;
        done(err, undefined);
      }
    },
  );

  // Request/Response Console Logger Hook [16:05:12] GET /todos - 200 OK (12ms)
  app.addHook("onRequest", (request, reply, done) => {
    (request as any).startTime = Date.now();
    done();
  });

  app.addHook("onResponse", (request, reply, done) => {
    const duration = Date.now() - ((request as any).startTime || Date.now());
    const timeStamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    const method = request.method;
    const url = request.url;
    const statusCode = reply.statusCode;
    const statusText = reply.raw.statusMessage || "";

    const formattedMethod = formatMethod(method);
    const formattedStatus = formatStatus(statusCode);

    // Ignore docs polling requests from polluting terminal logs
    if (!url.startsWith("/docs")) {
      console.log(
        `│  [\x1b[2m${timeStamp}\x1b[0m] ${formattedMethod} ${request.url} - ${formattedStatus} ${statusText} (${duration}ms)`,
      );
    }
    done();
  });

  // Register endpoints
  registerRoutes(app, options.routes, mockStore, (schema) =>
    generateMockData(schema),
  );

  // /docs UI route
  app.get("/docs", async (request, reply) => {
    reply.type("text/html").send(getDocsHTML("/docs/spec"));
  });

  // /docs/spec route for Stoplight Elements UI
  app.get("/docs/spec", async (request, reply) => {
    try {
      const specContent = fs.readFileSync(options.openApiSpecPath, "utf-8");
      reply.type("application/json").send(JSON.parse(specContent));
    } catch (err) {
      reply.status(500).send({
        error: "Failed to read OpenAPI spec file",
        path: options.openApiSpecPath,
      });
    }
  });

  return app;
}
