describe("Publication", function () {
  let shop;
  beforeEach(function () {
    // reset
    ReactionCore.Collections.Cart.remove({});
    ReactionCore.Collections.Orders.remove({});
    ReactionCore.Collections.Products.remove({});
    ReactionCore.Collections.Shops.remove({});
    // insert products and shops
    shop = Factory.create("shop");
  });

  describe("with products", function () {
    beforeEach(function () {
      ReactionCore.Collections.Products.insert({
        title: "My Little Pony",
        shopId: shop._id,
        type: "simple",
        variants: [],
        isVisible: false
      });
      ReactionCore.Collections.Products.insert({
        title: "Shopkins - Peachy",
        shopId: shop._id,
        type: "simple",
        variants: [],
        isVisible: true
      });
    });

    describe("Products", function () {
      it("should return all products to admins", function () {
        // setup
        spyOn(ReactionCore, "getCurrentShop").and.returnValue(
          shop);
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        // execute
        const cursor = Meteor.server.publish_handlers.Products();
        // verify
        const data = cursor.fetch()[0];
        expect(data.title).toEqual("My Little Pony");
      });
      it("should return only visible products to visitors",
        function () {
          // setup
          spyOn(ReactionCore, "getCurrentShop").and.returnValue(
            shop);
          spyOn(Roles, "userIsInRole").and.returnValue(false);
          // execute
          const cursor = Meteor.server.publish_handlers.Products();
          // verify
          const data = cursor.fetch()[0];
          expect(data.title).toEqual("Shopkins - Peachy");
        });
      it(
        "should return products from all shops when multiple shops are provided",
        function () {
          // setup
          let shopIds = [shop._id];
          const productScrollLimit = 20;
          spyOn(ReactionCore, "getCurrentShop").and.returnValue({
            _id: "123"
          });
          spyOn(Roles, "userIsInRole").and.returnValue(true);
          // execute
          const cursor = Meteor.server.publish_handlers.Products(
            productScrollLimit, shopIds);
          // verify
          const data = cursor.fetch()[0];
          expect(data.title).toEqual("My Little Pony");
        });
    });

    describe("Product", function () {
      it("should return a product based on an id", function () {
        // setup
        const product = ReactionCore.Collections.Products.findOne({
          isVisible: true
        });
        spyOn(ReactionCore, "getCurrentShop").and.returnValue(
          shop);
        // execute
        const cursor = Meteor.server.publish_handlers.Product(
          product._id);
        // verify
        const data = cursor.fetch()[0];
        expect(data.title).toEqual("Shopkins - Peachy");
      });

      it("should return a product based on a regex", function () {
        // setup
        spyOn(ReactionCore, "getCurrentShop").and.returnValue(
          shop);
        // execute
        const cursor = Meteor.server.publish_handlers.Product(
          "shopkins");
        // verify
        const data = cursor.fetch()[0];
        expect(data.title).toEqual("Shopkins - Peachy");
      });

      it(
        "should not return a product based on a regex if it isn't visible",
        function () {
          // setup
          spyOn(ReactionCore, "getCurrentShop").and.returnValue(
            shop);
          spyOn(Roles, "userIsInRole").and.returnValue(false);
          // execute
          const cursor = Meteor.server.publish_handlers.Product("my");
          // verify
          const data = cursor.fetch()[0];
          expect(data).toBeUndefined();
        });

      it(
        "should not return a product based on a regex if it isn't visible",
        function () {
          // setup
          spyOn(ReactionCore, "getCurrentShop").and.returnValue(
            shop);
          spyOn(Roles, "userIsInRole").and.returnValue(true);
          // execute
          const cursor = Meteor.server.publish_handlers.Product("my");
          // verify
          const data = cursor.fetch()[0];
          expect(data.title).toEqual("My Little Pony");
        });
    });
  });

  describe("Orders", function () {
    let order;
    let userId = Factory.get("user");

    beforeEach(function () {
      ReactionCore.Collections.Orders.insert({
        shopId: shop._id,
        userId: userId,
        status: "created"
      });
      order = ReactionCore.Collections.Orders.findOne();
    });

    it("should return shop orders for an admin", function () {
      // setup
      spyOn(ReactionCore, "getCurrentShop").and.returnValue(shop);
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      // execute
      const cursor = Meteor.server.publish_handlers.Orders();
      // verify
      const data = cursor.fetch()[0];
      expect(data.shopId).toBe(order.shopId);
    });

    it("should not return shop orders for non admin", function () {
      // setup
      spyOn(ReactionCore, "getCurrentShop").and.returnValue(shop);
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      const cursor = Meteor.server.publish_handlers.Orders();
      expect(cursor).toEqual([]);
    });
  });

  describe("Cart", () => {
    const user = Factory.create("user");
    const userId = user._id;
    const sessionId = ReactionCore.sessionId = Random.id();

    beforeEach(() => {
      Meteor.call("cart/createCart", sessionId);
    });

    it(
      "should return a cart cursor",
      done => {
        const originalCart = Meteor.server.publish_handlers["Cart"];
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
        spyOn(Meteor.server.publish_handlers, "Cart").and.callFake(
          function () {
            this.userId = userId;
            return originalCart.apply(this, arguments);
          });
        const cursor = Meteor.server.publish_handlers.Cart(sessionId);
        const data = cursor.fetch()[0];

        expect(data.userId).toEqual(userId);

        return done();
      }
    );

    it(
      "should return only one cart in cursor",
      done => {
        const user2 = Factory.create("user");
        // mock the `this.userId` call
        const originalCart = Meteor.server.publish_handlers["Cart"];
        spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shop._id);
        spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
        spyOn(Meteor.server.publish_handlers, "Cart").and.callFake(
          function () {
            this.userId = userId;
            return originalCart.apply(this, arguments);
          });
// fixme: fix args
        Meteor.call("cart/createCart", user2._id, shop._id);

        const cursor = Meteor.server.publish_handlers.Cart(sessionId);
        const data = cursor.fetch();

        expect(data.length).toEqual(1);

        return done();
      }
    );

    //it(
    //  "should",
    //  done => {
    //    return done();
    //  }
    //);
  });
});
