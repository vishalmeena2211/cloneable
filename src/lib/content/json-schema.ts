/**
 * The slice of JSON Schema the editor and the placeholder generator consume.
 *
 * `z.toJSONSchema()` returns a union that also admits boolean schemas, so every
 * consumer narrows through `asSchema()` rather than casting.
 */
export type JsonSchema = {
  type?: string;
  enum?: unknown[];
  properties?: Record<string, unknown>;
  items?: unknown;
  required?: string[];
  title?: string;
  description?: string;
  ui?: string;
  default?: unknown;
};

export function asSchema(value: unknown): JsonSchema {
  return typeof value === "object" && value !== null ? (value as JsonSchema) : {};
}

/** Properties of an object schema, in declaration order. */
export function properties(schema: JsonSchema): [string, JsonSchema][] {
  return Object.entries(schema.properties ?? {}).map(([key, child]) => [key, asSchema(child)]);
}

/** Human label for a field: explicit title, else a de-camelCased key. */
export function fieldLabel(key: string, schema: JsonSchema): string {
  if (schema.title) return schema.title;
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}
