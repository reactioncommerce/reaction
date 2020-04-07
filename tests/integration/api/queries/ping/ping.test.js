import { ReactionAPICore } from "@reactioncommerce/api-core";

jest.setTimeout(300000);

let pingQuery;
let testApp;
beforeAll(async () => {
  testApp = new ReactionAPICore();
  await testApp.start();

  pingQuery = testApp.query(`query {
  ping
}`);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("simple test ping", async () => {
  const result = await pingQuery();
  expect(result).toEqual({ ping: "pong" });
});
