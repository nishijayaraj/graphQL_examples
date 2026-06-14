export function generateGraphQLQuery(collection: string, schema: any) {
  const fields = Object.keys(schema).filter((x) => !x.includes("."));

  return `
query {
  ${collection} {
    ${fields.join("\n    ")}
  }
}
`;
}
