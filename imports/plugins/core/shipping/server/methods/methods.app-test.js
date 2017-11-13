import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Factory } from "meteor/dburles:factory";
import { Reaction } from "/server/api";
import { Shops } from "/lib/collections";

const parcelSize = {
  weight: 10,
  length: 10,
  width: 10,
  height: 10
};

let shop;
let initialDefaultParcelSize;
before(function () {
  this.timeout(10000);
  Meteor._sleepForMs(7000);
  shop = Factory.create("shop");
  initialDefaultParcelSize = shop.defaultParcelSize;
});

after(function () {
  Shops.direct.remove();
});

describe("shipping methods", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });


  describe("shipping/updateParcelSize", function () {
    it("should throw 403 error with shipping permission", function (done) {
      sandbox.stub(Roles, "userIsInRole", () => false);
      // this should actually trigger a whole lot of things
      expect(() => Meteor.call("shipping/updateParcelSize", "dummyShopId", parcelSize)).to.throw(Meteor.Error, /Access Denied/);
      return done();
    });
    it("should update default parcel size when user has permission", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      sandbox.stub(Reaction, "getShopId", () => {
        return shop._id;
      });
      sandbox.stub(Shops, "update", () => {
        shop.defaultParcelSize = parcelSize;
      });
      Meteor.call("shipping/updateParcelSize", shop._id, parcelSize);
      const updateParcelSize = shop.defaultParcelSize;
      expect(initialDefaultParcelSize).to.not.equal(updateParcelSize);
      return done();
    });
  });
});
