import { HttpLink } from "apollo-link-http";
import {
  makeExecutableSchema,
  makeRemoteExecutableSchema
} from "graphql-tools";
import fetch from "node-fetch";
import TestApp from "/tests/util/TestApp.js";

// This is used in URLs for testing,
// but we never actually start a service on this port.
// Don't have to worry about conflicts.
const baseUrl = "http://localhost:65123";
const link = new HttpLink({ uri: baseUrl, fetch });
const schemaSDL = "type Query { unitTestRemoteGraphql: Float }";
const exSchema = makeExecutableSchema({ typeDefs: schemaSDL });
const schema = makeRemoteExecutableSchema({ schema: exSchema, link });

const testApp = new TestApp();

testApp.registerPlugin({
  name: "remoteGraphQL.test.js",
  graphQL: {
    schemas: [schema]
  }
});

jest.setTimeout(300000);

test("should not be able to register a remote executable schema", async () => {
  try {
    await testApp.start();
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());
