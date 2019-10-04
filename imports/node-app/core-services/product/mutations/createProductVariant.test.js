import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import createProductVariant from "./createProductVariant.js";

mockContext.mutations.createProductVariant = jest.fn().mockName("mutations.createProductVariant");

test("throws if permission check fails", async () => {
  mockContext.collections.Products.findOne.mockReturnValueOnce(Promise.resolve({
    _id: "PRODUCT_ID",
    shopId: "SHOP_ID"
  }));

  mockContext.userHasPermission.mockReturnValueOnce(false);

  await expect(createProductVariant(mockContext, {
    productId: "PRODUCT_ID",
    shopId: "SHOP_ID"
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["createProduct", "product/admin", "product/create"], "SHOP_ID");
});

test("throws if the productId isn't supplied", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);

  await expect(createProductVariant(mockContext, {
    productId: undefined,
    shopId: "SHOP_ID"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the shopId isn't supplied", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);

  await expect(createProductVariant(mockContext, {
    productId: "PRODUCT_ID",
    shopId: undefined
  })).rejects.toThrowErrorMatchingSnapshot();
});
