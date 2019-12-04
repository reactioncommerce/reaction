import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import cloneProductVariants from "./cloneProductVariants.js";

mockContext.mutations.cloneProductVariants = jest.fn().mockName("mutations.cloneProductVariants");

test("throws if permission check fails", async () => {
  mockContext.validatePermissionsLegacy.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });

  await expect(cloneProductVariants(mockContext, {
    variantIds: ["VARIANT_ID_1", "VARIANT_ID_2"],
    shopId: "SHOP_ID"
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.validatePermissionsLegacy).toHaveBeenCalledWith(["createProduct", "product/admin", "product/clone"], null, { shopId: "SHOP_ID" });
});

test("throws if the variantIds isn't supplied", async () => {
  mockContext.validatePermissionsLegacy.mockReturnValueOnce(Promise.resolve(null));

  await expect(cloneProductVariants(mockContext, {
    shopId: "SHOP_ID",
    variantIds: undefined
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the shopId isn't supplied", async () => {
  mockContext.validatePermissionsLegacy.mockReturnValueOnce(Promise.resolve(null));

  await expect(cloneProductVariants(mockContext, {
    shopId: undefined,
    variantIds: ["VARIANT_ID_1", "VARIANT_ID_2"]
  })).rejects.toThrowErrorMatchingSnapshot();
});
