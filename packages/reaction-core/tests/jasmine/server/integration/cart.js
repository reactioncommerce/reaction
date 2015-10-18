/* eslint dot-notation: 0 */
describe("cart methods", function () {

  //let userId = Factory.get("user");
  let userId = Meteor.users.insert({}); // Somehow Factory does not work
  // Create shop so that ReactionCore.getShopId() doesn't fail
  Factory.create("shop");
  ReactionCore.sessionId = "deadbeef"; // Required for creating a cart
  let cartId;

  describe("cart/createCart", function () {
    beforeEach(function () {
    });
    it("should create a cart", function (done) {
      cartId = Meteor.call("cart/createCart", userId);
      let cart = Cart.findOne({'userId': userId});
      expect(cartId).toEqual(cart._id);
      done();
    });
  });
  describe("cart/addToCart", function () {
    it("should add item to cart", function (done) {
      let product = Factory.create("product");
      let productId = product._id;
      let variantData = product.variants[0];
      let quantity = "1";
      Meteor.call("cart/addToCart", cartId, productId, variantData, quantity);
      let foundCarts = Cart.find({_id: cartId}, {items: product}).fetch();
      expect(_.size(foundCarts)).toEqual(1);
      expect(_.size(foundCarts[0].items)).toEqual(1);
      expect(foundCarts[0].items[0].productId).toEqual(productId);
      done();
    });
  });
});
