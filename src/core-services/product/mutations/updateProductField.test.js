import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import updateProductField from "./updateProductField.js";

mockContext.mutations.updateProductField = jest.fn().mockName("mutations.updateProductField");

test("throws if permission check fails", async () => {
  mockContext.collections.Products.findOne.mockReturnValueOnce(Promise.resolve({
    _id: "PRODUCT_ID",
    shopId: "SHOP_ID"
  }));

  mockContext.userHasPermission.mockReturnValueOnce(false);

  await expect(updateProductField(mockContext, {
    field: "FIELD",
    productId: "PRODUCT_ID",
    shopId: "SHOP_ID",
    value: "VALUE"
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["createProduct", "product/admin", "product/update"], "SHOP_ID");
});

test("throws if the field isn't supplied", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);

  await expect(updateProductField(mockContext, {
    field: undefined,
    productId: "PRODUCT_ID",
    shopId: "SHOP_ID",
    value: "VALUE"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the productId isn't supplied", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);

  await expect(updateProductField(mockContext, {
    field: "FIELD",
    productId: undefined,
    shopId: "SHOP_ID",
    value: "VALUE"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the shopId isn't supplied", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);

  await expect(updateProductField(mockContext, {
    field: "FIELD",
    productId: "PRODUCT_ID",
    shopId: undefined,
    value: "VALUE"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the value isn't supplied", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);

  await expect(updateProductField(mockContext, {
    field: "FIELD",
    productId: "PRODUCT_ID",
    shopId: "SHOP_ID",
    value: undefined
  })).rejects.toThrowErrorMatchingSnapshot();
});
