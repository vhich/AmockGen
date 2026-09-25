// packages/core/src/generator/index.ts
import { faker } from "@faker-js/faker";

export function generateMockData(schema: any): any {
  if (!schema) return {};

  // If passed an array schema, unwrap to item schema
  if (schema.type === "array" && schema.items) {
    return generateMockData(schema.items);
  }

  // Handle Object schema
  if (schema.type === "object" || schema.properties) {
    const obj: Record<string, any> = {};
    const props = schema.properties || {};

    for (const [key, propSchema] of Object.entries<any>(props)) {
      obj[key] = generatePropertyValue(key, propSchema);
    }
    return obj;
  }

  return generatePropertyValue("item", schema);
}

function generatePropertyValue(key: string, schema: any): any {
  if (!schema) return faker.lorem.word();

  // Honor format or property name hints
  if (schema.format === "uuid" || key.toLowerCase().includes("id")) {
    return faker.string.uuid();
  }
  if (schema.type === "boolean" || key.toLowerCase().startsWith("is")) {
    return faker.datatype.boolean();
  }
  if (schema.type === "integer" || schema.type === "number") {
    return faker.number.int({ min: 1, max: 100 });
  }
  if (schema.type === "array") {
    return [generateMockData(schema.items || {})];
  }
  if (schema.type === "object") {
    return generateMockData(schema);
  }

  // String fallbacks based on key names
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes("name") || lowerKey.includes("title")) {
    return faker.lorem.words(3);
  }
  if (lowerKey.includes("email")) {
    return faker.internet.email();
  }
  if (
    lowerKey.includes("description") ||
    lowerKey.includes("task") ||
    lowerKey.includes("summary") ||
    lowerKey.includes("details") ||
    lowerKey.includes("detail") ||
    lowerKey.includes("content") ||
    lowerKey.includes("body")
  ) {
    return faker.lorem.sentence();
  }

  return faker.lorem.word();
}
