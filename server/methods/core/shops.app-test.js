/* eslint dot-notation: 0 */
import { Factory } from "meteor/dburles:factory";
import Fixtures from "/server/imports/fixtures";
import { Reaction } from "/server/api";
import { Shops } from "/lib/collections";
import { expect } from "meteor/practicalmeteor:chai";
import { stubs, spies } from "meteor/practicalmeteor:sinon";

Fixtures();

describe("core shop schema", function () {
  beforeEach(function () {
    return Shops.remove({});
  });

  after(function () {
    spies.restoreAll();
    stubs.restoreAll();
  });

  it("should create a new factory shop", function (done) {
    stubs.create("hasPermissionStub", Reaction, "hasPermission");
    stubs.hasPermissionStub.returns(true);
    spies.create("shopInsertSpy", Shops, "insert");
    Factory.create("shop");
    expect(spies.shopInsertSpy).to.have.been.called;
    return done();
  });
});

describe("core shop methods", function () {
  let shop;
  beforeEach(function () {
    shop = Factory.create("shop");
  });

  after(function () {
    spies.restoreAll();
    stubs.restoreAll();
  });

  describe("shop/createShop", function () {
    beforeEach(function () {
      Shops.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      stubs.create("hasPermissionStub", Reaction, "hasPermission");
      stubs.hasPermissionStub.returns(false);
      spies.create("shopInsertSpy", Shops, "insert");
      function createShopFunc() {
        return Meteor.call("shop/createShop");
      }
      expect(createShopFunc).to.throw(Meteor.Error, /Access Denied/);
      expect(Shops.insert).to.not.have.been.called;
      return done();
    });

    it("should create new shop for admin for userId and shopObject", function (done) {
      stubs.create("meteorUserSpy", Meteor, "userId");
      stubs.meteorUserSpy.returns("12345678");
      // spyOn(Meteor, "userId").and.returnValue("1234678");

      stubs.create("hasOwnerSpy", Reaction, "hasOwnerAccess");
      stubs.hasOwnerSpy.returns(true);
      // spyOn(Roles, "userIsInRole").and.returnValue(true);

      Meteor.call("shop/createShop", "1234678", shop);

      const newShopCount = Shops.find({name: shop.name}).count();
      expect(newShopCount).to.equal(1);
      return done();
    });

    // it("should create new shop for admin", function (done) {
    //   spyOn(Meteor, "userId").and.returnValue("1234678");
    //   spyOn(Roles, "userIsInRole").and.returnValue(true);
    //
    //   Meteor.call("shop/createShop");
    //
    //   const newShopCount = Shops.find({name: shop.name}).count();
    //   expect(newShopCount).toEqual(1);
    //   return done();
    // });
  });
});
