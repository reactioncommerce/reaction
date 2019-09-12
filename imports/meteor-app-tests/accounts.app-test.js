/* eslint-disable require-jsdoc */
/* eslint dot-notation: 0 */
/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import { check, Match } from "meteor/check";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Accounts, Packages, Orders, Products, Shops, Cart } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { getShop } from "/imports/plugins/core/core/server/fixtures/shops";
import Fixtures from "/imports/plugins/core/core/server/fixtures";

describe("Account Meteor method ", function () {
  let shopId;
  let fakeUser;
  const originals = {};
  let sandbox;

  before(function (done) {
    this.timeout(20000);
    Reaction.onAppStartupComplete(() => {
      Fixtures();
      done();
    });
  });

  after(() => {
    Packages.remove({});
    Cart.remove({});
    Accounts.remove({});
    Orders.remove({});
    Products.remove({});
    Shops.remove({});
    if (sandbox) {
      sandbox.restore();
    }
  });

  beforeEach(function () {
    shopId = getShop()._id;
    sandbox = sinon.sandbox.create();

    fakeUser = Factory.create("user");
    const userId = fakeUser._id;
    // set the _id... some code requires that Account#_id === Account#userId
    sandbox.stub(Meteor, "user", () => fakeUser);
    sandbox.stub(Meteor.users, "findOne", () => fakeUser);
    sandbox.stub(Reaction, "getUserId", () => userId);
    sandbox.stub(Reaction, "getShopId", () => shopId);

    Object.keys(originals).forEach((method) => spyOnMethod(method, userId));
  });

  afterEach(function () {
    sandbox.restore();
  });

  function spyOnMethod(method, id) {
    return sandbox.stub(Meteor.server.method_handlers, `cart/${method}`, function (...args) {
      check(args, [Match.Any]); // to prevent audit_arguments from complaining
      this.userId = id; // having to do this makes me think that we should be using Meteor.userId() instead of this.userId in our Meteor methods
      return originals[method].apply(this, args);
    });
  }
});
