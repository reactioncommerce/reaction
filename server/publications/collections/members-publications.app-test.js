/* eslint dot-notation: 0 */
/* eslint prefer-arrow-callback:0 */
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Roles } from "meteor/alanning:roles";
import { getShop } from "/server/imports/fixtures/shops";
import { Reaction } from "/server/api";
import Fixtures from "/server/imports/fixtures";

import "./members";

Fixtures();

const shopId = getShop()._id;

describe("Account Publications", function () {
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
      sandbox.stub(Reaction, "getShopId", () => shopId);
      sandbox.stub(Roles, "userIsInRole", () => true);
      const publication = Meteor.server.publish_handlers["ShopMembers"];
      const user = Factory.create("user");
      const thisContext = {
        userId: user._id
      };
      const cursor = publication.apply(thisContext);
      // verify
      const data = cursor.fetch()[0];
      expect(data._id).to.equal(user._id);
    });

    it("should not let a regular user fetch userIds", function () {
      sandbox.stub(Reaction, "getShopId", () => shopId);
      sandbox.stub(Roles, "userIsInRole", () => false);
      const thisContext = {
        userId: "notAdminUser",
        ready() { return "ready"; }
      };
      const publication = Meteor.server.publish_handlers["ShopMembers"];
      const cursor = publication.apply(thisContext);
      expect(cursor).to.equal("ready");
    });

    it("should not overpublish user data to admins", function () {
      sandbox.stub(Reaction, "getShopId", () => shopId);
      sandbox.stub(Roles, "userIsInRole", () => true);
      const user = Factory.create("user");
      Factory.create("registeredUser");
      const thisContext = {
        userId: user._id,
        ready() { return "ready"; }
      };
      const publication = Meteor.server.publish_handlers["ShopMembers"];
      const cursor = publication.apply(thisContext);
      // verify
      const data = cursor.fetch();
      // we expect services will be clean object
      expect(data.some((_user) =>
        // we expect two users. First will be without services, second with
        // clean services object
        typeof _user.services === "object" &&
          _.isEqual(_user.services, {}))).to.be.true;
    });
  });
});

