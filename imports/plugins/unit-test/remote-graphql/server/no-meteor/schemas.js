import {
  makeExecutableSchema,
  makeRemoteExecutableSchema
} from "graphql-tools";
import { HttpLink } from "apollo-link-http";
import fetch from "node-fetch";

// This is used in URLs for testing,
// but we never actually start a service on this port.
// Don't have to worry about conflicts.
export const baseUrl = "http://localhost:65123";

const link = new HttpLink({ uri: baseUrl, fetch });
const schemaSDL = "type Query { unitTestRemoteGraphql: Float }";
const exSchema = makeExecutableSchema({ typeDefs: schemaSDL });
const remoteSchema = makeRemoteExecutableSchema({ schema: exSchema, link });
export default [remoteSchema];
