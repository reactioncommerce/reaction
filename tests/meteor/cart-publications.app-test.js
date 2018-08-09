/* eslint dot-notation: 0 */
/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { getShop } from "/imports/plugins/core/core/server/fixtures/shops";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import * as Collections from "/lib/collections";
import Fixtures from "/imports/plugins/core/core/server/fixtures";

Fixtures();

describe("Cart Publication", function () {
  const shop = getShop();
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("Cart", () => {
    // for this: "should return only one cart in cursor" test we need to avoid
    // user carts merging. We need registered users for here.
    const user = Factory.create("registeredUser");
    const userId = user._id;
    const account = Factory.create("account", { userId });
    const thisContext = {
      userId
    };

    beforeEach(() => {
      Collections.Cart.remove({});
      sandbox.stub(Meteor, "userId", () => userId);
      sandbox.stub(Reaction, "getShopId", () => shop._id);
      sandbox.stub(Reaction, "getPrimaryShopId", () => shop._id);
    });

    afterEach(() => {
      Collections.Cart.remove({});
    });

    it("should return a cart cursor", function () {
      Collections.Cart.insert({
        accountId: account._id,
        shopId: shop._id
      });
      const cartPub = Meteor.server.publish_handlers["Cart"];
      const cursor = cartPub.apply(thisContext, []);
      const data = cursor.fetch()[0];
      expect(data.userId).to.equal(userId);
    });

    it("should return only one cart in cursor", function () {
      const user2 = Factory.create("registeredUser");
      const account2 = Factory.create("account", { userId: user2._id });

      Collections.Cart.insert({
        accountId: account._id,
        shopId: shop._id
      });
      Collections.Cart.insert({
        accountId: account2._id,
        shopId: shop._id
      });

      expect(Collections.Cart.find().count()).to.equal(2); // ensure we've added 2 carts
      const cartPub = Meteor.server.publish_handlers["Cart"];
      const cursor = cartPub.apply(thisContext, []);
      const data = cursor.fetch();
      expect(data).to.be.an("array");
      expect(data.length).to.equal(1);
      expect(data[0].userId).to.equal(userId);
    });
  });
});
