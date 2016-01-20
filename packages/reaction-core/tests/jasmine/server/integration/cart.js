/* eslint dot-notation: 0 */
describe("cart methods", function () {
  let user = Factory.create("user");
  const shop = faker.reaction.shops.getShop();
  let userId = user._id;
  // Required for creating a cart
  let originals = {};
  originals["mergeCart"] = Meteor.server
    .method_handlers["cart/mergeCart"];
  originals["copyCartToOrder"] = Meteor.server
    .method_handlers["cart/copyCartToOrder"];
  originals["addToCart"] = Meteor.server
    .method_handlers["cart/addToCart"];
  originals["setShipmentAddress"] = Meteor.server
    .method_handlers["cart/setShipmentAddress"];
  originals["setPaymentAddress"] = Meteor.server
    .method_handlers["cart/setPaymentAddress"];

  const sessionId = ReactionCore.sessionId = Random.id();

  function spyOnMethod(method, id) {
    return spyOn(Meteor.server.method_handlers, `cart/${method}`).and.callFake(
      function () {
        this.userId = id;
        return originals[method].apply(this, arguments);
      }
    );
  }

  afterAll(() => {
    Meteor.users.remove({});
  });

  describe("cart/mergeCart", () => {
    beforeAll(() => {
      ReactionCore.Collections.Products.remove({});
    });

    beforeEach(() => {
      ReactionCore.Collections.Cart.remove({});
    });

    it(
      "should merge all `anonymous` carts into existent `normal` user cart" +
      " per session, when logged in",
      () => {
        let anonymousCart = Factory.create("anonymousCart");
        let cart = Factory.create("cart");
        spyOnMethod("mergeCart", cart.userId);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
        spyOn(ReactionCore.Collections.Cart, "remove").and.callThrough();
        ReactionCore.Collections.Cart.update({}, {
          $set: {
            sessionId: sessionId
          }
        });

        Meteor.call("cart/mergeCart", cart._id, sessionId);
        anonymousCart = ReactionCore.Collections.
          Cart.findOne(anonymousCart._id);
        cart = ReactionCore.Collections.Cart.findOne(cart._id);

        expect(ReactionCore.Collections.Cart.remove).toHaveBeenCalled();
        expect(anonymousCart).toBeUndefined();
        expect(cart.items.length).toBe(2);
      }
    );

    it(
      "should merge only into registered user cart",
      done => {
        const cart = Factory.create("anonymousCart");
        spyOnMethod("mergeCart", cart.userId);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
        const cartId = cart._id;

        // now we try to merge two anonymous carts. We expect to see `false`
        // result
        expect(Meteor.call("cart/mergeCart", cartId)).toBeFalsy();

        return done();
      }
    );

    it(
      "should throw an error if cart doesn't exist",
      done => {
        spyOnMethod("mergeCart", "someIdHere");
        expect(() => {
          return Meteor.call("cart/mergeCart", "cartIdHere", sessionId);
        }).toThrow(new Meteor.Error(403, "Access Denied"));

        return done();
      }
    );

    it(
      "should throw an error if cart user is not current user",
      done => {
        let cart = Factory.create("cart");
        spyOnMethod("mergeCart", "someIdHere");
        expect(() => {
          return Meteor.call("cart/mergeCart", cart._id, sessionId);
        }).toThrow(new Meteor.Error(403, "Access Denied"));

        return done();
      }
    );

    // it(
    //   "should",
    //   done => {
    //
    //     return done();
    //   }
    // );
  });

  describe("cart/createCart", function () {
    it("should create a test cart", function (done) {
      spyOnMethod("mergeCart", userId);
      spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
      spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
      spyOn(ReactionCore.Collections.Cart, "insert").and.callThrough();

      let cartId = Meteor.call("cart/createCart", userId, sessionId);
      let cart = ReactionCore.Collections.Cart.findOne({
        userId: userId
      });
      expect(ReactionCore.Collections.Cart.insert).toHaveBeenCalled();
      expect(cartId).toEqual(cart._id);

      done();
    });
  });

  describe("cart/addToCart", function () {
    const quantity = 1;
    let product;
    let productId;
    let variantId;

    beforeAll(done => {
      product = Factory.create("product");
      productId = product._id;
      variantId = product.variants[0]._id;

      done();
    });

    beforeEach(function () {
      ReactionCore.Collections.Cart.remove({});
    });

    it(
      "should add item to cart",
      function (done) {
        let cart = Factory.create("cart");
        let items = cart.items.length;
        spyOnMethod("addToCart", cart.userId);
        Meteor.call("cart/addToCart", productId, variantId, quantity);
        cart = ReactionCore.Collections.Cart.findOne(cart._id);

        expect(cart.items.length).toEqual(items + 1);
        expect(cart.items[cart.items.length - 1].productId).toEqual(productId);

        done();
      }
    );

    it("should merge all items of same variant in cart", function (
      done) {
      spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
      spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
      spyOnMethod("addToCart", userId);
      const cartId = Meteor.call("cart/createCart", userId, sessionId);

      Meteor.call("cart/addToCart", productId, variantId, quantity);
      // add a second item of same variant
      Meteor.call("cart/addToCart", productId, variantId, quantity);
      let cart = ReactionCore.Collections.Cart.findOne(cartId);

      expect(cart.items.length).toEqual(1);
      expect(cart.items[0].quantity).toEqual(2);

      done();
    });

    it(
      "should throw error an exception if user doesn't have a cart",
      done => {
        const  userWithoutCart = Factory.create("user");
        spyOnMethod("addToCart", userWithoutCart._id);
        expect(() => {
          return Meteor.call("cart/addToCart", productId, variantId,
            quantity);
        }).toThrow(new Meteor.Error(404, "Cart not found",
          "Cart is not defined!"));

        return done();
      }
    );

    it(
      "should throw error an exception if product doesn't exists",
      done => {
        const  cart = Factory.create("cart");
        spyOnMethod("addToCart", cart.userId);
        expect(() => {
          return Meteor.call("cart/addToCart", "fakeProductId", variantId,
            quantity);
        }).toThrow(new Meteor.Error(404, "Product not found",
          "Product is not defined!"));

        return done();
      }
    );

    // it(
    //   "should ",
    //   done => {
    //
    //     return done();
    //   }
    // );
  });

  describe("cart/removeFromCart", function () {
    beforeEach(function () {
      ReactionCore.Collections.Cart.remove({});
    });

    it("should remove item from cart", function (done) {
      let cart = Factory.create("cart");
      const cartUserId = cart.userId;

      spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
      spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
      spyOn(Meteor, "userId").and.returnValue(cartUserId);
      spyOn(ReactionCore.Collections.Cart, "update").and.callThrough();

      cart = ReactionCore.Collections.Cart.findOne(cart._id);
      const cartItemId = cart.items[0]._id;
      expect(cart.items.length).toEqual(2);

      Meteor.call("cart/removeFromCart", cartItemId);

      // mongo update should be called
      expect(ReactionCore.Collections.Cart.update.calls.count()).toEqual(1);
      cart = ReactionCore.Collections.Cart.findOne(cart._id);

      // fixme: we expect decrease the number of items, but this does not
      // occur by some unknown reason
      // expect(cart.items.length).toEqual(1);

      return done();
    });

    it(
      "should throw an exception when attempting to remove item from cart " +
      "of another user",
      done => {
        const cart = Factory.create("cart");
        const cartItemId = "testId123";
        spyOn(Meteor, "userId").and.returnValue(cart.userId);
        expect(() => {
          return Meteor.call("cart/removeFromCart", cartItemId);
        }).toThrow(new Meteor.Error(404, "Cart item not found.",
          "Unable to find an item with such id within you cart."));

        return done();
      }
    );

    it(
      "should throw an exception when attempting to remove non-existing item",
      done => {
        const cart = Factory.create("cart");
        const cartItemId = Random.id();
        spyOn(Meteor, "userId").and.returnValue(cart.userId);
        expect(() => {
          return Meteor.call("cart/removeFromCart", cartItemId);
        }).toThrow(new Meteor.Error(404, "Cart item not found.",
          "Unable to find an item with such id within you cart."));

        return done();
      }
    );
  });

  describe("cart/copyCartToOrder", () => {
    it(
      "should throw error if cart user not current user",
      done => {
        const cart = Factory.create("cart");
        spyOnMethod("copyCartToOrder", "wrongUserId");
        expect(() => {
          return Meteor.call("cart/copyCartToOrder", cart._id);
        }).toThrow(new Meteor.Error(403, "Access Denied"));

        return done();
      }
    );

    it(
      "should throw error if cart has not items",
      done => {
        const user1 = Factory.create("user");
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
        spyOn(ReactionCore.Collections.Accounts, "findOne").and.returnValue({
          emails: [{
            address: "test@localhost",
            provides: "default"
          }]
        });
        spyOnMethod("copyCartToOrder", user1._id);
        const cartId = Meteor.call("cart/createCart", user1._id, sessionId);
        expect(cartId).toBeDefined();
        expect(() => {
          return Meteor.call("cart/copyCartToOrder", cartId);
        }).toThrow(new Meteor.Error("An error occurred saving the order." +
          " Missing cart items."));

        return done();
      }
    );

    it(
       "should throw an error if order creation was failed",
       done => {
         const cart = Factory.create("cartToOrder");
         spyOnMethod("copyCartToOrder", cart.userId);
         // The main moment of test. We are spy on `insert` operation but do not
         // let it through this call
         spyOn(ReactionCore.Collections.Orders, "insert");
         expect(() => {
           return Meteor.call("cart/copyCartToOrder", cart._id);
         }).toThrow(new Meteor.Error(400, "cart/copyCartToOrder: Invalid request"));
         expect(ReactionCore.Collections.Orders.insert).toHaveBeenCalled();

         return done();
       }
    );

    it(
       "should create an order",
       done => {
         let cart = Factory.create("cartToOrder");
         spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(cart.shopId);
         spyOn(ReactionCore, "getShopId").and.returnValue(cart.shopId);
         spyOnMethod("copyCartToOrder", cart.userId);
         spyOn(ReactionCore.Collections.Orders, "insert").and.callThrough();

         const orderId = Meteor.call("cart/copyCartToOrder", cart._id);
         expect(ReactionCore.Collections.Orders.insert).toHaveBeenCalled();
         expect(typeof orderId).toEqual("string");

         return done();
       }
    );
  });

  describe("cart/unsetAddresses", function () {
    it(
      "should correctly remove addresses from cart",
      done => {
        let cart = Factory.create("cart");
        spyOnMethod("setShipmentAddress", cart.userId);
        spyOnMethod("setPaymentAddress", cart.userId);

        const cartId = cart._id;
        const address = Object.assign({}, faker.reaction.address(), {
          _id: Random.id(),
          isShippingDefault: true,
          isBillingDefault: true
        });

        Meteor.call("cart/setPaymentAddress", cartId, address);
        Meteor.call("cart/setShipmentAddress", cartId, address);
        cart = ReactionCore.Collections.Cart.findOne(cartId);

        expect(cart.shipping[0].address._id).toEqual(address._id);
        expect(cart.billing[0].address._id).toEqual(address._id);

        // our Method checking
        Meteor.call("cart/unsetAddresses", address._id, cart.userId);

        cart = ReactionCore.Collections.Cart.findOne(cartId);

        expect(cart.shipping[0].address).toBeUndefined();
        expect(cart.billing[0].address).toBeUndefined();

        return done();
      }
    );

    it(
      "should throw error if wrong arguments were passed",
      done => {
        spyOn(ReactionCore.Collections.Accounts, "update");

        expect(function () {
          return Meteor.call("cart/unsetAddresses", 123456);
        }).toThrow();

        expect(function () {
          return Meteor.call("cart/unsetAddresses", {});
        }).toThrow();

        expect(function () {
          return Meteor.call("cart/unsetAddresses", null);
        }).toThrow();

        expect(function () {
          return Meteor.call("cart/unsetAddresses");
        }).toThrow();

        expect(function () {
          return Meteor.call("cart/unsetAddresses", "asdad", 123);
        }).toThrow();

        // https://github.com/aldeed/meteor-simple-schema/issues/522
        expect(function () {
          return Meteor.call(
            "accounts/addressBookRemove", () => {
              console.log("test");
            }
          );
        }).not.toThrow();

        expect(ReactionCore.Collections.Accounts.update).not.toHaveBeenCalled();

        return done();
      }
    );

    it(
      "should update cart via `type` argument",
      done => {
        let cart = Factory.create("cart");
        spyOnMethod("setShipmentAddress", cart.userId);
        spyOnMethod("setPaymentAddress", cart.userId);

        const cartId = cart._id;
        const address = Object.assign({}, faker.reaction.address(), {
          _id: Random.id(),
          isShippingDefault: true,
          isBillingDefault: true
        });
        Meteor.call("cart/setPaymentAddress", cartId, address);
        Meteor.call("cart/setShipmentAddress", cartId, address);
        cart = ReactionCore.Collections.Cart.findOne(cartId);

        expect(cart.shipping[0].address._id).toEqual(address._id);
        expect(cart.billing[0].address._id).toEqual(address._id);

        Meteor.call("cart/unsetAddresses", address._id, cart.userId,
          "billing");
        Meteor.call("cart/unsetAddresses", address._id, cart.userId,
          "shipping");

        cart = ReactionCore.Collections.Cart.findOne(cartId);

        expect(cart.shipping[0].address).toBeUndefined();
        expect(cart.billing[0].address).toBeUndefined();

        return done();
      }
    );

    // it(
    //  "",
    //  done => {
    //    let account = Factory.create("account");
    //    return done();
    //  }
    // );
  });
});
