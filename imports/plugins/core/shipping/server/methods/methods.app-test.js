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
    it("should throw 403 error if user does not have permission", function () {
      sandbox.stub(Roles, "userIsInRole", () => false);
      expect(() => Meteor.call("shipping/updateParcelSize", "dummyShopId", parcelSize)).to.throw(Meteor.Error, /Access Denied/);
    });
    it("should update default parcel size when user has permission", function () {
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
    });
  });
});
