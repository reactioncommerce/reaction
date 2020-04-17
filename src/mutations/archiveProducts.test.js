import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import archiveProducts from "./archiveProducts.js";

mockContext.mutations.archiveProducts = jest.fn().mockName("mutations.archiveProducts");

test("throws if permission check fails", async () => {
  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });

  await expect(archiveProducts(mockContext, {
    productIds: ["PRODUCT_ID_1", "PRODUCT_ID_2"],
    shopId: "SHOP_ID"
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    "reaction:legacy:products:PRODUCT_ID_1",
    "archive",
    { shopId: "SHOP_ID" }
  );
});

test("throws if the productIds isn't supplied", async () => {
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

  await expect(archiveProducts(mockContext, {
    productIds: undefined,
    shopId: "SHOP_ID"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the shopId isn't supplied", async () => {
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));

  await expect(archiveProducts(mockContext, {
    productIds: ["PRODUCT_ID_1", "PRODUCT_ID_2"],
    shopId: undefined
  })).rejects.toThrowErrorMatchingSnapshot();
});
