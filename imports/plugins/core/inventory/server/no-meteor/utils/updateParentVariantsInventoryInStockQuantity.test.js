// import mockContext from "/imports/test-utils/helpers/mockContext";
// import updateParentVariantsInventoryInStockQuantity from "./updateParentVariantsInventoryInStockQuantity";

// const mockCollections = { ...mockContext.collections };

// const internalShopId = "123";
// const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
// const internalCatalogItemId = "999";
// const internalCatalogProductId = "999";
// const internalProductId = "999";
// const internalTagIds = ["923", "924"];
// const internalVariantIds = ["875", "874"];

// const productSlug = "fake-product";

// const createdAt = new Date("2018-04-16T15:34:28.043Z");
// const updatedAt = new Date("2018-04-17T15:34:28.043Z");

// const mockOrders = [
//   {
//     shipping: [{
//       items: [{
//         productId: internalCatalogProductId,
//         quantity: 2,
//         variantId: internalVariantIds[0]
//       }]
//     }]
//   },
//   {
//     shipping: [{
//       items: [{
//         productId: internalCatalogProductId,
//         quantity: 3,
//         variantId: internalVariantIds[0]
//       }]
//     }]
//   }
// ]

// const mockVariants = [
//   {
//     _id: internalVariantIds[0],
//     ancestors: [internalCatalogProductId],
//     barcode: "barcode",
//     createdAt,
//     height: 0,
//     index: 0,
//     inventoryAvailableToSell: 10,
//     inventoryInStock: 10,
//     inventoryManagement: true,
//     inventoryPolicy: false,
//     isDeleted: false,
//     isLowQuantity: true,
//     isSoldOut: false,
//     isVisible: true,
//     length: 0,
//     lowInventoryWarningThreshold: 0,
//     metafields: [
//       {
//         value: "value",
//         namespace: "namespace",
//         description: "description",
//         valueType: "valueType",
//         scope: "scope",
//         key: "key"
//       }
//     ],
//     minOrderQuantity: 0,
//     optionTitle: "Untitled Option",
//     originCountry: "US",
//     price: 0,
//     shopId: internalShopId,
//     sku: "sku",
//     taxCode: "0000",
//     taxDescription: "taxDescription",
//     title: "Small Concrete Pizza",
//     updatedAt,
//     variantId: internalVariantIds[0],
//     weight: 0,
//     width: 0
//   },
//   {
//     _id: internalVariantIds[1],
//     ancestors: [internalCatalogProductId, internalVariantIds[0]],
//     barcode: "barcode",
//     height: 2,
//     index: 0,
//     inventoryAvailableToSell: 10,
//     inventoryInStock: 10,
//     inventoryManagement: true,
//     inventoryPolicy: true,
//     isDeleted: false,
//     isLowQuantity: true,
//     isSoldOut: false,
//     isVisible: true,
//     length: 2,
//     lowInventoryWarningThreshold: 0,
//     metafields: [
//       {
//         value: "value",
//         namespace: "namespace",
//         description: "description",
//         valueType: "valueType",
//         scope: "scope",
//         key: "key"
//       }
//     ],
//     minOrderQuantity: 0,
//     optionTitle: "Awesome Soft Bike",
//     originCountry: "US",
//     price: 992.0,
//     shopId: internalShopId,
//     sku: "sku",
//     taxCode: "0000",
//     taxDescription: "taxDescription",
//     title: "One pound bag",
//     variantId: internalVariantIds[1],
//     weight: 2,
//     width: 2
//   }
// ];

// const mockProduct = {
//   _id: internalCatalogItemId,
//   shopId: internalShopId,
//   barcode: "barcode",
//   createdAt,
//   description: "description",
//   facebookMsg: "facebookMessage",
//   fulfillmentService: "fulfillmentService",
//   googleplusMsg: "googlePlusMessage",
//   height: 11.23,
//   inventoryAvailableToSell: 20,
//   inventoryInStock: 20,
//   isBackorder: false,
//   isLowQuantity: false,
//   isSoldOut: false,
//   length: 5.67,
//   lowInventoryWarningThreshold: 2,
//   metafields: [
//     {
//       value: "value",
//       namespace: "namespace",
//       description: "description",
//       valueType: "valueType",
//       scope: "scope",
//       key: "key"
//     }
//   ],
//   metaDescription: "metaDescription",
//   minOrderQuantity: 5,
//   originCountry: "originCountry",
//   pageTitle: "pageTitle",
//   parcel: {
//     containers: "containers",
//     length: 4.44,
//     width: 5.55,
//     height: 6.66,
//     weight: 7.77
//   },
//   pinterestMsg: "pinterestMessage",
//   price: {
//     max: 5.99,
//     min: 2.99,
//     range: "2.99 - 5.99"
//   },
//   media: [
//     {
//       metadata: {
//         toGrid: 1,
//         priority: 1,
//         productId: internalProductId,
//         variantId: null
//       },
//       thumbnail: "http://localhost/thumbnail",
//       small: "http://localhost/small",
//       medium: "http://localhost/medium",
//       large: "http://localhost/large",
//       image: "http://localhost/original"
//     }
//   ],
//   productId: internalProductId,
//   productType: "productType",
//   shop: {
//     _id: opaqueShopId
//   },
//   sku: "ABC123",
//   supportedFulfillmentTypes: ["shipping"],
//   handle: productSlug,
//   hashtags: internalTagIds,
//   title: "Fake Product Title",
//   twitterMsg: "twitterMessage",
//   type: "product-simple",
//   updatedAt,
//   variants: mockVariants,
//   vendor: "vendor",
//   weight: 15.6,
//   width: 8.4
// };

// const mockCatalogItem = {
//   _id: internalCatalogItemId,
//   shopId: internalShopId,
//   product: mockProduct
// };

// const mockIsBackorder = jest
//   .fn()
//   .mockName("isBackorder")
//   .mockReturnValue(false);
// const mockIsLowQuantity = jest
//   .fn()
//   .mockName("isLowQuantity")
//   .mockReturnValue(false);

// const mockGetTopLevelVariant = jest.fn().mockName("getTopLevelVariant");

// // beforeAll(() => {
// //   rewire$isBackorder(mockIsBackorder);
// //   rewire$isLowQuantity(mockIsLowQuantity);
// //   rewire$isSoldOut(mockIsSoldOut);
// // });

// // afterAll(() => {
// //   restore$isBackorder();
// //   restore$isLowQuantity();
// //   restore$isSoldOut();
// // });

// test("expect true if a product's inventory has changed and is updated in the catalog collection", async () => {
//   // mockCollections.Catalog.findOne.mockReturnValueOnce(Promise.resolve(mockCatalogItem));
//   // mockCollections.Products.findOne.mockReturnValueOnce(Promise.resolve(mockProduct));
//   // mockCollections.Products.toArray.mockReturnValueOnce(Promise.resolve(mockVariants));
//   console.log("mockVariants[0]", mockVariants[0]);


//   mockGetTopLevelVariant.mockReturnValue(Promise.resolve(mockVariants[0]));
//   // mockCollections.Catalog.updateOne.mockReturnValueOnce(Promise.resolve({ result: { ok: 1 } }));
//   const spec = await updateParentVariantsInventoryInStockQuantity(mockVariants[0], mockCollections);
//   expect(spec).toBe(true);
// });

// // test("expect false if a product's catalog item does not exist", async () => {
// //   mockCollections.Catalog.findOne.mockReturnValueOnce(Promise.resolve(undefined));
// //   mockCollections.Products.findOne.mockReturnValueOnce(Promise.resolve(mockProduct));
// //   const spec = await updateParentVariantsInventoryInStockQuantity(mockProduct, mockCollections);
// //   expect(spec).toBe(false);
// // });
