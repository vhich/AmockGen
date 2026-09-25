import { NormalizedRoute, validateSchema } from "@amockgen/core";
import { FastifyInstance } from "fastify";
import { MockStore } from "./store";

export function registerRoutes(
  app: FastifyInstance,
  routes: NormalizedRoute[],
  mockStore: MockStore,
  seedGenerator: (schema?: any) => any,
) {
  for (const route of routes) {
    const resourceName = route.path.split("/")[1] || "default";

    // Extract route-specific schema once per route
    const rawResponseSchema = route.responses?.get(200);
    const targetSchema =
      rawResponseSchema?.type === "array"
        ? rawResponseSchema.items
        : rawResponseSchema;

    // Single route-scoped callback using the passed-in seedGenerator
    const seedCallback = () => seedGenerator(targetSchema);

    app.route({
      method: route.method.toUpperCase() as any,
      url: route.path,
      handler: async (request, reply) => {
        const params = (request.params as Record<string, string>) || {};
        const body = (request.body as Record<string, any>) || {};

        // 1. Validation
        if (
          ["post", "put", "patch"].includes(route.method) &&
          route.requestBodySchema
        ) {
          const { valid, errors } = validateSchema(
            route.requestBodySchema,
            body,
          );
          if (!valid) {
            return reply.status(422).send({
              statusCode: 422,
              error: "Unprocessable Entity",
              message: "Request payload schema validation failed",
              details: errors,
            });
          }
        }

        // 2. GET
        if (route.method === "get") {
          if (params.id) {
            const list = mockStore.getCollection(resourceName, seedCallback);
            const item = list.find(
              (i: any) => String(i.id) === String(params.id),
            );
            if (!item) {
              return reply
                .status(404)
                .send({ error: "Resource not found", id: params.id });
            }
            return reply.status(200).send(item);
          }
          const list = mockStore.getCollection(resourceName, seedCallback);
          return reply.status(200).send(list);
        }

        // 3. POST
        if (route.method === "post") {
          const created = mockStore.create(resourceName, body, seedCallback);
          return reply.status(201).send(created);
        }

        // 4. PUT / PATCH
        if (["put", "patch"].includes(route.method)) {
          if (!params.id) {
            return reply
              .status(400)
              .send({ error: "Missing resource ID in path" });
          }
          const updated = mockStore.update(
            resourceName,
            params.id,
            body,
            seedCallback,
          );
          if (!updated) {
            return reply
              .status(404)
              .send({ error: "Resource not found", id: params.id });
          }
          return reply.status(200).send(updated);
        }

        // 5. DELETE
        if (route.method === "delete") {
          if (!params.id) {
            return reply
              .status(400)
              .send({ error: "Missing resource ID in path" });
          }
          const deleted = mockStore.delete(
            resourceName,
            params.id,
            seedCallback,
          );
          if (!deleted) {
            return reply
              .status(404)
              .send({ error: "Resource not found", id: params.id });
          }
          return reply.status(204).send();
        }

        return reply.status(500).send({ error: "Unsupported route method" });
      },
    });
  }
}
