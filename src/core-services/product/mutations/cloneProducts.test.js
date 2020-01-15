import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import cloneProducts from "./cloneProducts.js";

mockContext.mutations.cloneProducts = jest.fn().mockName("mutations.cloneProducts");

test("throws if permission check fails", async () => {
  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });

  await expect(cloneProducts(mockContext, {
    productIds: ["PRODUCT_ID_1", "PRODUCT_ID_2"],
    shopId: "SHOP_ID"
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    "reaction:legacy:products:PRODUCT_ID_1",
    "clone",
    { shopId: "SHOP_ID" }
  );
});

test("throws if the productIds isn't supplied", async () => {
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

  await expect(cloneProducts(mockContext, {
    productIds: undefined,
    shopId: "SHOP_ID"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the shopId isn't supplied", async () => {
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

  await expect(cloneProducts(mockContext, {
    productIds: ["PRODUCT_ID_1", "PRODUCT_ID_2"],
    shopId: undefined
  })).rejects.toThrowErrorMatchingSnapshot();
});
