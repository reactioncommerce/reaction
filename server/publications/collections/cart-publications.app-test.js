/* eslint dot-notation: 0 */
/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { Factory } from "meteor/dburles:factory";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { getShop } from "/server/imports/fixtures/shops";
import { Reaction } from "/server/api";
import * as Collections from "/lib/collections";
import Fixtures from "/server/imports/fixtures";

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
    Reaction.sessionId = Random.id();
    const { sessionId } = Reaction;
    const thisContext = {
      userId
    };

    beforeEach(() => {
      Collections.Cart.remove({});
    });

    afterEach(() => {
      Collections.Cart.remove({});
    });

    it("should return a cart cursor", function () {
      const account = Factory.create("account");
      sandbox.stub(Meteor, "userId", function () {
        return account.userId;
      });
      sandbox.stub(Reaction, "getShopId", () => shop._id);
      sandbox.stub(Reaction, "getPrimaryShopId", () => shop._id);
      Collections.Cart.insert({
        sessionId,
        userId,
        shopId: shop._id
      });
      const cartPub = Meteor.server.publish_handlers["Cart"];
      const cursor = cartPub.apply(thisContext, [sessionId]);
      const data = cursor.fetch()[0];
      expect(data.userId).to.equal(userId);
    });

    it("should return only one cart in cursor", function () {
      sandbox.stub(Reaction, "getShopId", () => shop._id);
      sandbox.stub(Reaction, "getPrimaryShopId", () => shop._id);
      sandbox.stub(Meteor, "userId", () => user._id);
      const user2 = Factory.create("registeredUser");
      Collections.Cart.insert({
        sessionId,
        userId,
        shopId: shop._id
      });
      Collections.Cart.insert({
        sessionId,
        userId: user2._id,
        shopId: shop._id
      });
      // Meteor.call("cart/createCart", user2._id, sessionId);
      expect(Collections.Cart.find().count()).to.equal(2); // ensure we've added 2 carts
      const cartPub = Meteor.server.publish_handlers["Cart"];
      const cursor = cartPub.apply(thisContext, [sessionId]);
      const data = cursor.fetch();
      expect(data).to.be.an("array");
      expect(data.length).to.equal(1);
      expect(data[0].userId).to.equal(userId);
    });
  });
});
