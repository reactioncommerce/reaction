/* eslint dot-notation: 0 */
describe("cart methods", function () {
  const user = Factory.create("user");
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
      return done();
    });
  });

  //describe("cart items", function () {
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
      //let cart;
      //let cartId;
      //let cartItemId;

      //beforeEach(function () {
      //  ReactionCore.Collections.Cart.remove({});
      //});

      //it("should remove item from cart", function (done) {
      //  let cart = Factory.create("cart");
      //  let cartId = cart._id;
      //  spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
      //  spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
      //  spyOn(Meteor, "userId").and.returnValue(cart.userId);
      //
      //
      //  //let cartId = Meteor.call("cart/createCart", userId);
      //  //let product = Factory.create("product");
      //  //let productId = product._id;
      //  //let variantData = product.variants[0];
      //  //let quantity = 1;
      //  //
      //  //Meteor.call("cart/addToCart", cartId, productId,
      //  //  variantData, quantity);
      //  //let cart = ReactionCore.Collections.Cart.findOne(cartId);
      //  let cartItemId = cart.items[1]._id;
      //  console.dir(cart.items[1]);
      //  //expect(cart.items.length).toEqual(1);
      //  //expect(cart.items[0]).toBeDefined();
      //
      //  //console.dir(cart);
      //  //spyOn(Meteor, "call").and.callThrough();
      //  spyOn(ReactionCore.Collections.Cart, "update").and.callThrough();
      //  //Meteor.setTimeout(() => {
      //  Meteor.call("cart/removeFromCart", cartItemId);
      //  //}, 1000);
      //  Meteor.setTimeout(() => {
      //
      //  let modifiedCart = ReactionCore.Collections.Cart.findOne(cartId);
      //  expect(modifiedCart.items.length).toEqual(1);
      //  console.dir(modifiedCart.items[1]);
      //  //expect(modifiedCart.items[0]).toBeUndefined();
      //
      //  done();
      //  }, 2000);
      //  //Meteor.call("cart/removeFromCart", cartItemId, function (error, result) {
      //  //  expect(error).toBeUndefined();
      //  //  expect(result).toEqual(1);
      //  //  done();
      //  //});
      //  //
      //  //expect(Meteor.call).toHaveBeenCalled();
      //});
    });
  //});
});
