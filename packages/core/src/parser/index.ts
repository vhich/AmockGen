import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPI } from "openapi-types";

export interface NormalizedRoute {
  path: string;
  method: "get" | "post" | "put" | "delete" | "patch";
  operationId?: string;
  summary?: string;
  parameters: {
    path: Array<{ name: string; schema: object }>;
    query: Array<{ name: string; schema: object; required: boolean }>;
  };
  requestBodySchema?: any;
  responses: Map<number, any>;
}

export async function parseOpenApiSpec(
  filePath: string,
): Promise<NormalizedRoute[]> {
  const api = (await SwaggerParser.dereference(filePath)) as OpenAPI.Document;
  const routes: NormalizedRoute[] = [];

  if (!api.paths) return routes;

  for (const [rawPath, pathItem] of Object.entries(api.paths)) {
    if (!pathItem) continue;

    // Convert OpenAPI path syntax /todos/{id} -> Fastify syntax /todos/:id
    const fastifyPath = rawPath.replace(/\{([^}]+)\}/g, ":$1");

    const methods: Array<"get" | "post" | "put" | "delete" | "patch"> = [
      "get",
      "post",
      "put",
      "delete",
      "patch",
    ];

    for (const method of methods) {
      const operation = (pathItem as any)[method];
      if (!operation) continue;

      const pathParams: Array<{ name: string; schema: object }> = [];
      const queryParams: Array<{
        name: string;
        schema: object;
        required: boolean;
      }> = [];

      const allParams = [
        ...(pathItem.parameters || []),
        ...(operation.parameters || []),
      ];
      for (const param of allParams) {
        if ("$ref" in param) continue;
        if (param.in === "path") {
          pathParams.push({ name: param.name, schema: param.schema || {} });
        } else if (param.in === "query") {
          queryParams.push({
            name: param.name,
            schema: param.schema || {},
            required: !!param.required,
          });
        }
      }

      let requestBodySchema: any = null;
      if (operation.requestBody && "content" in operation.requestBody) {
        requestBodySchema =
          operation.requestBody.content?.["application/json"]?.schema || null;
      }

      const responsesMap = new Map<number, any>();
      if (operation.responses) {
        for (const [statusCode, respObj] of Object.entries(
          operation.responses,
        )) {
          const code = parseInt(statusCode, 10);
          if (
            !isNaN(code) &&
            (respObj as any).content?.["application/json"]?.schema
          ) {
            responsesMap.set(
              code,
              (respObj as any).content["application/json"].schema,
            );
          }
        }
      }

      routes.push({
        path: fastifyPath,
        method,
        operationId: operation.operationId,
        summary: operation.summary,
        parameters: { path: pathParams, query: queryParams },
        requestBodySchema,
        responses: responsesMap,
      });
    }
  }

  return routes;
}
