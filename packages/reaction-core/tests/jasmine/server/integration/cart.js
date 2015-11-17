/* eslint dot-notation: 0 */
describe("cart methods", function () {
  let userId = Factory.create("user");
  ReactionCore.sessionId = "deadbeef"; // Required for creating a cart
  let cartId;

  describe("cart/createCart", function () {
    it("should create a test cart", function (done) {
      cartId = Meteor.call("cart/createCart", userId);
      let cart = ReactionCore.Collections.Cart.findOne({
        userId: userId
      });
      expect(cartId).toEqual(cart._id);
      done();
    });
  });
  describe("cart items", function () {
    beforeEach(function () {

      // Empty test cart
      ReactionCore.Collections.Cart.update({
        _id: cartId
      }, {
        $pull: {
          items: {}
        }
      });
    });
    describe("cart/addToCart", function () {
      it("should add item to cart", function (done) {
        let product = Factory.create("product");
        let productId = product._id;
        let variantData = product.variants[0];
        let quantity = 1;
        Meteor.call("cart/addToCart", cartId, productId,
          variantData, quantity);
        let carts = Cart.find({
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
        let product = Factory.create("product");
        let productId = product._id;
        let variantData = product.variants[0];
        let quantity = 1;
        Meteor.call("cart/addToCart", cartId, productId,
          variantData, quantity);
        // add a second item of same variant
        Meteor.call("cart/addToCart", cartId, productId,
          variantData, quantity);
        let carts = Cart.find({
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
        let product = Factory.create("product");
        let productId = product._id;
        let variantData = product.variants[0];
        let quantity = 1;
        Meteor.call("cart/addToCart", cartId, productId,
          variantData, quantity);
        let carts = Cart.find({
          _id: cartId
        }, {
          items: product
        }).fetch();
        let cartItem = carts[0].items[0];
        Meteor.call("cart/removeFromCart", cartId, cartItem);
        carts = ReactionCore.Collections.Cart.find({
          _id: cartId
        }, {
          items: product
        }).fetch();
        expect(_.size(carts[0].items)).toEqual(0);
        done();
      });
    });
  });
});
