import {
  makeExecutableSchema,
  makeRemoteExecutableSchema
} from "graphql-tools";
import { HttpLink } from "apollo-link-http";
import fetch from "node-fetch";
import { PORT } from "../../../../../../tests/mocks/mockRemoteGraphql";

const graphqlUrl = `http://localhost:${PORT}/graphql`;
const link = new HttpLink({ uri: graphqlUrl, fetch });
const schemaSDL = "type Query { unitTestRemoteGraphql: Float }";
const exSchema = makeExecutableSchema({ typeDefs: schemaSDL });
const remoteSchema = makeRemoteExecutableSchema({ schema: exSchema, link });
export default [remoteSchema];
