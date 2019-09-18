import mockContext from "/imports/test-utils/helpers/mockContext";
import createProductVariant from "./createProductVariant";

mockContext.mutations.createProductVariant = jest.fn().mockName("mutations.createProductVariant");

test("throws if permission check fails", async () => {
  mockContext.collections.Products.findOne.mockReturnValueOnce(Promise.resolve({
    _id: "PRODUCT_ID",
    shopId: "SHOP_ID"
  }));

  mockContext.userHasPermission.mockReturnValueOnce(false);

  await expect(createProductVariant(mockContext, {
    parentId: "PRODUCT_ID"
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["createProduct", "product/admin", "product/create"], "SHOP_ID");
});

test("throws if the parentId isn't supplied", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);

  await expect(createProductVariant(mockContext, {
    parentId: undefined
  })).rejects.toThrowErrorMatchingSnapshot();
});
