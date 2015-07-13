describe("Publication", function() {

  describe("Products", function() {
    fit("should return all products to admins", function() {
      // setup
      var shop = {_id: "123"};
      spyOn(Match, "Optional");
      spyOn(ReactionCore, "getCurrentShop").and.returnValue(shop);
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      spyOn(Products, "find").and.returnValue('cursor');
      // execute
      cursor = Meteor.server.publish_handlers["Products"]();
      // verify
      expect(Products.find).toHaveBeenCalledWith({shopId: shop._id});
      expect(cursor).toEqual('cursor');
    });
    xit("should return only visible products to visitors");
    xit("should return products from all shops when multiple shops are provided");
    xit("should return products from current shop when no shops are provided");
  });
});
