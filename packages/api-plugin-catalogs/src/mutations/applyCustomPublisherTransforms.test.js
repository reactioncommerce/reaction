import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import applyCustomPublisherTransforms from "./applyCustomPublisherTransforms.js";

test("calls all functions of type publishProductToCatalog", async () => {
  const catalogProduct = {
    foo: {
      some: "thing"
    }
  };

  const firstTransformFn = jest.fn().mockName("firstTransform").mockImplementation((catProd) => {
    catProd.foo.some = "one";
  });

  const secondTransformFn = jest.fn().mockName("secondTransform").mockImplementation((catProd) => {
    catProd.la = "la";
  });

  mockContext.getFunctionsOfType.mockReturnValueOnce([
    firstTransformFn,
    secondTransformFn
  ]);

  await applyCustomPublisherTransforms(mockContext, catalogProduct, {
    product: "MOCK_PRODUCT_ARG",
    shop: "MOCK_SHOP_ARG",
    variants: "MOCK_VARIANT_ARG"
  });

  const expectedSecondArg = {
    context: mockContext,
    product: "MOCK_PRODUCT_ARG",
    shop: "MOCK_SHOP_ARG",
    variants: "MOCK_VARIANT_ARG"
  };

  expect(catalogProduct.foo.some).toBe("one");
  expect(catalogProduct.la).toBe("la");
  expect(firstTransformFn).toHaveBeenCalledWith(catalogProduct, expectedSecondArg);
  expect(secondTransformFn).toHaveBeenCalledWith(catalogProduct, expectedSecondArg);
});
