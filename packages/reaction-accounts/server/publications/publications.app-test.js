/* eslint dot-notation: 0 */
import { createJ$ } from "@sanjo/jasmine-expect";
import { createEnv as createExpectEnv }  from "@sanjo/jasmine-expect";
import { createEnv as createSpyEnv } from "@sanjo/jasmine-spy";

const j$ = createJ$();
const expectEnv = createExpectEnv(j$);
const spyEnv = createSpyEnv(j$);
const spyOn = spyEnv.spyOn;
const expect = expectEnv.expect;

const shopId = faker.reaction.shops.getShop()._id;
const publication = Meteor.server.publish_handlers["ShopMembers"];

describe("Account Publications", function () {
  beforeEach(function () {
    // reset
    Meteor.users.remove({});
  });

  afterEach(function () {
    spyEnv.clearSpies();
  });

  describe("ShopMembers", function () {
    it(
      "should let an admin fetch userIds",
      () => {
        const user = Factory.create("user");
        const thisContext = {
          userId: user._id
        };
        // setup
        spyOn(ReactionCore, "getShopId").and.returnValue(shopId);
        spyOn(Roles, "userIsInRole").and.returnValue(true);
        // execute
        const cursor = publication.apply(thisContext);
        // verify
        data = cursor.fetch()[0];
        expect(data._id).toEqual(user._id);
      }
    );

    it(
      "should not let a regular user fetch userIds",
      () => {
        const thisContext = {
          userId: "notAdminUser",
          ready: function () { return "ready"; }
        };
        spyOn(ReactionCore, "getShopId").and.returnValue(shopId);
        spyOn(Roles, "userIsInRole").and.returnValue(false);
        const cursor = publication.apply(thisContext);
        expect(cursor).toEqual("ready");
      }
    );

    it(
      "should not overpublish user data to admins",
      () => {
        const user = Factory.create("user");
        Factory.create("registeredUser");
        const thisContext = {
          userId: user._id,
          ready: function () { return "ready"; }
        };
        // setup
        spyOn(ReactionCore, "getShopId").and.returnValue(shopId);
        spyOn(Roles, "userIsInRole").and.returnValue(true);
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
        })).toEqual(true);
      }
    );
  });
});
