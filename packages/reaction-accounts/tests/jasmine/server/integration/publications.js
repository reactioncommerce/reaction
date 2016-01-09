/* eslint dot-notation: 0 */

const shopId = faker.reaction.shops.getShop()._id;
const shopMembers = Meteor.server.publish_handlers["ShopMembers"];

describe("Account Publications", function () {
  beforeEach(function () {
    // reset
    Meteor.users.remove({});
    // ReactionCore.Collections.Products.remove({});
    // ReactionCore.Collections.Shops.remove({});
    // ReactionCore.Collections.Orders.remove({});
    // shop = Factory.create("shop");
  });

  describe("ShopMembers", function () {
    it("should let an admin fetch userIds", function (done) {
      const user = Factory.create("user");
      // setup
      spyOn(Meteor.server.publish_handlers, "ShopMembers").and.callFake(
        function () {
          this.userId = user._id;
          return shopMembers.apply(this, arguments);
        }
      );
      spyOn(ReactionCore, "getShopId").and.returnValue(shopId);
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      // execute
      const cursor = Meteor.server.publish_handlers.ShopMembers();
      // verify
      data = cursor.fetch()[0];
      expect(data._id).toEqual(user._id);

      return done();
    });

    it("should not let a regular user fetch userIds", function (done) {
      // setup
      spyOn(Meteor.server.publish_handlers, "ShopMembers").and.callFake(
        function () {
          this.userId = "notAdminUserId";
          // not so good, but this is the best I found to make this test works
          this.ready = new Function("", "return 'test passed';");
          return shopMembers.apply(this, arguments);
        }
      );
      spyOn(ReactionCore, "getShopId").and.returnValue(shopId);
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      // fixme: unexpected situation here. `this` inside this publication
      // instance of global object, not `Publication`
      const cursor = Meteor.server.publish_handlers.ShopMembers();
      expect(cursor).toEqual("test passed");

      done();

    });

    it("should not overpublish user data to admins", function (done) {
      const user = Factory.create("user");
      const anotherUser = Factory.create("registeredUser");
      // setup
      spyOn(Meteor.server.publish_handlers, "ShopMembers").and.callFake(
        function () {
          this.userId = user._id;
          return shopMembers.apply(this, arguments);
        }
      );
      spyOn(ReactionCore, "getShopId").and.returnValue(shopId);
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      // execute
      const cursor = Meteor.server.publish_handlers.ShopMembers();
      // verify
      data = cursor.fetch();
      // we expect services will be clean object
      expect(data[data.length - 1].services).toEqual({});

      return done();
    });
  });
});
