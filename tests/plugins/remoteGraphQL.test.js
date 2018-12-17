import nock from "nock";
import TestApp from "../TestApp";
import { baseUrl } from "../../imports/plugins/unit-test/remote-graphql/server/no-meteor/schemas";

const testApp = new TestApp();

beforeAll(async () => {
  await testApp.start();
});

test("plugin with remote graphQL should delegate properly", async () => {
  nock(baseUrl)
    .post("/")
    .reply(200, { data: { unitTestRemoteGraphql: 43.43 } });
  const res = await testApp.query("{unitTestRemoteGraphql}")();
  expect(res).toHaveProperty("unitTestRemoteGraphql", 43.43);
});

afterAll(() => {
  testApp.stop();
});
