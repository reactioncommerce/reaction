import nock from "nock";
import { ReactionTestAPICore } from "@reactioncommerce/api-core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import makeRemoteExecutableSchema from "../../util/makeRemoteExecutableSchema";

// This is used in URLs for testing,
// but we never actually start a service on this port.
// Don't have to worry about conflicts.
const baseUrl = "http://localhost:65123";
const schemaSDL = "type Query { unitTestRemoteGraphql: Float }";
const exSchema = makeExecutableSchema({ typeDefs: schemaSDL });
const schema = makeRemoteExecutableSchema({ baseUrl, schema: exSchema });

const testApp = new ReactionTestAPICore();

testApp.registerPlugin({
  name: "remoteGraphQL.test.js",
  graphQL: {
    schemas: [schema]
  }
});

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

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());
