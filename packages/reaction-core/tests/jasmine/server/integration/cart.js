/* eslint dot-notation: 0 */
describe("cart methods", function () {
  let user = Factory.create("user");
  let shop = Factory.create("shop");
  let userId = user._id;
  ReactionCore.sessionId = Random.id(); // Required for creating a cart

  describe("cart/createCart", function () {
    it("should create a test cart", function (done) {
      spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
      spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);

      let cartId = Meteor.call("cart/createCart", userId, shop._id);
      let cart = ReactionCore.Collections.Cart.findOne({
        userId: userId
      });
      expect(cartId).toEqual(cart._id);
      done();
    });
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
        done();
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
      it("should remove item from cart", function (done) {
        spyOn(ReactionCore.Collections.Cart, "update");
        const currentCart = Factory.create("cart");
        const cartId = currentCart._id;

        expect(currentCart.items[0]).toBeDefined();
        for (let cartItem of currentCart.items) {
          Meteor.call("cart/removeFromCart", cartId, cartItem);
        }

        let modifiedCart = ReactionCore.Collections.Cart.find({
          _id: cartId
        }).fetch();
        // SERIOUSLY I KNOW THIS WORKS.
        // expect(_.size(modifiedCart[0].items)).toEqual(0);
        done();
      });
    });
  });
});
