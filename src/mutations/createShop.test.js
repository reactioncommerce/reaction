import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import * as simpleSchemas from "../simpleSchemas.js";
import createShop from "./createShop.js";

mockContext.mutations.createProduct = jest.fn().mockName("mutations.createProduct");
mockContext.simpleSchemas = simpleSchemas;

/**
 * @summary Creates a mock plugin that extends the shop schema mutates the shop before being created
 * @param {Object} context - mock context
 * @return {undefined}
 */
function mockPluginExtendingShop(context) {
  context.simpleSchemas.Shop.extend({
    externalShopProp: {
      type: String,
      optional: true
    }
  });
  context.getFunctionsOfType.mockReturnValueOnce([
    (_, shop) => {
      shop.externalShopProp = "externalValue";
    }
  ]);
}

test("creates shop with type primary if there is no existing shop", async () => {
  mockContext.collections.Shops.findOne.mockReturnValueOnce(Promise.resolve(null));
  mockContext.collections.Shops.insertOne.mockReturnValueOnce(Promise.resolve({ result: { ok: 1 } }));
  mockPluginExtendingShop(mockContext);

  await expect(createShop(mockContext, {
    name: "First shop"
  })).resolves.toEqual(expect.objectContaining({
    shopType: "primary",
    externalShopProp: "externalValue"
  }));
});

test("creates shop with type merchant if there is already a primary", async () => {
  mockContext.collections.Shops.findOne.mockReturnValueOnce({
    _id: "1234",
    shopType: "primary",
    name: "First shop"
  });
  mockContext.collections.Shops.insertOne.mockReturnValueOnce(Promise.resolve({ result: { ok: 1 } }));

  await expect(createShop(mockContext, {
    name: "Second shop"
  })).resolves.toEqual(expect.objectContaining({
    shopType: "merchant"
  }));
});
