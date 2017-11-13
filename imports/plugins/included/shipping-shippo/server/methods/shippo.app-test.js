import { Meteor } from "meteor/meteor";
// import { Roles } from "meteor/alanning:roles";
// import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Factory } from "meteor/dburles:factory";
import { Reaction } from "/server/api";
import { Shops } from "/lib/collections";

// const parcelSize = {
//   weight: 10,
//   length: 10,
//   width: 10,
//   height: 10
// };
const shippoDocs = {};
const retrialTargets = [];

let cart;
let shop;
// let initialDefaultParcelSize;
before(function () {
  this.timeout(10000);
  Meteor._sleepForMs(7000);
  cart = Factory.create("cart");
  shop = Factory.create("shop");
  // initialDefaultParcelSize = shop.defaultParcelSize;
});

after(function () {
  Shops.direct.remove();
});

describe.only("shippo method", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });


  describe("shippo/getShippingRatesForCart", function () {
    it("should set shipping rates for cart", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      sandbox.stub(Meteor, "userId", function () {
        return cart.userId;
      });
      sandbox.stub(Reaction, "getShopId", () => {
        return shop._id;
      });
      // console.log("cart: items: ", cart.items[0]);
      Meteor.call("shippo/getShippingRatesForCart", cart._id, shippoDocs, retrialTargets);
      return done();
    });
  });
});
