import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import * as simpleSchemas from "../simpleSchemas.js";
import createProduct from "./createProduct.js";

mockContext.mutations.createProduct = jest.fn().mockName("mutations.createProduct");
mockContext.simpleSchemas = simpleSchemas;

test("throws if permission check fails", async () => {
  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });

  await expect(createProduct(mockContext, {
    shopId: "SHOP_ID"
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    "reaction:legacy:products",
    "create",
    { shopId: "SHOP_ID" }
  );
});

test("throws if the shopId isn't supplied", async () => {
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

  await expect(createProduct(mockContext, {
    shopId: undefined
  })).rejects.toThrowErrorMatchingSnapshot();
});
