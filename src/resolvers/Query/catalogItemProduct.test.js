import catalogItemProductResolver from "./catalogItemProduct.js";

const mockItem = {
  _id: "a1",
  name: "Item Product"
};

const productSlug = "PRODUCT_SLUG";
const productId = "cmVhY3Rpb24vY2F0YWxvZ0l0ZW06MTIz"; // reaction/catalogItem:123

// product slug
test("calls queries.catalogItemProduct with a product slug and return a CatalogItemProduct", async () => {
  const slugOrId = productSlug;
  const catalogItemProduct = jest
    .fn()
    .mockName("queries.catalogItemProduct")
    .mockReturnValueOnce(Promise.resolve(mockItem));
  const result = await catalogItemProductResolver(
    {},
    {
      shopId: "123",
      slugOrId
    },
    {
      queries: { catalogItemProduct }
    }
  );

  expect(catalogItemProduct).toHaveBeenCalledWith(jasmine.any(Object), {
    catalogIdOrProductSlug: productSlug,
    shopId: "123"
  });
  expect(result).toEqual(mockItem);
});

// product id
test("calls queries.catalogItemProduct with a product id and return a CatalogItemProduct", async () => {
  const slugOrId = productId;
  const catalogItemProduct = jest
    .fn()
    .mockName("queries.catalogItemProduct")
    .mockReturnValueOnce(Promise.resolve(mockItem));
  const result = await catalogItemProductResolver(
    {},
    {
      shopId: "123",
      slugOrId
    },
    {
      queries: { catalogItemProduct }
    }
  );

  expect(catalogItemProduct).toHaveBeenCalledWith(jasmine.any(Object), {
    catalogIdOrProductSlug: "123",
    shopId: "123"
  });
  expect(result).toEqual(mockItem);
});
