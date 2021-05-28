import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import * as simpleSchemas from "../simpleSchemas.js";
import createShop from "./createShop.js";

mockContext.mutations.createProduct = jest.fn().mockName("mutations.createProduct");
mockContext.simpleSchemas = simpleSchemas;

test("creates shop with type primary if there is no existing shop", async () => {
  mockContext.collections.Shops.findOne.mockReturnValueOnce(Promise.resolve(null));
  mockContext.collections.Shops.insertOne.mockReturnValueOnce(Promise.resolve({ result: { ok: 1 } }));

  await expect(createShop(mockContext, {
    name: "First shop"
  })).resolves.toEqual(expect.objectContaining({
    shopType: "primary"
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
