import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";
import { encodeCartOpaqueId, encodeCartItemsOpaqueIds } from "@reactioncommerce/reaction-graphql-xforms/cart";
import AddCartItemsMutation from "./AddCartItemsMutation.graphql";
import Logger from "@reactioncommerce/logger";

let testApp;
let addCartItems;
let fakeCart;
let fakeCartItem;
let shopId;
let originalError;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  shopId = await testApp.insertPrimaryShop();
  addCartItems = testApp.mutate(AddCartItemsMutation);
});
afterAll(async () => {
  await testApp.collections.Cart.deleteMany({});
  await testApp.stop();
});

describe("error messaging",() => {
  let logLevel = Logger.level();
  // jest still throws errors that are gracefully caught, so we'll up our logging level to hide errors
  // Logger.level("FATAL");
  beforeAll(async () => {
    fakeCart = Factory.Cart.makeOne({
      shopId: shopId,
      items:[]
    });
  });
  afterAll(async() => {
    Logger.level(logLevel);
  })
  test("expect fail when cartId not opaque", async () => {
    expect.assertions(1);
    try {
      let cartItems = [];
      result = await addCartItems({cartId: fakeCart._id, items: cartItems, token: null});
    } catch(error) {
      expect(error).toMatchSnapshot();
    }
  });
  test("cartId not found", async () => {
    expect.assertions(1);
    try {
      let cartItems = [];
      result = await addCartItems({cartId: encodeCartOpaqueId(fakeCart._id), items: cartItems, token: null});
    } catch(error) {
      expect(error).toMatchSnapshot();
    }
  });
  test("cartId not found with anonymous token", async () => {
    expect.assertions(1);
    try {
      let cartItems = [];
      result = await addCartItems({cartId: encodeCartOpaqueId(fakeCart._id), items: cartItems, token: "1234566"});
    } catch(error) {
      expect(error).toMatchSnapshot();
    }
  });
  test("incorrect item schema", async () =>{
    expect.assertions(1);
    try {
      let cartItems = [Factory.CartItem.makeOne()];
      console.log(encodeCartOpaqueId(fakeCart._id));
      console.log(JSON.stringify(cartItems));
      result = await addCartItems({cartId: encodeCartOpaqueId(fakeCart._id), items: cartItems, token: "1234566"});
    } catch(error) {
      expect(error).toEqual(false);
    }
  })
});

// describe('Single Product/Empty cart', async () => {
//   beforeAll(async () => {
//     fakeCartItem = Factory.Cart.makeOne({
//       shopId: shopId,
//       items:[]
//     });
//   });
//   test("add single cart item to anonymous cart", async () => {
//     // console.log(fakeCart);
//   });

//   test("add single cart item to known cart", async () => {

//   });
// });
