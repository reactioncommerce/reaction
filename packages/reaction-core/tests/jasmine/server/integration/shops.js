describe("core shop schema", function () {
  beforeEach(function () {
    return Shops.remove({});
  });
  return it("should create a new factory shop", function (done) {
    spyOn(Roles, "userIsInRole").and.returnValue(true);
    spyOn(Shops, "insert");
    Factory.create("shop");
    expect(Shops.insert).toHaveBeenCalled();
    return done();
  });
});

describe("core shop methods", function () {
  beforeEach(function () {
    return Shops.remove({});
  });
  return describe("shop/createShop", function () {
    it("should throw 403 error by non admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(Shops, "insert");
      expect(function () {
        return Meteor.call("shop/createShop");
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Shops.insert).not.toHaveBeenCalled();
      return done();
    });
    return it("should create new shop for admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      spyOn(Shops, "insert");
      expect(function () {
        return Meteor.call("shop/createShop");
      }).not.toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Shops.insert).toHaveBeenCalled();
      return done();
    });
  });
});
