/* eslint dot-notation: 0 */

describe("Publication", function () {
  const shop = faker.reaction.shops.getShop();

  beforeAll(function () {
    // We are mocking inventory hooks, because we don't need them here, but
    // if you want to do a real stress test, you could try to comment out
    // this spyOn lines. This is needed only for ./reaction test. In one
    // package test this is ignoring.
    if (Array.isArray(ReactionCore.Collections.Products._hookAspects.remove.
      after) && ReactionCore.Collections.Products._hookAspects.remove.after.
      length) {
      spyOn(ReactionCore.Collections.Products._hookAspects.remove.after[0],
        "aspect");
      spyOn(ReactionCore.Collections.Products._hookAspects.insert.after[0],
        "aspect");
    }
    ReactionCore.Collections.Products.remove({});
    // really strange to see this, but without this `remove` finishes in
    // async way (somewhere in a middle of testing process)
    Meteor.setTimeout(function () {
      ReactionCore.Collections.Orders.remove({});
    }, 500);
  });

  describe("with products", function () {
    const productsPub = Meteor.server.publish_handlers["Products"];
    const productPub = Meteor.server.publish_handlers["Product"];
    const thisContext = {
      ready: function () { return "ready"; }
    };

    beforeAll(function () {
      ReactionCore.Collections.Products.insert({
        ancestors: [],
        title: "My Little Pony",
        shopId: shop._id,
        type: "simple",
        isVisible: false,
        isLowQuantity: false,
        isSoldOut: false,
        isBackorder: false
      });
      ReactionCore.Collections.Products.insert({
        ancestors: [],
        title: "Shopkins - Peachy",
        shopId: shop._id,
        type: "simple",
        isVisible: true,
        isLowQuantity: false,
        isSoldOut: false,
        isBackorder: false
      });
    });

    describe("Products", function () {
      it(
        "should return all products to admins",
        function () {
          // setup
          spyOn(ReactionCore, "getCurrentShop").and.returnValue(
            shop);
          spyOn(Roles, "userIsInRole").and.returnValue(true);
          // execute
          const cursor = productsPub();
          // verify
          const data = cursor.fetch()[0];
          expect(["My Little Pony", "Shopkins - Peachy"].
            some(title => title === data.title)).toBeTruthy();
        }
      );

      it(
        "should return only visible products to visitors",
        function () {
          // setup
          spyOn(ReactionCore, "getCurrentShop").and.returnValue(
            shop);
          spyOn(Roles, "userIsInRole").and.returnValue(false);
          // execute
          const cursor = productsPub();
          // verify
          const data = cursor.fetch()[0];
          expect(data.title).toEqual("Shopkins - Peachy");
        }
      );

      it(
        "should return products from all shops when multiple shops are" +
        " provided",
        function () {
          // setup
          let filters = {shops: [shop._id]};
          const productScrollLimit = 20;
          spyOn(ReactionCore, "getCurrentShop").and.returnValue({
            _id: "123"
          });
          spyOn(Roles, "userIsInRole").and.returnValue(true);
          // execute
          const cursor = Meteor.server.publish_handlers.Products(productScrollLimit, filters);
          // verify
          const data = cursor.fetch()[0];
          expect(["My Little Pony", "Shopkins - Peachy"].
          some(title => title === data.title)).toBeTruthy();
        }
      );
    });

    describe("Product", function () {
      it(
        "should return a product based on an id",
        function () {
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
          expect(data.title).toEqual(product.title);
        }
      );

      it(
        "should return a product based on a regex",
        function () {
          // setup
          spyOn(ReactionCore, "getCurrentShop").and.returnValue(
            shop);
          // execute
          const cursor = Meteor.server.publish_handlers.Product(
            "shopkins");
          // verify
          const data = cursor.fetch()[0];
          expect(data.title).toEqual("Shopkins - Peachy");
        }
      );

      it(
        "should not return a product based on a regex if it isn't visible",
        function () {
          // setup
          spyOn(ReactionCore, "getCurrentShop").and.returnValue(shop);
          spyOn(Roles, "userIsInRole").and.returnValue(false);
          // execute
          const cursor = productPub.apply(thisContext, ["my"]);
          // verify
          expect(cursor).toEqual("ready");
        }
      );

      it(
        "should return a product based on a regex to admin if it isn't visible",
        function () {
          // setup
          spyOn(ReactionCore, "getCurrentShop").and.returnValue(shop);
          spyOn(Roles, "userIsInRole").and.returnValue(true);
          // execute
          const cursor = Meteor.server.publish_handlers.Product("my");
          // verify
          const data = cursor.fetch()[0];
          expect(data.title).toEqual("My Little Pony");
        }
      );
    });
  });

  describe("Orders", () => {
    const publication = Meteor.server.publish_handlers["Orders"];
    const thisContext = {
      userId: "userId",
      ready: function () { return "ready"; }
    };
    let order;

    beforeAll(() => {
      // this is another hack. We put this factory inside hook because, first
      // we need to mock collectionHooks to Inventory. This way we do all things
      // in a right order. This is make sense only for --velocity (all package)
      // tests.
      order = Factory.create("order", { status: "created" });
    });

    beforeEach(() => {
      spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
    });

    it(
      "should return shop orders for an admin",
      function () {
        // setup
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        // execute
        const cursor = publication.apply(thisContext);
        // verify
        const data = cursor.fetch()[0];
        expect(data.shopId).toBe(order.shopId);
      }
    );

    it(
      "should not return shop orders for non admin",
      function () {
        // setup
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        const cursor = publication.apply(thisContext);
        expect(cursor.fetch()).toEqual([]);
      }
    );
  });

  describe("Cart", () => {
    const user = Factory.create("user");
    const userId = user._id;
    const sessionId = ReactionCore.sessionId = Random.id();
    const cartPub = Meteor.server.publish_handlers["Cart"];
    const thisContext = {
      userId: userId
    };

    beforeEach(() => {
      ReactionCore.Collections.Cart.remove({});
      spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
      Meteor.call("cart/createCart", userId, sessionId);
    });

    it(
      "should return a cart cursor",
      () => {
        const cursor = cartPub.apply(thisContext, [sessionId]);
        const data = cursor.fetch()[0];
        expect(data.userId).toEqual(userId);
      }
    );

    it(
      "should return only one cart in cursor",
      () => {
        const user2 = Factory.create("user");
        Meteor.call("cart/createCart", user2._id, sessionId);
        const cursor = cartPub.apply(thisContext, [sessionId]);
        const data = cursor.fetch();
        expect(data.length).toEqual(1);
      }
    );
  });
});
