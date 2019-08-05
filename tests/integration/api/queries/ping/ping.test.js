import TestApp from "/imports/test-utils/helpers/TestApp";

jest.setTimeout(300000);

let pingQuery;
let testApp;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  pingQuery = testApp.query(`query {
  ping
}`);
});

afterAll(() => testApp.stop());

test("simple test ping", async () => {
  const result = await pingQuery();
  expect(result).toEqual({ ping: "pong" });
});
