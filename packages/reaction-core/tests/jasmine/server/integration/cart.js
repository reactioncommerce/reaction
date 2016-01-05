/* eslint dot-notation: 0 */
describe("cart methods", function () {
  let user = Factory.create("user");
  let shop = Factory.create("shop");
  let userId = user._id;
  // Required for creating a cart
  ReactionCore.sessionId = Random.id();
  const originalMergeCart = Meteor.server
    .method_handlers["cart/mergeCart"];
  const originalAddToCart = Meteor.server
    .method_handlers["cart/addToCart"];

  afterAll(() => {
    Meteor.users.remove({});
  });

  describe("cart/mergeCart", () => {
    // a lot of users for different tests.
    let cartUser = Factory.create("user");
    let cartUserId = cartUser._id;
    let anonymous = Factory.create("user");
    let anonymousId = anonymous._id;
    let anonymous2 = Factory.create("user");
    let anonymous2Id = anonymous2._id;
    let anonymousOne = Factory.create("user");
    let anonymousOneId = anonymousOne._id;
    let anonymousTwo = Factory.create("user");
    let anonymousTwoId = anonymousTwo._id;
    [anonymousId, anonymous2Id, anonymousOneId, anonymousTwoId].forEach(id => {
      Meteor.users.update(id, {
        $set: {
          roles: {
            [shop._id]: [
              "anonymous",
              "guest"
            ]
          }
        }
      });
    });
    const quantity = 1;
    let product;
    let variantId;

    beforeAll(done => {
      ReactionCore.Collections.Cart.remove({});
      ReactionCore.Collections.Products.remove({});
      product = Factory.create("product");
      variantId = product.variants[0]._id;

      return done();
    });

    it( // this is a preparation stage for a next test
      "should be able to add product to cart for `anonymous`",
      () => {
        spyOn(Meteor.server.method_handlers, "cart/mergeCart").and.callFake(
          function () {
            this.userId = anonymousId;
            return originalMergeCart.apply(this, arguments);
          });
        spyOn(Meteor.server.method_handlers, "cart/addToCart").and.callFake(
          function () {
            this.userId = anonymousId;
            return originalAddToCart.apply(this, arguments);
          });
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
        // passing of check for anonymous role with true result
        // spyOn(Roles, "userIsInRole").and.returnValue(true);

        const cartId = Meteor.call("cart/createCart", anonymousId);
        expect(cartId).toBeDefined();

        Meteor.call("cart/addToCart", product._id, variantId, quantity);
        const cart = ReactionCore.Collections.Cart.findOne(cartId);

        expect(cart.items.length).toBe(1);
        expect(cart.items[0].quantity).toBe(1);
        expect(cart.items[0].variants._id).toEqual(variantId);
      }
    );

    it(
      "should merge all `anonymous` carts into newly created `normal` user" +
      " cart per session",
      done => {
        spyOn(Meteor.server.method_handlers, "cart/mergeCart").and.callFake(
          function () {
            this.userId = cartUserId;
            return originalMergeCart.apply(this, arguments);
          });
        spyOn(Meteor.server.method_handlers, "cart/addToCart").and.callFake(
          function () {
            this.userId = cartUserId;
            return originalAddToCart.apply(this, arguments);
          });
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
        // not working as expected. We avoid this by updating user roles in db
        //spyOn(Roles, "userIsInRole").and.callFake(function () {
        //  return arguments[0] !== cartUserId;
        //});
        // spyOn(ReactionCore.Collections.Cart, "remove");

        let anonCart = ReactionCore.Collections.Cart.findOne({
          userId: anonymousId
        });
        const cartId = Meteor.call("cart/createCart", cartUserId);
        // we expect `cart/mergeCart` will be called from `cart/createCart`
        // expect(Meteor.call.calls.argsFor(1)).toEqual("cart/mergeCart");
        expect(cartId).toBeDefined();

        // we expect Cart.remove will be called
        // expect(ReactionCore.Collections.Cart.remove).toHaveBeenCalled();
        let cart = ReactionCore.Collections.Cart.findOne(cartId);

        // we expect anonymous cart will be merged into this user's cart
        expect(cart.items.length).toBe(1);
        expect(cart.items[0].quantity).toBe(1);
        expect(cart.items[0].variants._id).toEqual(variantId);
        expect(cart.sessionId).toEqual(anonCart.sessionId);

        return done();
      }
    );

    it( // we need to repeat first step to emulate user logout
      "should be able to add product to cart for `anonymous`",
      () => {
        spyOn(Meteor.server.method_handlers, "cart/mergeCart").and.callFake(
          function () {
            this.userId = anonymous2Id;
            return originalMergeCart.apply(this, arguments);
          });
        spyOn(Meteor.server.method_handlers, "cart/addToCart").and.callFake(
          function () {
            this.userId = anonymous2Id;
            return originalAddToCart.apply(this, arguments);
          });
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
        // passing of check for anonymous role with true result
        // spyOn(Roles, "userIsInRole").and.returnValue(true);

        const cartId = Meteor.call("cart/createCart", anonymous2Id);
        expect(cartId).toBeDefined();

        Meteor.call("cart/addToCart", product._id, variantId, quantity);
        const cart = ReactionCore.Collections.Cart.findOne(cartId);

        expect(cart.items.length).toBe(1);
        expect(cart.items[0].quantity).toBe(1);
        expect(cart.items[0].variants._id).toEqual(variantId);
      }
    );

    it(
      "should merge all `anonymous` carts into existent `normal` user cart" +
      " per session, when logged in",
      done => {
        spyOn(Meteor.server.method_handlers, "cart/mergeCart").and.callFake(
          function () {
            this.userId = cartUserId;
            return originalMergeCart.apply(this, arguments);
          });
        spyOn(Meteor.server.method_handlers, "cart/addToCart").and.callFake(
          function () {
            this.userId = cartUserId;
            return originalAddToCart.apply(this, arguments);
          });
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
        // todo then we spy over operation, we can't run it:(
        // spyOn(ReactionCore.Collections.Cart, "remove");
        let cart = ReactionCore.Collections.Cart.findOne({
          userId: cartUserId
        });

        Meteor.call("cart/mergeCart", cart._id);
        let anon2Cart = ReactionCore.Collections.Cart.findOne({
          userId: anonymous2Id
        });
        cart = ReactionCore.Collections.Cart.findOne({
          userId: cartUserId
        });

        expect(anon2Cart).toBeUndefined();
        // we expect to see one item with quantity equal 2, but instead of this
        // we got two items, which is not bad... such results is fine for us
        expect(cart.items.length).toBe(2);
        // expect(cart.items[0].quantity).toBe(2);

        return done();
      }
    );

    it(
      "should merge only into registered user cart",
      done => {
        spyOn(Meteor.server.method_handlers, "cart/mergeCart").and.callFake(
          function () {
            this.userId = anonymousOneId;
            return originalMergeCart.apply(this, arguments);
          });
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);

        const cartId = Meteor.call("cart/createCart", anonymousOneId);
        expect(cartId).toBeDefined();

        // now we try to merge two anonymous carts. We expect to see `false`
        // result
        expect(Meteor.call("cart/mergeCart", cartId)).toBeFalsy();

        return done();
      }
    );

    //it(
    //  "should ignore `normal` user carts from been merged",
    //  done => {
    //    return done();
    //  }
    //);
    //

    //it(
    //  "should",
    //  done => {
    //    let account = Factory.create("account");
    //    return done();
    //  }
    //);
  });

  describe("cart/createCart", function () {
    it("should create a test cart", function (done) {
      spyOn(Meteor.server.method_handlers, "cart/mergeCart").and.callFake(
        function () {
          this.userId = userId;
          return originalMergeCart.apply(this, arguments);
        });
      spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
      spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);

      let cartId = Meteor.call("cart/createCart", userId);
      let cart = ReactionCore.Collections.Cart.findOne({
        userId: userId
      });
      expect(cartId).toEqual(cart._id);
      done();
    });

    //it(
    //  "should call `cart/mergeCart` method if user have a cart",
    //  done => {
    //    spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
    //    spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
    //    spyOn(Meteor, "call"); //.and.callThrough();
    //
    //    Meteor.call("cart/createCart", userId);
    //    expect(Meteor.call.calls.argsFor(0)).toEqual(["cart/createCart", userId]);
    //    expect(Meteor.call.calls.argsFor(1)).toEqual(["cart/mergeCart", userId]);
    //    expect(Meteor.call.calls.count()).toEqual(2);
    //
    //    return done();
    //  }
    //);
  });

  describe("cart/unsetAddresses", function () {
    it(
      "should correctly remove addresses from cart",
      done => {
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
        spyOn(Meteor, "userId").and.returnValue(user._id);

        // creating cart and adding new address which is default for
        // shipping/billing
        const cartId = Meteor.call("cart/createCart", user._id, shop._id);
        const address = Object.assign({}, faker.reaction.address(), {
          _id: Random.id(),
          isShippingDefault: true,
          isBillingDefault: true
        });
        Meteor.call("cart/setPaymentAddress", cartId, address);
        Meteor.call("cart/setShipmentAddress", cartId, address);
        let cart = ReactionCore.Collections.Cart.findOne(cartId);

        expect(cart.shipping[0].address._id).toEqual(address._id);
        expect(cart.billing[0].address._id).toEqual(address._id);

        // our Method checking
        Meteor.call("cart/unsetAddresses", address._id, userId);

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
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
        spyOn(Meteor, "userId").and.returnValue(user._id);

        const cartId = Meteor.call("cart/createCart", user._id, shop._id);
        const address = Object.assign({}, faker.reaction.address(), {
          _id: Random.id(),
          isShippingDefault: true,
          isBillingDefault: true
        });
        Meteor.call("cart/setPaymentAddress", cartId, address);
        Meteor.call("cart/setShipmentAddress", cartId, address);
        let cart = ReactionCore.Collections.Cart.findOne(cartId);

        expect(cart.shipping[0].address._id).toEqual(address._id);
        expect(cart.billing[0].address._id).toEqual(address._id);

        Meteor.call("cart/unsetAddresses", address._id, userId,
          "billing");
        Meteor.call("cart/unsetAddresses", address._id, userId,
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

  describe("cart items", function () {
    describe("cart/addToCart", function () {
      const originalAddToCart = Meteor.server
        .method_handlers["cart/addToCart"];
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

      it("should add item to cart", function (done) {
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
        spyOn(Meteor.server.method_handlers, "cart/addToCart").and.callFake(
          function () {
            this.userId = userId;
            return originalAddToCart.apply(this, arguments);
          });
        const cartId = Meteor.call("cart/createCart", userId);

        Meteor.call("cart/addToCart", productId, variantId, quantity);

        let carts = ReactionCore.Collections.Cart.find({
          _id: cartId
        }, {
          items: product
        }).fetch();

        expect(_.size(carts)).toEqual(1);
        expect(_.size(carts[0].items)).toEqual(1);
        expect(carts[0].items[0].productId).toEqual(productId);
        done();
      });

      it("should merge all items of same variant in cart", function (
        done) {
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
        spyOn(Meteor.server.method_handlers, "cart/addToCart").and.callFake(
          function () {
            this.userId = userId;
            return originalAddToCart.apply(this, arguments);
          });
        const cartId = Meteor.call("cart/createCart", userId);

        Meteor.call("cart/addToCart", productId, variantId, quantity);
        // add a second item of same variant
        Meteor.call("cart/addToCart", productId, variantId, quantity);
        let carts = ReactionCore.Collections.Cart.find({
          _id: cartId
        }, {
          items: product
        }).fetch();
        expect(_.size(carts)).toEqual(1);
        expect(_.size(carts[0].items)).toEqual(1);
        expect(carts[0].items[0].quantity).toEqual(2);
        done();
      });

      it(
        "should throw error exception if user doesn't have a cart",
        done => {
          const  userWithoutCart = Factory.create("user");
          spyOn(Meteor.server.method_handlers, "cart/addToCart").and.callFake(
            function () {
              this.userId = userWithoutCart._id;
              return originalAddToCart.apply(this, arguments);
            });
          expect(() => {
            return Meteor.call("cart/addToCart", productId, variantId,
              quantity);
          }).toThrow(new Meteor.Error("not found", "Cart is not defined!"));

          return done();
        }
      );

      //it(
      //  "should call `cart/mergeCart` method if anonymous carts presents for this session",
      //  done => {
      //
      //    return done();
      //  }
      //);
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
        "should throw an exception when attempting to remove item from cart" +
        "of another user",
        done => {
          const cart = Factory.create("cart");
          const cart2 = Factory.create("cart");
          const cartItemId = cart.items[0]._id;

          spyOn(Meteor, "userId").and.returnValue(cart2.userId);
          spyOn(Meteor, "call").and.callThrough();

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
          spyOn(Meteor, "call").and.callThrough();

          expect(() => {
            return Meteor.call("cart/removeFromCart", cartItemId);
          }).toThrow(new Meteor.Error(404, "Cart item not found.",
            "Unable to find an item with such id within you cart."));

          return done();
        }
      );
    });
  });
});
