import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true, coerceTypes: true });
addFormats(ajv);

export function validateSchema(schema: object, data: any) {
  if (!schema || typeof schema !== "object") {
    return { valid: true, errors: [] };
  }

  const validate = ajv.compile(schema);
  const valid = validate(data);

  return {
    valid: !!valid,
    errors: validate.errors || [],
  };
}
