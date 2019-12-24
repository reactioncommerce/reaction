import TestApp from "/tests/util/TestApp.js";

jest.setTimeout(300000);

let echo;
let testApp;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  echo = testApp.mutate(`mutation {
    echo(str: "hello")
  }`);
});

afterAll(async () => {
  await testApp.stop();
});

test("test echo", async () => {
  const result = await echo();
  expect(result).toEqual({ echo: "hello" });
});
