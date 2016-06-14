/* eslint dot-notation: 0 */
import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon, stubs, spies } from "meteor/practicalmeteor:sinon";
// import Factory from "meteor/dburles:factory";
import { getShop } from "/server/imports/fixtures/shops";
import { Reaction } from "/server/api";
import * as Collections from "/lib/collections";
import Fixtures from "/server/imports/fixtures";

Fixtures();


const originals = {
  mergeCart: Meteor.server.method_handlers["cart/mergeCart"],
  copyCartToOrder: Meteor.server.method_handlers["cart/copyCartToOrder"],
  addToCart: Meteor.server.method_handlers["cart/addToCart"],
  setShipmentAddress: Meteor.server.method_handlers["cart/setShipmentAddress"],
  setPaymentAddress: Meteor.server.method_handlers["cart/setPaymentAddress"]
};

function spyOnMethod(method, id) {
  return sinon.stub.create(Meteor.server.method_handlers, `cart/${method}`, function () {
    check(arguments, [Match.Any]); // to prevent audit_arguments from complaining
    this.userId = id;
    return originals[method].apply(this, arguments);
  });
}

describe("Single cart Method", function () {
  after(function () {
    Meteor.users.remove({});
    spies.restoreAll();
    stubs.restoreAll();
  });

  beforeEach(function () {
    Collections.Cart.remove({});
  });

  let user = Factory.create("user");
  const shop = getShop();
  // Required for creating a cart
  const sessionId = Reaction.sessionId = Random.id();
  before(function () {
    // We are mocking inventory hooks, because we don't need them here, but
    // if you want to do a real stress test, you could try to comment out
    // this two lines and uncomment the following spyOn line. This is needed
    // only for `./reaction test`. In one package test this is ignoring.
    if (Array.isArray(Collections.Products._hookAspects.remove.after) &&
      Collections.Products._hookAspects.remove.after.length) {
      stubs.create("cartHookSpy", Collections.Cart._hookAspects.update.after[0], "aspect");
      stubs.create("productHookSpy", Collections.Products._hookAspects.remove.after[0], "aspect");
    }

    // this is needed for `inventory/remove`. Don't ask me why;)
    // spyOn(Reaction, "hasPermission").and.returnValue(true);
    Collections.Products.remove({});

    // mock it. If you want to make full integration test, comment this out
    sinon.stub(Meteor.server.method_handlers, "workflow/pushCartWorkflow", function () {
      check(arguments, [Match.Any]);
      return true;
    });
  });

  it("should merge all `anonymous` carts into existent `normal` user cart per session, when logged in",
    function (done) {
      let anonymousCart = Factory.create("anonymousCart");
      let cart = Factory.create("cart");
      let mergeSpy = spies.create("cartMergeSpy", Meteor.server.method_handlers, "cart/mergeCart");
      mergeSpy.withArgs(cart.userId, sessionId);
      stubs.create("getShopIdStub", Reaction, "getShopId");
      stubs.getShopIdStub.returns(shop._id);
      spies.create("cartRemoveSpy", Collections.Cart, "remove");
      Collections.Cart.update({}, {
        $set: {
          sessionId: sessionId
        }
      });

      Meteor.call("cart/mergeCart", cart._id, sessionId);
      anonymousCart = Collections.Cart.findOne(anonymousCart._id);
      cart = Collections.Cart.findOne(cart._id);
      expect(spies.cartRemoveSpy).to.have.been.called;
      expect(anonymousCart).to.be.undefined;
      expect(cart.items.length).to.equal(2);
      done();
    }
  );

  it("should merge only into registered user cart", function (done) {
    const cart = Factory.create("anonymousCart");
    spyOnMethod("mergeCart", cart.userId);
    stubs.create("getShopIdStub", Reaction, "getShopId");
    stubs.getShopIdStub.returns(shop._id);
    const cartId = cart._id;
    // now we try to merge two anonymous carts. We expect to see `false`
    // result
    expect(Meteor.call("cart/mergeCart", cartId)).to.to.false;
    return done();
  });

  it("should throw an error if cart doesn't exist", function (done) {
    spyOnMethod("mergeCart", "someIdHere");
    let mergeCartFunction = function () {
      Meteor.call("cart/mergeCart", "non-existent-id", sessionId);
    };
    expect(mergeCartFunction).to.throw(Meteor.Error, /Access Denied/);
    return done();
  });

  it("should throw an error if cart user is not current user", function (done) {
    let cart = Factory.create("cart");
    spyOnMethod("mergeCart", "someIdHere");
    let mergeCartFunction = function () {
      return Meteor.call("cart/mergeCart", cart._id, "someSessionId");
    };
    expect(mergeCartFunction).to.throw(Meteor.Error, /Access Denied/);
    return done();
  });
});

//
// describe.skip("Create Cart methods", function () {
//   after(function () {
//     Meteor.users.remove({});
//   });
//
//   let user = Factory.create("user");
//   const shop = getShop();
//   let userId = user._id;
//   // Required for creating a cart
//   const sessionId = Reaction.sessionId = Random.id();
//
//   describe("cart/createCart", function () {
//     it("should create a test cart", function (done) {
//       spyOnMethod("mergeCart", userId);
//       spyOn(Reaction, "shopIdAutoValue").and.returnValue(shop._id);
//       spyOn(Reaction, "getShopId").and.returnValue(shop._id);
//       spyOn(Collections.Cart, "insert").and.callThrough();
//
//       let cartId = Meteor.call("cart/createCart", userId, sessionId);
//       let cart = Collections.Cart.findOne({
//         userId: userId
//       });
//       expect(Collections.Cart.insert).toHaveBeenCalled();
//       expect(cartId).toEqual(cart._id);
//
//       done();
//     });
//   });
//
//   describe("cart/addToCart", function () {
//     const quantity = 1;
//     let product;
//     let productId;
//     let variantId;
//
//     before(() => {
//       // this is needed for `inventory/register`
//       spyOn(Reaction, "hasPermission").and.returnValue(true);
//       product = faker.reaction.products.add();
//       productId = product._id;
//       variantId = Collections.Products.findOne({
//         ancestors: [productId]
//       })._id;
//     });
//
//     beforeEach(function () {
//       Collections.Cart.remove({});
//     });
//
//     it("should add item to cart", function (done) {
//         let cart = Factory.create("cart");
//         let items = cart.items.length;
//         spyOnMethod("addToCart", cart.userId);
//         Meteor.call("cart/addToCart", productId, variantId, quantity);
//         cart = Collections.Cart.findOne(cart._id);
//
//         expect(cart.items.length).toEqual(items + 1);
//         expect(cart.items[cart.items.length - 1].productId).toEqual(productId);
//
//         done();
//       }
//     );
//
//     it("should merge all items of same variant in cart",
//       function (done) {
//         spyOn(Reaction, "shopIdAutoValue").and.returnValue(shop._id);
//         spyOn(Reaction, "getShopId").and.returnValue(shop._id);
//         spyOnMethod("addToCart", userId);
//         const cartId = Meteor.call("cart/createCart", userId, sessionId);
//
//         Meteor.call("cart/addToCart", productId, variantId, quantity);
//         // add a second item of same variant
//         Meteor.call("cart/addToCart", productId, variantId, quantity);
//         let cart = Collections.Cart.findOne(cartId);
//
//         expect(cart.items.length).toEqual(1);
//         expect(cart.items[0].quantity).toEqual(2);
//
//         return done();
//       }
//     );
//
//     it(
//       "should throw error an exception if user doesn't have a cart",
//       done => {
//         const  userWithoutCart = Factory.create("user");
//         spyOnMethod("addToCart", userWithoutCart._id);
//         expect(() => {
//           return Meteor.call("cart/addToCart", productId, variantId,
//             quantity);
//         }).toThrow(new Meteor.Error(404, "Cart not found",
//           "Cart not found for user with such id"));
//
//         return done();
//       }
//     );
//
//     it(
//       "should throw error an exception if product doesn't exists",
//       done => {
//         const  cart = Factory.create("cart");
//         spyOnMethod("addToCart", cart.userId);
//         expect(() => {
//           return Meteor.call("cart/addToCart", "fakeProductId", variantId,
//             quantity);
//         }).toThrow(new Meteor.Error(404, "Product not found",
//           "Product with such id was not found!"));
//
//         return done();
//       }
//     );
//   });
//
//   // describe.skip("cart/removeFromCart", function () {
//   //   beforeEach(function () {
//   //     Collections.Cart.remove({});
//   //     // we want to avoid calling this method while testing `cart/removeFromCart`
//   //     spyOn(Meteor.server.method_handlers, "cart/resetShipmentMethod").and.
//   //     callFake(() => true);
//   //   });
//
//
//   describe("cart/copyCartToOrder", function () {
//     it("should throw error if cart user not current user",
//       done => {
//         const cart = Factory.create("cart");
//         spyOnMethod("copyCartToOrder", "wrongUserId");
//         expect(() => {
//           return Meteor.call("cart/copyCartToOrder", cart._id);
//         }).toThrow(new Meteor.Error(403, "Access Denied"));
//         return done();
//       }
//     );
//
//     it("should throw error if cart has not items", function(done) {
//         const user1 = Factory.create("user");
//         spyOn(Reaction, "getShopId").and.returnValue(shop._id);
//         spyOn(Collections.Accounts, "findOne").and.returnValue({
//           emails: [{
//             address: "test@localhost",
//             provides: "default"
//           }]
//         });
//         spyOnMethod("copyCartToOrder", user1._id);
//         const cartId = Meteor.call("cart/createCart", user1._id, sessionId);
//         expect(cartId).toBeDefined();
//         expect(() => {
//           return Meteor.call("cart/copyCartToOrder", cartId);
//         }).toThrow(new Meteor.Error("An error occurred saving the order." +
//           " Missing cart items."));
//
//         return done();
//       }
//     );
//
//     it("should throw an error if order creation was failed", function (done) {
//         const cart = Factory.create("cartToOrder");
//         spyOnMethod("copyCartToOrder", cart.userId);
//         // The main moment of test. We are spy on `insert` operation but do not
//         // let it through this call
//         spyOn(Collections.Orders, "insert");
//         expect(() => {
//           return Meteor.call("cart/copyCartToOrder", cart._id);
//         }).toThrow(new Meteor.Error(400,
//           "cart/copyCartToOrder: Invalid request"));
//         expect(Collections.Orders.insert).toHaveBeenCalled();
//
//         return done();
//       }
//     );
//
//     it("should create an order", function (done) {
//         let cart = Factory.create("cartToOrder");
//         spyOn(Reaction, "shopIdAutoValue").and.returnValue(cart.shopId);
//         spyOn(Reaction, "getShopId").and.returnValue(cart.shopId);
//         spyOnMethod("copyCartToOrder", cart.userId);
//         // let's keep it simple. We don't want to see a long email about
//         // success. But I leave it here in case if anyone want to check whole
//         // method flow.
//         spyOn(Collections.Orders, "insert");//
//         // const orderId = Meteor.call("cart/copyCartToOrder", cart._id);
//         expect(() => Meteor.call("cart/copyCartToOrder", cart._id)).
//         toThrow(new Meteor.Error(400,
//           "cart/copyCartToOrder: Invalid request"));
//         // we are satisfied with the following check
//         expect(Collections.Orders.insert).toHaveBeenCalled();
//         // expect(typeof orderId).toEqual("string");
//
//         return done();
//       }
//     );
//   });
//
//   // describe("cart/unsetAddresses", function () {
//   //   it("should correctly remove addresses from cart", function (done) {
//   //       let cart = Factory.create("cart");
//   //       spyOnMethod("setShipmentAddress", cart.userId);
//   //       spyOnMethod("setPaymentAddress", cart.userId);
//   //
//   //       const cartId = cart._id;
//   //       const address = Object.assign({}, faker.reaction.address(), {
//   //         _id: Random.id(),
//   //         isShippingDefault: true,
//   //         isBillingDefault: true
//   //       });
//   //
//   //       Meteor.call("cart/setPaymentAddress", cartId, address);
//   //       Meteor.call("cart/setShipmentAddress", cartId, address);
//   //       cart = Collections.Cart.findOne(cartId);
//   //       expect(cart.shipping[0].address._id).toEqual(address._id);
//   //       expect(cart.billing[0].address._id).toEqual(address._id);
//   //
//   //       // our Method checking
//   //       Meteor.call("cart/unsetAddresses", address._id, cart.userId);
//   //
//   //       cart = Collections.Cart.findOne(cartId);
//   //
//   //       expect(cart.shipping[0].address).toBeUndefined();
//   //       expect(cart.billing[0].address).toBeUndefined();
//   //
//   //       return done();
//   //     }
//   //   );
//   //
//   //   it("should throw error if wrong arguments were passed", function (done) {
//   //       spyOn(Collections.Accounts, "update");
//   //
//   //       expect(function () {
//   //         return Meteor.call("cart/unsetAddresses", 123456);
//   //       }).toThrow();
//   //
//   //       expect(function () {
//   //         return Meteor.call("cart/unsetAddresses", {});
//   //       }).toThrow();
//   //
//   //       expect(function () {
//   //         return Meteor.call("cart/unsetAddresses", null);
//   //       }).toThrow();
//   //
//   //       expect(function () {
//   //         return Meteor.call("cart/unsetAddresses");
//   //       }).toThrow();
//   //
//   //       expect(function () {
//   //         return Meteor.call("cart/unsetAddresses", "asdad", 123);
//   //       }).toThrow();
//   //
//   //       // https://github.com/aldeed/meteor-simple-schema/issues/522
//   //       expect(function () {
//   //         return Meteor.call(
//   //           "accounts/addressBookRemove", () => {
//   //             console.log("test");
//   //           }
//   //         );
//   //       }).not.toThrow();
//   //       expect(Collections.Accounts.update).not.toHaveBeenCalled();
//   //       return done();
//   //     }
//   //   );
//   //
//   //   it("should update cart via `type` argument", function (done) {
//   //       let cart = Factory.create("cart");
//   //       spyOnMethod("setShipmentAddress", cart.userId);
//   //       spyOnMethod("setPaymentAddress", cart.userId);
//   //
//   //       const cartId = cart._id;
//   //       const address = Object.assign({}, faker.reaction.address(), {
//   //         _id: Random.id(),
//   //         isShippingDefault: true,
//   //         isBillingDefault: true
//   //       });
//   //       Meteor.call("cart/setPaymentAddress", cartId, address);
//   //       Meteor.call("cart/setShipmentAddress", cartId, address);
//   //       cart = Collections.Cart.findOne(cartId);
//   //
//   //       expect(cart.shipping[0].address._id).to.equal(address._id);
//   //       expect(cart.billing[0].address._id).to.equal(address._id);
//   //
//   //       Meteor.call("cart/unsetAddresses", address._id, cart.userId, "billing");
//   //       Meteor.call("cart/unsetAddresses", address._id, cart.userId, "shipping");
//   //
//   //       cart = Collections.Cart.findOne(cartId);
//   //
//   //       expect(cart.shipping[0].address).to.be.undefined;
//   //       expect(cart.billing[0].address).to.be.undefined;
//   //
//   //       return done();
//   //     });
//   // });
// });

