import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const ViewerFullQuery = importAsString("./ViewerFullQuery.graphql");

jest.setTimeout(300000);

let testApp;
let viewerQuery;
beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  viewerQuery = testApp.query(ViewerFullQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("unauthenticated", async () => {
  const result = await viewerQuery();
  expect(result).toEqual({
    viewer: null
  });
});

test("authenticated", async () => {
  const mockAccount = Factory.Account.makeOne({
    _id: "123"
  });

  await testApp.setLoggedInUser(mockAccount);

  const result = await viewerQuery();
  expect(result).toEqual({
    viewer: {
      _id: "cmVhY3Rpb24vYWNjb3VudDoxMjM=",
      addressBook: {
        nodes: [
          { address1: "mockAddress1" }
        ]
      },
      createdAt: jasmine.any(String),
      currency: null,
      emailRecords: [
        {
          address: mockAccount.emails[0].address,
          verified: mockAccount.emails[0].verified
        }
      ],
      groups: {
        nodes: []
      },
      metafields: [
        {
          description: "mockDescription",
          key: "mockKey",
          namespace: "mockNamespace",
          scope: "mockScope",
          value: "mockValue",
          valueType: "mockValueType"
        }
      ],
      name: "mockName",
      note: "mockNote",
      preferences: {},
      updatedAt: jasmine.any(String)
    }
  });

  await testApp.clearLoggedInUser();
});
