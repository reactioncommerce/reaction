import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import createProduct from "./createProduct.js";

mockContext.mutations.createProduct = jest.fn().mockName("mutations.createProduct");

test("throws if permission check fails", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);

  await expect(createProduct(mockContext, {
    shopId: "SHOP_ID"
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["createProduct", "product/admin", "product/create"], "SHOP_ID");
});

test("throws if the shopId isn't supplied", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);

  await expect(createProduct(mockContext, {
    shopId: undefined
  })).rejects.toThrowErrorMatchingSnapshot();
});
