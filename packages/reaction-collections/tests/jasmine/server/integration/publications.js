/* eslint dot-notation: 0 */

describe("Publication", () => {
  const shop = faker.reaction.shops.getShop();

  beforeAll(() => {
    // We are mocking inventory hooks, because we don't need them here, but
    // if you want to do a real stress test, you could try to comment out
    // this spyOn lines. This is needed only for ./reaction test. In one
    // package test this is ignoring.
    if (Array.isArray(ReactionCore.Collections.Products._hookAspects.remove.after)
      && ReactionCore.Collections.Products._hookAspects.remove.after.length) {
      spyOn(ReactionCore.Collections.Products._hookAspects.remove.after[0], "aspect");
      spyOn(ReactionCore.Collections.Products._hookAspects.insert.after[0], "aspect");
    }
    ReactionCore.Collections.Products.remove({});
    // really strange to see this, but without this `remove` finishes in
    // async way (somewhere in a middle of testing process)
    Meteor.setTimeout(() => {
      ReactionCore.Collections.Orders.remove({});
    }, 500);
  });

  describe("with products", () => {
    const productsPub = Meteor.server.publish_handlers["Products"];
    const productPub = Meteor.server.publish_handlers["Product"];
    const thisContext = {
      ready: () => "ready",
      added: () => "added",
      onStop: () => "onStop",
      changed: () => "changed"
    };
    const priceRangeA = {
      range: "1.00 - 12.99",
      min: 1.00,
      max: 12.99
    };
    const priceRangeB = {
      range: "12.99 - 19.99",
      min: 12.99,
      max: 19.99
    };
    const product1 = {
      ancestors: [],
      title: "My Little Pony",
      shopId: shop._id,
      type: "simple",
      price: priceRangeA,
      isVisible: false,
      isLowQuantity: false,
      isSoldOut: false,
      isBackorder: false
    };
    const product2 = {
      ancestors: [],
      title: "Shopkins - Peachy",
      shopId: shop._id,
      price: priceRangeB,
      type: "simple",
      isVisible: true,
      isLowQuantity: false,
      isSoldOut: false,
      isBackorder: false
    };
    const product3 = {
      ancestors: [],
      title: "Fresh Tomatoes",
      shopId: shop._id,
      price: priceRangeA,
      type: "simple",
      isVisible: true,
      isLowQuantity: false,
      isSoldOut: false,
      isBackorder: false
    };

    beforeAll(() => {
      // a product with price range A, and not visible
      ReactionCore.Collections.Products.insert(product1);
      // a product with price range B, and visible
      ReactionCore.Collections.Products.insert(product2, (err) => {
        if (err) return;
        ReactionCore.Collections.Products.insert({
          ancestors: [product2._id],
          title: "Shopkins - Peachy #1",
          price: 12.99,
          weight: 20,
          shopId: shop._id,
          type: "variant"
        });
      });
      // a product with price range A, and visible
      ReactionCore.Collections.Products.insert(product3, (err) => {
        if (err) return;
        // a product descendant of product3
        ReactionCore.Collections.Products.insert({
          ancestors: [product3._id],
          title: "Fresh Tomatoes #1",
          price: 1,
          weight: 10,
          shopId: shop._id,
          type: "variant"
        });
        // another product descendant of product3
        ReactionCore.Collections.Products.insert({
          ancestors: [product3._id],
          title: "Fresh Tomatoes #2",
          price: 12.99,
          weight: 15,
          shopId: shop._id,
          type: "variant"
        });
      });
    });

    describe("Products", () => {
      it("should return products from all shops when multiple shops are provided", () => {
        spyOn(ReactionCore, "getCurrentShop").and.returnValue({_id: "123"});
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        const cursor = Meteor.server.publish_handlers.Products.apply(thisContext, [undefined, {shops: [shop._id]}]);
        expect(cursor.fetch().length).toEqual(3);
      });

      describe("of one shop for admins", () => {
        beforeAll(() => {
          spyOn(ReactionCore, "getCurrentShop").and.returnValue(shop);
          spyOn(Roles, "userIsInRole").and.returnValue(true);
        });

        it("should return all products", () => {
          const cursor = productsPub.apply(thisContext, []);
          expect(cursor.fetch().length).toEqual(3);
        });

        it("should return visible products in visible query", () => {
          const cursor = productsPub.apply(thisContext, [undefined, {visibility: true}]);
          expect(cursor.fetch().length).toEqual(2);
        });

        it("should return invisible products in invisible query", () => {
          const cursor = productsPub.apply(thisContext, [undefined, {visibility: false}]);
          expect(cursor.fetch().length).toEqual(1);
        });
      });

      describe("of one shop for visitors", () => {
        beforeAll(() => {
          spyOn(ReactionCore, "getCurrentShop").and.returnValue(shop);
          spyOn(Roles, "userIsInRole").and.returnValue(false);
        });

        it("should return only visible products", () => {
          const cursor = productsPub.apply(thisContext, []);
          expect(cursor.fetch().length).toEqual(2);
          cursor.fetch().map(p => expect(p.isVisible).toEqual(true));
        });

        it("should return only products matching query", () => {
          const cursor = productsPub.apply(thisContext, [undefined, {query: "Shopkins"}]);
          expect(cursor.fetch().length).toEqual(1);
          cursor.fetch().map(p => expect(p.title).toEqual("Shopkins - Peachy"));
        });

        it("should not return products not matching query", () => {
          const cursor = productsPub.apply(thisContext, [undefined, {query: "random search"}]);
          expect(cursor.fetch().length).toEqual(0);
        });

        it("should return products in price.min query", () => {
          const price = {min: 13.00};
          const cursor = productsPub.apply(thisContext, [undefined, {price: price}]);
          expect(cursor.fetch().length).toEqual(1);
          cursor.fetch().map(p => expect(p.price.max).toBeGreaterThan(price.min));
        });

        it("should return products in price.max query", () => {
          const price = {max: 11.00};
          const cursor = productsPub.apply(thisContext, [undefined, {price: price}]);
          expect(cursor.fetch().length).toEqual(1);
          cursor.fetch().map(p => expect(p.price.min).toBeLessThan(price.max));
        });

        it("should return products in price.min - price.max range query", () => {
          const price = {min: 12.00, max: 19.98};
          const cursor = productsPub.apply(thisContext, [undefined, {price: price}]);
          expect(cursor.fetch().length).toEqual(2);
          cursor.fetch().map(p => expect(p.price.min).toBeLessThan(price.max));
          cursor.fetch().map(p => expect(p.price.max).toBeGreaterThan(price.min));
        });

        it("should return products where value is in price set query", () => {
          const price = {min: 13.00, max: 24.00};
          const cursor = productsPub.apply(thisContext, [undefined, {price: price}]);
          expect(cursor.fetch().length).toEqual(1);
          cursor.fetch().map(p => expect(p.price.min).toBeLessThan(price.max));
          cursor.fetch().map(p => expect(p.price.max).toBeGreaterThan(price.min));
        });

        it("should return products in weight.min query", () => {
          const cursor = productsPub.apply(thisContext, [undefined, {weight: {min: 14}}]);
          expect(cursor.fetch().length).toEqual(2);
        });

        it("should return products in weight.max query", () => {
          const cursor = productsPub.apply(thisContext, [undefined, {weight: {max: 16}}]);
          expect(cursor.fetch().length).toEqual(1);
        });

        it("should return products in weight.min - weight.max range query", () => {
          const cursor = productsPub.apply(thisContext, [undefined, {weight: {min: 14, max: 16}}]);
          expect(cursor.fetch().length).toEqual(1);
        });
      });
    });

    describe("Product", () => {
      beforeAll(() => {
        spyOn(ReactionCore, "getCurrentShop").and.returnValue(shop);
      });

      it("should return a product and it's descendants based on an id", () => {
        const product = ReactionCore.Collections.Products.findOne({ancestors: {
          $exists: true,
          $eq: []
        }, isVisible: true});
        const cursor = Meteor.server.publish_handlers.Product(product._id);
        expect(cursor.fetch().length).toEqual(3);
        expect(cursor.fetch()[0]._id).toEqual(product._id);
      });

      it("should return a product based on a regex", () => {
        const cursor = Meteor.server.publish_handlers.Product("shopkins");
        expect(cursor.fetch()[0].title).toEqual("Shopkins - Peachy #1");
      });

      it("should not return a product based on a regex if it isn't visible", () => {
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        const cursor = productPub.apply(thisContext, ["my"]);
        expect(cursor).toEqual("ready");
      });

      it("should return a product based on a regex to admin if it isn't visible", () => {
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        const cursor = Meteor.server.publish_handlers.Product("my");
        expect(cursor.fetch()[0].title).toEqual("My Little Pony");
      });
    });
  });

  describe("Orders", () => {
    const publication = Meteor.server.publish_handlers["Orders"];
    const thisContext = {
      userId: "userId",
      ready: () => "ready"
    };
    let order;

    beforeAll(() => {
      // this is another hack. We put this factory inside hook because, first
      // we need to mock collectionHooks to Inventory. This way we do all things
      // in a right order. This is make sense only for --velocity (all package)
      // tests.
      order = Factory.create("order", {status: "created"});
    });

    beforeEach(() => {
      spyOn(ReactionCore, "getShopId").and.returnValue(shop._id);
    });

    it("should return shop orders for an admin", () => {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      const cursor = publication.apply(thisContext);
      expect(cursor.fetch()[0].shopId).toBe(order.shopId);
    });

    it("should not return shop orders for non admin", () => {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      const cursor = publication.apply(thisContext);
      expect(cursor.fetch()).toEqual([]);
    });
  });

  describe("Cart", () => {
    // for this: "should return only one cart in cursor" test we need to avoid
    // user carts merging. We need registered users for here.
    const user = Factory.create("registeredUser");
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

    it("should return a cart cursor", () => {
      const cursor = cartPub.apply(thisContext, [sessionId]);
      expect(cursor.fetch()[0].userId).toEqual(userId);
    });

    it("should return only one cart in cursor", () => {
      const user2 = Factory.create("registeredUser");
      Meteor.call("cart/createCart", user2._id, sessionId);
      const cursor = cartPub.apply(thisContext, [sessionId]);
      expect(cursor.fetch().length).toEqual(1);
    });
  });
});
