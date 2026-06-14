export function inferSchema(doc: any) {
  const schema: Record<string, string> = {};

  function walk(obj: any, prefix = "") {
    for (const key in obj) {
      const value = obj[key];

      const path = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        walk(value, path);
      } else {
        schema[path] = Array.isArray(value) ? "array" : typeof value;
      }
    }
  }

  walk(doc);

  return schema;
}
