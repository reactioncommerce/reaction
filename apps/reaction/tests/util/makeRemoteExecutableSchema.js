import { print } from "graphql";
import fetch from "node-fetch";
import { wrapSchema } from "@graphql-tools/wrap";

/**
 * @summary Creates a remote executable schema from a remote GraphQL endpoint
 * @param {String} params.baseUrl - The base URL of the remote GraphQL endpoint
 * @param {Object} params.schema - The GraphQL schema of the remote endpoint
 * @returns {Object} A remote executable schema
 */
export default function makeRemoteExecutableSchema({ baseUrl, schema }) {
  const executor = async ({ document, variables }) => {
    const query = print(document);
    const fetchResult = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query, variables })
    });
    return fetchResult.json();
  };

  const newSchema = wrapSchema({
    schema,
    executor
  });
  return newSchema;
}
