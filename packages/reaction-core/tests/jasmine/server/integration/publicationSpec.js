describe("Publication", function() {

  var shop;

  beforeEach(function() {
    // reset
    Products.remove({});
    Shops.remove({});
    // insert products and shops
    Shops.insert({name: 'Cookie Swirl C', currency: 'USD', currencies: {}, locales: { continents: {}, countries: {}}, timezone: 'US/Pacific'});
    shop = Shops.findOne();
    Products.insert({title: 'My Little Pony', shopId: shop._id, productType: 'Simple', variants: [], isVisible: false});
    Products.insert({title: 'Shopkins - Peachy', shopId: shop._id, productType: 'Simple', variants: [], isVisible: true});
  });

  describe("Products", function() {
    it("should return all products to admins", function() {
      // setup
      spyOn(ReactionCore, "getCurrentShop").and.returnValue(shop);
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      // execute
      cursor = Meteor.server.publish_handlers["Products"]();
      // verify
      data = cursor.fetch()[0];
      expect(data.title).toEqual('My Little Pony');
    });
    it("should return only visible products to visitors", function() {
      // setup
      spyOn(ReactionCore, "getCurrentShop").and.returnValue(shop);
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      // execute
      cursor = Meteor.server.publish_handlers["Products"]();
      // verify
      data = cursor.fetch()[0];
      expect(data.title).toEqual('Shopkins - Peachy');
    });
    it("should return products from all shops when multiple shops are provided", function() {
      // setup
      var shopIds = [shop._id];
      spyOn(ReactionCore, "getCurrentShop").and.returnValue({_id: '123'});
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      // execute
      cursor = Meteor.server.publish_handlers["Products"](shopIds);
      // verify
      data = cursor.fetch()[0];
      expect(data.title).toEqual('My Little Pony');
    });
  });
});
