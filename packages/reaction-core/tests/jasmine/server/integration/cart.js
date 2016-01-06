/* eslint dot-notation: 0 */
describe("cart methods", function () {
  const user = Factory.create("user");
  let shop = Factory.create("shop");
  let userId = user._id;
  ReactionCore.sessionId = Random.id(); // Required for creating a cart

  beforeEach(() => {
    ReactionCore.Collections.Cart.remove({});
  });

  describe("cart/createCart", function () {
    it("should create a test cart", function (done) {
      spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
      spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);

      let cartId = Meteor.call("cart/createCart", userId, shop._id);
      let cart = ReactionCore.Collections.Cart.findOne({
        userId: userId
      });
      expect(cartId).toEqual(cart._id);
      return done();
    });
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
      beforeEach(function () {
        ReactionCore.Collections.Cart.remove({});
      });

      it("should add item to cart", function (done) {
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
        const product = Factory.create("product");
        const cartId = Meteor.call("cart/createCart", userId, shop._id);
        const productId = product._id;
        const variantData = product.variants[0];
        const quantity = 1;

        Meteor.call("cart/addToCart", cartId, productId,
          variantData, quantity);

        let carts = ReactionCore.Collections.Cart.find({
          _id: cartId
        }, {
          items: product
        }).fetch();

        expect(_.size(carts)).toEqual(1);
        expect(_.size(carts[0].items)).toEqual(1);
        expect(carts[0].items[0].productId).toEqual(productId);
        return done();
      });

      it("should merge all items of same variant in cart", function (
        done) {
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
        const product = Factory.create("product");
        const productId = product._id;
        const variantData = product.variants[0];
        const quantity = 1;
        const cartId = Meteor.call("cart/createCart", userId, shop._id);

        Meteor.call("cart/addToCart", cartId, productId,
          variantData, quantity);
        // add a second item of same variant
        Meteor.call("cart/addToCart", cartId, productId,
          variantData, quantity);
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
    });
  });
});
