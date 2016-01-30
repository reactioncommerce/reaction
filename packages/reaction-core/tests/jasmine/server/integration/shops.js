describe("core shop schema", function () {
  beforeEach(function () {
    return ReactionCore.Collections.Shops.remove({});
  });

  it("should create a new factory shop", function (done) {
    spyOn(Roles, "userIsInRole").and.returnValue(true);
    spyOn(ReactionCore.Collections.Shops, "insert");
    Factory.create("shop");
    expect(ReactionCore.Collections.Shops.insert).toHaveBeenCalled();
    return done();
  });
});

describe("core shop methods", function () {
  let shop;
  beforeEach(function () {
    shop = Factory.create("shop");
  });

  describe("shop/createShop", function () {
    beforeEach(function () {
      ReactionCore.Collections.Shops.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(ReactionCore.Collections.Shops, "insert");
      expect(function () {
        return Meteor.call("shop/createShop");
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Shops.insert).not.toHaveBeenCalled();
      return done();
    });

    it("should create new shop for admin for userId and shopObject", function (done) {
      spyOn(Meteor, "userId").and.returnValue("1234678");
      spyOn(Roles, "userIsInRole").and.returnValue(true);

      Meteor.call("shop/createShop", "1234678", shop);

      const newShopCount = ReactionCore.Collections.Shops.find({name: shop.name}).count();
      expect(newShopCount).toEqual(1);
      return done();
    });

    // it("should create new shop for admin", function (done) {
    //   spyOn(Meteor, "userId").and.returnValue("1234678");
    //   spyOn(Roles, "userIsInRole").and.returnValue(true);
    //
    //   Meteor.call("shop/createShop");
    //
    //   const newShopCount = ReactionCore.Collections.Shops.find({name: shop.name}).count();
    //   expect(newShopCount).toEqual(1);
    //   return done();
    // });
  });
});
