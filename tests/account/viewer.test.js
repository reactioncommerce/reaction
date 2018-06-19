import TestApp from "../TestApp";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

let testApp;
let viewerQuery;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  viewerQuery = testApp.query(`{
    viewer {
      _id
    }
  }`);
});

afterAll(() => testApp.stop());

test("unauthenticated", async () => {
  const result = await viewerQuery();
  expect(result).toEqual({
    viewer: null
  });
});

test("authenticated", async () => {
  await testApp.setLoggedInUser({
    _id: "123"
  });

  const result = await viewerQuery();
  expect(result).toEqual({
    viewer: {
      _id: "cmVhY3Rpb24vYWNjb3VudDoxMjM="
    }
  });

  await testApp.clearLoggedInUser();
});
