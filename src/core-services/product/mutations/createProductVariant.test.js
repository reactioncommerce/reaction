import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import createProductVariant from "./createProductVariant.js";

mockContext.mutations.createProductVariant = jest.fn().mockName("mutations.createProductVariant");

test("throws if permission check fails", async () => {
  mockContext.collections.Products.findOne.mockReturnValueOnce(Promise.resolve({
    _id: "PRODUCT_ID",
    shopId: "SHOP_ID"
  }));

  mockContext.validatePermissionsLegacy.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });

  await expect(createProductVariant(mockContext, {
    productId: "PRODUCT_ID",
    shopId: "SHOP_ID"
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.validatePermissionsLegacy).toHaveBeenCalledWith(["createProduct", "product/admin", "product/create"], "SHOP_ID");
});

test("throws if the productId isn't supplied", async () => {
  mockContext.validatePermissionsLegacy.mockReturnValueOnce(Promise.resolve(null));

  await expect(createProductVariant(mockContext, {
    productId: undefined,
    shopId: "SHOP_ID"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the shopId isn't supplied", async () => {
  mockContext.validatePermissionsLegacy.mockReturnValueOnce(Promise.resolve(null));

  await expect(createProductVariant(mockContext, {
    productId: "PRODUCT_ID",
    shopId: undefined
  })).rejects.toThrowErrorMatchingSnapshot();
});
