/* eslint dot-notation: 0 */
describe("cart methods", function () {
  //let userId = Factory.get("user");
  let userId = Meteor.users.insert({}); // Somehow Factory does not work
  // Create shop so that ReactionCore.getShopId() doesn't fail
  Factory.create("shop");
  ReactionCore.sessionId = "deadbeef"; // Required for creating a cart

  describe("cart/createCart", function () {
    beforeEach(function () {
    });
    it("should create a cart", function (done) {
      let cartId = Meteor.call("cart/createCart", userId);
      let cart = Cart.findOne({'userId': userId});
      expect(cartId).toEqual(cart._id);
      done();
    });
  });
});

