export function generateGraphQLQuery(collection, schema) {
    const fields = Object.keys(schema).filter((x) => !x.includes("."));
    return `
query {
  ${collection} {
    ${fields.join("\n    ")}
  }
}
`;
}
