import GraphTester from "../GraphTester";

let tester;
let viewerQuery;
beforeAll(async () => {
  tester = new GraphTester();
  await tester.startServer();

  viewerQuery = tester.query(`{
    viewer {
      _id
    }
  }`);
});

afterAll(() => tester.stopServer());

test("unauthenticated", async () => {
  const result = await viewerQuery();
  expect(result).toEqual({
    viewer: null
  });
});

test("authenticated", async () => {
  await tester.setLoggedInUser({
    _id: "123"
  });

  const result = await viewerQuery();
  expect(result).toEqual({
    viewer: {
      _id: "cmVhY3Rpb24vYWNjb3VudDoxMjM="
    }
  });

  await tester.clearLoggedInUser();
});
