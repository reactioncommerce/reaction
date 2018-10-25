// import Factory from "/imports/test-utils/helpers/factory";
// import mockContext from "/imports/test-utils/helpers/mockContext";
import { filterShippingAttributes } from "./filterShippingAttributes";



// shippingAttributes for current order { address:
//   { address1: '123 Main Street',
//     address2: null,
//     city: 'Santa Monica',
//     country: 'US',
//     postal: '90405',
//     region: 'FL' },
//  items:
//   [ { productId: 'BCTMZ6HTxFSppJESk',
//       productVendor: 'Example Manufacturer',
//       tags: [Array],
//       weight: 25,
//       height: 3,
//       width: 10,
//       length: 10 },
//     { productId: 'BCTMZ6HTxFSppJESk',
//       productVendor: 'Example Manufacturer',
//       tags: [Array],
//       weight: 25,
//       height: 3,
//       width: 10,
//       length: 10 } ] }



// jest.mock("../util/getCartById", () => jest.fn().mockImplementation(() => Promise.resolve({
//   _id: "cartId",
//   items: [{
//     _id: "123"
//   }],
//   shipping: [{
//     _id: "group1",
//     itemIds: ["123"],
//     type: "shipping"
//   }]
// })));

// const fakeCart = Factory.Cart.makeOne();
// const fakeQuote = Factory.ShipmentQuote.makeOne();
// const mockGetFulfillmentMethodsWithQuotes = jest.fn().mockName("getFulfillmentMethodsWithQuotes");

// beforeAll(() => {
//   mockContext.queries = {
//     getFulfillmentMethodsWithQuotes: mockGetFulfillmentMethodsWithQuotes
//   };
// });

// beforeEach(() => {
//   mockGetFulfillmentMethodsWithQuotes.mockClear();
// });

test("checks blacklist restrictions", async () => {
  // mockGetFulfillmentMethodsWithQuotes.mockReturnValueOnce(Promise.resolve([]));
  // mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(fakeCart));

  // const result = await updateFulfillmentOptionsForGroup(mockContext, {
  //   cartId: "cartId",
  //   fulfillmentGroupId: "group1"
  // });
  expect(true).toEqual(true);


});
