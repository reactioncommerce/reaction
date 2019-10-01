import { HttpLink } from "apollo-link-http";
import {
  makeExecutableSchema,
  makeRemoteExecutableSchema
} from "graphql-tools";
import fetch from "node-fetch";
import nock from "nock";
import TestApp from "/imports/test-utils/helpers/TestApp";

// This is used in URLs for testing,
// but we never actually start a service on this port.
// Don't have to worry about conflicts.
const baseUrl = "http://localhost:65123";
const link = new HttpLink({ uri: baseUrl, fetch });
const schemaSDL = "type Query { unitTestRemoteGraphql: Float }";
const exSchema = makeExecutableSchema({ typeDefs: schemaSDL });
const schema = makeRemoteExecutableSchema({ schema: exSchema, link });

const testApp = new TestApp({ extraSchemas: [schema] });

jest.setTimeout(300000);

beforeAll(async () => {
  await testApp.start();
});

test("plugin with remote graphQL should delegate properly", async () => {
  const graphql = "{unitTestRemoteGraphql}";
  nock(baseUrl)
    .post("/", (body) => body.query.includes("unitTestRemoteGraphql"))
    .reply(200, { data: { unitTestRemoteGraphql: 43.43 } });
  const res = await testApp.query(graphql)();
  expect(res).toHaveProperty("unitTestRemoteGraphql", 43.43);
});

afterAll(() => testApp.stop());
