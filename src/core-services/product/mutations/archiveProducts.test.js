import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import archiveProducts from "./archiveProducts.js";

mockContext.mutations.archiveProducts = jest.fn().mockName("mutations.archiveProducts");

test("throws if permission check fails", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);

  await expect(archiveProducts(mockContext, {
    productIds: ["PRODUCT_ID_1", "PRODUCT_ID_2"],
    shopId: "SHOP_ID"
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["createProduct", "product/admin", "product/archive"], "SHOP_ID");
});

test("throws if the productIds isn't supplied", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);

  await expect(archiveProducts(mockContext, {
    productIds: undefined,
    shopId: "SHOP_ID"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the shopId isn't supplied", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);

  await expect(archiveProducts(mockContext, {
    productIds: ["PRODUCT_ID_1", "PRODUCT_ID_2"],
    shopId: undefined
  })).rejects.toThrowErrorMatchingSnapshot();
});
