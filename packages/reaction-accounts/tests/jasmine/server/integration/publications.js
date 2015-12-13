// const user = Factory.create("user");
describe("Publication", function () {
  let shop;
  beforeEach(function () {
    // reset
    ReactionCore.Collections.Products.remove({});
    ReactionCore.Collections.Shops.remove({});
    ReactionCore.Collections.Orders.remove({});
    // insert products and shops
    ReactionCore.Collections.Shops.insert({
      name: faker.company.companyName(),
      currency: "USD",
      currencies: {},
      locales: {
        continents: {},
        countries: {}
      },
      timezone: "US/Pacific"
    });
    shop = ReactionCore.Collections.Shops.findOne();
  });

  describe("ShopMembers", function () {
    beforeEach(function () {
      // Meteor.users.remove({});
    });

    afterEach(function () {
      // Meteor.users.remove({});
    });

    // it("should let an admin fetch userIds", function () {
    //   // setup
    //   spyOn(ReactionCore, "getCurrentShop").and.returnValue(shop);
    //   spyOn(ReactionCore, "hasOwnerAccess").and.returnValue(true);
    //   // execute
    //   cursor = Meteor.server.publish_handlers.ShopMembers();
    //   // verify
    //   data = cursor.fetch()[0];
    //   // console.log(data);
    //   expect(data._id).toEqual(user);
    // });

    it("should not let a regular user fetch userIds", function () {
      // setup
      spyOn(ReactionCore, "getCurrentShop").and.returnValue(shop);
      spyOn(ReactionCore, "hasOwnerAccess").and.returnValue(false);
      cursor = Meteor.server.publish_handlers.ShopMembers();
      expect(cursor).toEqual([]);
    });

    // it("should not overpublish user data to admins", function () {
    //   spyOn(ReactionCore, "getCurrentShop").and.returnValue(shop);
    //   spyOn(ReactionCore, "hasOwnerAccess").and.returnValue(true);
    //   // execute
    //   cursor = Meteor.server.publish_handlers.ShopMembers();
    //   // verify
    //   data = cursor.fetch()[0];
    //   expect(data.services).toBeUndefined();
    // });
  });
});
