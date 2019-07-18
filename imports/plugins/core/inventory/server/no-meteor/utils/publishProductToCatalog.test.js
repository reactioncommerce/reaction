import publishProductToCatalog from "./publishProductToCatalog";
import Factory from "/imports/test-utils/helpers/factory";
import mockContext from "/imports/test-utils/helpers/mockContext";

const productId = "TOP_PRODUCT_ID";

mockContext.queries.inventoryForProductConfigurations = jest.fn().mockName("inventoryForProductConfigurations");

/**
 * @summary Returns a mock catalogProduct for these tests
 * @returns {Object} CatalogProduct
 */
function getCatalogProduct() {
  return Factory.CatalogProduct.makeOne({
    isDeleted: false,
    isVisible: true,
    productId,
    variants: Factory.CatalogVariantSchema.makeMany(1, {
      isDeleted: false,
      isVisible: true,
      variantId: "TOP_VARIANT_1",
      options: Factory.VariantBaseSchema.makeMany(2, {
        isDeleted: false,
        isVisible: true,
        variantId: (index) => `OPTION_VARIANT_${index + 1}`
      })
    })
  });
}

test("publishProductToCatalog adds inventory booleans to catalogProduct", async () => {
  const catalogProduct = getCatalogProduct();

  // Verify beginning state
  expect(catalogProduct.isSoldOut).toBe(undefined);
  expect(catalogProduct.isLowQuantity).toBe(undefined);
  expect(catalogProduct.isBackorder).toBe(undefined);
  expect(catalogProduct.variants[0].isSoldOut).toBe(undefined);
  expect(catalogProduct.variants[0].options[0].isSoldOut).toBe(undefined);
  expect(catalogProduct.variants[0].options[1].isSoldOut).toBe(undefined);

  mockContext.queries.inventoryForProductConfigurations.mockReturnValueOnce(Promise.resolve([
    {
      productConfiguration: {
        productId,
        productVariantId: "TOP_VARIANT_1"
      },
      inventoryInfo: {
        canBackorder: true,
        inventoryAvailableToSell: 0,
        inventoryInStock: 0,
        inventoryReserved: 0,
        isBackorder: true,
        isLowQuantity: true,
        isSoldOut: true
      }
    },
    {
      productConfiguration: {
        productId,
        productVariantId: "OPTION_VARIANT_1"
      },
      inventoryInfo: {
        canBackorder: true,
        inventoryAvailableToSell: 0,
        inventoryInStock: 0,
        inventoryReserved: 0,
        isBackorder: true,
        isLowQuantity: false,
        isSoldOut: true
      }
    },
    {
      productConfiguration: {
        productId,
        productVariantId: "OPTION_VARIANT_2"
      },
      inventoryInfo: {
        canBackorder: true,
        inventoryAvailableToSell: 0,
        inventoryInStock: 0,
        inventoryReserved: 0,
        isBackorder: true,
        isLowQuantity: true,
        isSoldOut: true
      }
    }
  ]));

  await publishProductToCatalog(catalogProduct, { context: mockContext });

  expect(catalogProduct.isSoldOut).toBe(true);
  expect(catalogProduct.isLowQuantity).toBe(true);
  expect(catalogProduct.isBackorder).toBe(true);
  expect(catalogProduct.variants[0].isSoldOut).toBe(true);
  expect(catalogProduct.variants[0].options[0].isSoldOut).toBe(true);
  expect(catalogProduct.variants[0].options[1].isSoldOut).toBe(true);
});
