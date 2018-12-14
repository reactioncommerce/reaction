import { getApp, PORT } from "../mocks/mockRemoteGraphql";
import TestApp from "../TestApp";

const remoteGraphQL = getApp();
const testApp = new TestApp();
let server;

beforeAll(async () => {
  const remotePromise = new Promise((resolve, reject) => {
    server = remoteGraphQL.listen(PORT, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
  await testApp.start();
  await remotePromise;
});

test("plugin with remote graphQL should delegate properly", async () => {
  const res = await testApp.query("{unitTestRemoteGraphql}")();
  expect(res).toHaveProperty("unitTestRemoteGraphql", 42.42);
});

afterAll(() => {
  server && server.close();
  testApp.stop();
});
