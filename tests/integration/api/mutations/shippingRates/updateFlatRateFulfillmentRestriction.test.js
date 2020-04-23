import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const UpdateFlatRateFulfillmentRestrictionMutation = importAsString("./UpdateFlatRateFulfillmentRestrictionMutation.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const internalRestrictionId = "456";
const opaqueShopId = encodeOpaqueId("reaction/shop", internalShopId); // reaction/shop:123
const opaqueRestrictionId = encodeOpaqueId("reaction/flatRateFulfillmentRestriction", internalRestrictionId);
const shopName = "Test Shop";
let updateFlatRateFulfillmentRestriction;
let testApp;

const mockFulfillmentRestriction = Factory.Restriction.makeOne({
  _id: internalRestrictionId,
  shopId: internalShopId,
  methodIds: [
    "6MugCf3Pn5rpfNke2"
  ],
  type: "allow",
  destination: {
    country: ["US"],
    postal: ["90817"],
    region: ["CA"]
  }
});

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:shippingRestrictions/update"],
  slug: "admin",
  shopId: internalShopId
});

const mockOwnerAccount = Factory.Account.makeOne({
  groups: [adminGroup._id],
  shopId: internalShopId
});

const inputDestination = {
  country: ["UK"],
  postal: ["56273"],
  region: ["LDN"]
};

const inputAttributes = [
  { property: "vendor", value: "reaction", propertyType: "string", operator: "eq" },
  { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
];


beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName });
  await testApp.collections.FlatRateFulfillmentRestrictions.insertOne(mockFulfillmentRestriction);
  await testApp.collections.Groups.insertOne(adminGroup);

  await testApp.createUserAndAccount(mockOwnerAccount);
  updateFlatRateFulfillmentRestriction = testApp.mutate(UpdateFlatRateFulfillmentRestrictionMutation);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

afterEach(async () => {
  await testApp.clearLoggedInUser();
});

test("shop owner can update flat rate fulfillment restriction", async () => {
  let result;
  await testApp.setLoggedInUser(mockOwnerAccount);

  try {
    result = await updateFlatRateFulfillmentRestriction({
      input: {
        shopId: opaqueShopId,
        restrictionId: opaqueRestrictionId,
        restriction: {
          type: "deny",
          destination: inputDestination,
          attributes: inputAttributes
        }
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.updateFlatRateFulfillmentRestriction.restriction).toEqual({
    _id: opaqueRestrictionId,
    shopId: opaqueShopId,
    type: "deny",
    methodIds: [],
    destination: inputDestination,
    attributes: inputAttributes
  });
});

test("shop owner cannot update flat rate fulfillment restriction if not logged in", async () => {
  try {
    await updateFlatRateFulfillmentRestriction({
      input: {
        shopId: opaqueShopId,
        restrictionId: opaqueRestrictionId,
        restriction: {
          type: "deny",
          destination: inputDestination,
          attributes: inputAttributes
        }
      }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});
