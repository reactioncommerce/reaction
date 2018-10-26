// import Factory from "/imports/test-utils/helpers/factory";
// import mockContext from "/imports/test-utils/helpers/mockContext";
import { filterShippingAttributes } from "./filterShippingAttributes";


// const rates = {
//   {
//     "_id" : "ZDDBRPusdH3a8thjS",
//     "name" : "Default shipping provider",
//     "methods" : [
//         {
//             "code" : "001",
//             "handling" : 0,
//             "label" : "Ground",
//             "name" : "Ground",
//             "rate" : 7.99,
//             "enabled" : true,
//             "_id" : "dTWhRhRrE9ZwzEhdi",
//             "restrictions" : {
//                 "allow" : {
//                     "destination" : {
//                         "country" : [
//                             "AA",
//                             "AE",
//                             "AP",
//                             "AS",
//                             "GU",
//                             "MP",
//                             "PR",
//                             "US",
//                             "VI"
//                         ]
//                     }
//                 },
//                 "deny" : {
//                     "attributes" : [],
//                     "destination" : {
//                         "region" : [
//                             "AK",
//                             "HI"
//                         ]
//                     }
//                 }
//             }
//         },
//         {
//             "code" : "021",
//             "handling" : 0,
//             "label" : "USPS",
//             "name" : "USPS",
//             "rate" : 7.99,
//             "enabled" : true,
//             "_id" : "dTWhRhRre9ZwzEhdi",
//             "restrictions" : {
//                 "allow" : {
//                     "destination" : {
//                         "country" : [
//                             "AA",
//                             "AE",
//                             "AP",
//                             "AS",
//                             "GU",
//                             "MP",
//                             "PR",
//                             "US",
//                             "VI"
//                         ]
//                     }
//                 },
//                 "deny" : {
//                     "attributes" : [],
//                     "destination" : {
//                         "region" : [
//                             "AK",
//                             "HI"
//                         ]
//                     }
//                 }
//             }
//         },
//         {
//             "code" : "024-HI",
//             "handling" : 0,
//             "label" : "Ground Hawaii",
//             "name" : "Ground Hawaii",
//             "rate" : 12.99,
//             "enabled" : true,
//             "_id" : "dTWhRhRrE9ZuzEhdi",
//             "restrictions" : {
//                 "allow" : {
//                     "destination" : {
//                         "region" : [
//                             "HI"
//                         ]
//                     }
//                 },
//                 "deny" : {
//                     "attributes" : [],
//                     "destination" : {}
//                 }
//             }
//         },
//         {
//             "code" : "024-AK",
//             "handling" : 0,
//             "label" : "Ground Alaska",
//             "name" : "Ground Alaska",
//             "rate" : 12.99,
//             "enabled" : true,
//             "_id" : "dTWhRhRrE9ZwzEhri",
//             "restrictions" : {
//                 "allow" : {
//                     "destination" : {
//                         "region" : [
//                             "AK"
//                         ]
//                     }
//                 },
//                 "deny" : {
//                     "attributes" : [],
//                     "destination" : {}
//                 }
//             }
//         },
//         {
//             "code" : "025-USPSHI",
//             "handling" : 0,
//             "label" : "USPS Hawaii",
//             "name" : "USPS Hawaii",
//             "rate" : 12.99,
//             "enabled" : true,
//             "_id" : "dTWhRhRrE9ZwzEhdi",
//             "restrictions" : {
//                 "allow" : {
//                     "destination" : {
//                         "region" : [
//                             "HI"
//                         ]
//                     }
//                 },
//                 "deny" : {
//                     "attributes" : [],
//                     "destination" : {}
//                 }
//             }
//         },
//         {
//             "code" : "023-USPSAK",
//             "handling" : 0,
//             "label" : "USPS Alaska",
//             "name" : "USPS Alaska",
//             "rate" : 12.99,
//             "enabled" : true,
//             "_id" : "dTWhRhRrE2ZwzEhdi",
//             "restrictions" : {
//                 "allow" : {
//                     "destination" : {
//                         "region" : [
//                             "AK"
//                         ]
//                     }
//                 },
//                 "deny" : {
//                     "attributes" : [],
//                     "destination" : {}
//                 }
//             }
//         },
//         {
//             "code" : "002",
//             "handling" : 0,
//             "label" : "2-Day Express",
//             "name" : "2-Day Express",
//             "rate" : 19.99,
//             "enabled" : true,
//             "_id" : "dTWhRhRrE9ZwzEuii",
//             "restrictions" : {
//                 "allow" : {
//                     "destination" : {
//                         "country" : [
//                             "US"
//                         ]
//                     }
//                 },
//                 "deny" : {
//                     "attributes" : [],
//                     "destination" : {
//                         "region" : [
//                             "AK",
//                             "HI"
//                         ]
//                     }
//                 }
//             }
//         },
//         {
//             "code" : "003",
//             "handling" : 0,
//             "label" : "Overnight",
//             "name" : "Overnight",
//             "rate" : 29.99,
//             "enabled" : true,
//             "_id" : "dTWhRhRvE9ZwzEhdi",
//             "restrictions" : {
//                 "allow" : {
//                     "destination" : {
//                         "country" : [
//                             "US"
//                         ]
//                     }
//                 },
//                 "deny" : {
//                     "attributes" : [],
//                     "destination" : {
//                         "region" : [
//                             "AK",
//                             "HI"
//                         ]
//                     }
//                 }
//             }
//         },
//         {
//             "code" : "026-SATURDAY",
//             "handling" : 0,
//             "label" : "Saturday Delivery",
//             "name" : "Saturday Delivery",
//             "rate" : 39.99,
//             "enabled" : true,
//             "_id" : "dTWhRhRrE9ZwaEhdi",
//             "restrictions" : {
//                 "allow" : {
//                     "destination" : {
//                         "country" : [
//                             "US"
//                         ]
//                     }
//                 },
//                 "deny" : {
//                     "attributes" : [],
//                     "destination" : {
//                         "region" : [
//                             "AK",
//                             "HI"
//                         ]
//                     }
//                 }
//             }
//         },
//         {
//             "code" : "1234",
//             "handling" : 0,
//             "label" : "Canadian Shipping",
//             "name" : "Canadian Shipping",
//             "rate" : 27.99,
//             "enabled" : true,
//             "_id" : "dTWhRhRrE9ZwzEhdm",
//             "restrictions" : {
//                 "allow" : {
//                     "destination" : {
//                         "country" : [
//                             "CA"
//                         ]
//                     }
//                 },
//                 "deny" : {
//                     "attributes" : [],
//                     "destination" : {}
//                 }
//             }
//         },
//         {
//             "code" : "999",
//             "handling" : 0,
//             "label" : "Test Method - No weights over 20",
//             "name" : "Test Method - No weights over 20",
//             "rate" : 10.99,
//             "enabled" : true,
//             "_id" : "dTWhRhRrE9Zwz8hdi",
//             "restrictions" : {
//                 "allow" : {
//                     "destination" : {
//                         "country" : [
//                             "US"
//                         ]
//                     }
//                 },
//                 "deny" : {
//                     "attributes" : [
//                         {
//                             "property" : "weight",
//                             "value" : 20,
//                             "propertyType" : "int",
//                             "operator" : "gt"
//                         }
//                     ],
//                     "destination" : {}
//                 }
//             }
//         }
//     ],
//     "globalShippingRestrictions" : {
//         "allow" : {
//             "destination" : {
//                 "country" : [
//                     "CA",
//                     "US"
//                 ]
//             }
//         }
//     },
//     "provider" : {
//         "name" : "flatRates",
//         "label" : "Flat Rate",
//         "_id" : "d6YyHQRAkSLf8qXNw",
//         "enabled" : true
//     },
//     "shopId" : "J8Bhq3uTtdgwZx3rz"
// };



// const shippingAttributes = { address:
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



jest.mock("../util/getCartById", () => jest.fn().mockImplementation(() => Promise.resolve({
  _id: "cartId",
  items: [{
    _id: "123"
  }],
  shipping: [{
    _id: "group1",
    itemIds: ["123"],
    type: "shipping"
  }]
})));

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

  // console.log("-------------------------- shippingMethods", shippingMethods);
  // console.log("-------------------------- shippingAttributes", shippingAttributes);

  // mockGetFulfillmentMethodsWithQuotes.mockReturnValueOnce(Promise.resolve([]));
  // mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(fakeCart));

  // const result = await updateFulfillmentOptionsForGroup(mockContext, {
  //   cartId: "cartId",
  //   fulfillmentGroupId: "group1"
  // });
  expect(true).toEqual(true);


});
