import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

jest.setTimeout(300000);

let echo;
let testApp;
beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  echo = testApp.mutate(`mutation {
    echo(str: "hello")
  }`);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("test echo", async () => {
  const result = await echo();
  expect(result).toEqual({ echo: "hello" });
});
