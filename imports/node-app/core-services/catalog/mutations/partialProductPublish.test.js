import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import partialProductPublish from "./partialProductPublish.js";

test("calls applyCustomPublisherTransforms with current Catalog doc and saves result", async () => {
  const productId = "MOCK_PRODUCT_ID";
  const shopId = "MOCK_SHOP_ID";
  const variantId = "MOCK_VARIANT_ID";
  const optionId = "MOCK_OPTION_ID";

  const mockCatalogProduct = {
    productId,
    shopId,
    variants: [
      {
        variantId,
        options: [
          {
            variantId: optionId
          }
        ]
      }
    ]
  };

  mockContext.collections.Catalog.findOne.mockReturnValueOnce(Promise.resolve({
    product: mockCatalogProduct
  }));

  mockContext.collections.Shops.findOne.mockReturnValueOnce(Promise.resolve({
    _id: shopId
  }));

  mockContext.collections.Products.findOne.mockReturnValueOnce(Promise.resolve({
    _id: productId
  }));

  mockContext.collections.Products.toArray.mockReturnValueOnce(Promise.resolve([
    {
      _id: variantId
    },
    {
      _id: optionId
    }
  ]));

  mockContext.mutations.applyCustomPublisherTransforms = jest.fn().mockName("applyCustomPublisherTransforms").mockReturnValueOnce(Promise.resolve());

  mockContext.collections.Catalog.updateOne.mockReturnValueOnce(Promise.resolve());

  await partialProductPublish(mockContext, { productId });

  expect(mockContext.collections.Catalog.findOne).toHaveBeenCalledWith({ "product.productId": productId });
  expect(mockContext.collections.Shops.findOne).toHaveBeenCalledWith({ _id: shopId });
  expect(mockContext.collections.Products.findOne).toHaveBeenCalledWith({ _id: productId });
  expect(mockContext.collections.Products.find).toHaveBeenCalledWith({ _id: { $in: [variantId, optionId] } });
  expect(mockContext.collections.Products.toArray).toHaveBeenCalled();
  expect(mockContext.mutations.applyCustomPublisherTransforms).toHaveBeenCalledWith(mockContext, mockCatalogProduct, {
    product: { _id: productId },
    shop: { _id: shopId },
    startFrom: undefined,
    variants: [
      { _id: variantId },
      { _id: optionId }
    ]
  });
  expect(mockContext.collections.Catalog.updateOne).toHaveBeenCalledWith({ "product.productId": productId }, {
    $set: {
      product: mockCatalogProduct
    }
  });
});
