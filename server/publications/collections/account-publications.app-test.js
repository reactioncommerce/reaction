/* eslint dot-notation: 0 */
import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Roles } from "meteor/alanning:roles";
import { getShop } from "/server/imports/fixtures/shops";
import { Reaction } from "/server/api";
import Fixtures from "/server/imports/fixtures";

Fixtures();

const shopId = getShop()._id;
const publication = Meteor.server.publish_handlers["ShopMembers"];

describe.skip("Account Publications", function () {
  let sandbox;
  beforeEach(function () {
    // reset
    Meteor.users.remove({});
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("ShopMembers", function () {
    it("should let an admin fetch userIds", function () {
      const user = Factory.create("user");
      const thisContext = {
        userId: user._id
      };
      // setup
      sandbox.stub(Reaction, "getShopId", function () {
        return shopId;
      });
      // spyOn(Reaction, "getShopId").and.returnValue(shopId);
      sandbox.stub(Roles, "userIsInRole", function () {
        return true;
      });
      // spyOn(Roles, "userIsInRole").and.returnValue(true);
      // execute
      const cursor = publication.apply(thisContext);
      // verify
      data = cursor.fetch()[0];
      expect(data._id).to.equal(user._id);
    });

    it("should not let a regular user fetch userIds", function () {
      sandbox.stub(Reaction, "getShopId", function () {
        return shopId;
      });
      sandbox.stub(Roles, "userIsInRole", function () {
        return true;
      });
      const thisContext = {
        userId: "notAdminUser",
        ready: function () { return "ready"; }
      };
      // spyOn(ReactionCore, "getShopId").and.returnValue(shopId);
      // spyOn(Roles, "userIsInRole").and.returnValue(false);
      const cursor = publication.apply(thisContext);
      expect(cursor).to.equal("ready");
    });

    it("should not overpublish user data to admins", function () {
      sandbox.stub(Reaction, "getShopId", function () {
        return shopId;
      });
      sandbox.stub(Roles, "userIsInRole", function () {
        return true;
      });
      const user = Factory.create("user");
      Factory.create("registeredUser");
      const thisContext = {
        userId: user._id,
        ready: function () { return "ready"; }
      };
      // setup
      // spyOn(ReactionCore, "getShopId").and.returnValue(shopId);
      // spyOn(Roles, "userIsInRole").and.returnValue(true);
      // execute
      const cursor = publication.apply(thisContext);
      // verify
      data = cursor.fetch();
      // we expect services will be clean object
      expect(data.some(_user => {
        // we expect two users. First will be without services, second with
        // clean services object
        return typeof _user.services === "object" &&
          _.isEqual(_user.services, {});
      })).to.be.true;
    });
  });
});

