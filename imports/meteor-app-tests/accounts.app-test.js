/* eslint-disable require-jsdoc */
/* eslint dot-notation: 0 */
/* eslint prefer-arrow-callback:0 */
import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import { check, Match } from "meteor/check";
import { Accounts as MeteorAccounts } from "meteor/accounts-base";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import ReactionError from "@reactioncommerce/reaction-error";
import { Accounts, Groups, Packages, Orders, Products, Shops, Cart } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { getShop, getAddress } from "/imports/plugins/core/core/server/fixtures/shops";
import Fixtures from "/imports/plugins/core/core/server/fixtures";

describe("Account Meteor method ", function () {
  let shopId;
  let fakeUser;
  let fakeAccount;
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
    fakeAccount = Factory.create("account", { _id: userId, userId, shopId });
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

  describe("addressBookUpdate", function () {
    it("should allow user to edit addresses", function () {
      sandbox.stub(Reaction, "hasAdminAccess", () => true);
      const updateAccountSpy = sandbox.spy(Accounts, "update");

      // we put new faker address over current address to test all fields
      // at once, but keep current address._id
      const address = Object.assign({}, fakeAccount.profile.addressBook[0], getAddress());
      Meteor.call("accounts/addressBookUpdate", address);
      expect(updateAccountSpy).to.have.been.called;
    });

    it("should allow Admin to edit other user address", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      sandbox.stub(Reaction, "hasAdminAccess", () => true);

      // we put new faker address over current address to test all fields
      // at once, but keep current address._id
      const address = Object.assign({}, fakeAccount.profile.addressBook[0], getAddress());
      Meteor.call("accounts/addressBookUpdate", address, fakeAccount.userId);

      // comparing two addresses to equality
      const account = Accounts.findOne({ _id: fakeAccount._id });
      const newAddress = account.profile.addressBook[0];
      expect(_.isEqual(address, newAddress)).to.be.true;
    });

    it("should update fields to exactly the same what we need", function () {
      // we put new faker address over current address to test all fields
      // at once, but keep current address._id
      const address = Object.assign({}, fakeAccount.profile.addressBook[0], getAddress());
      Meteor.call("accounts/addressBookUpdate", address);

      // comparing two addresses to equality
      const account = Accounts.findOne({ _id: fakeAccount._id });
      const newAddress = account.profile.addressBook[0];
      expect(_.isEqual(address, newAddress)).to.be.true;
    });

    it("should throw error if wrong arguments were passed", function () {
      const updateAccountSpy = sandbox.spy(Accounts, "update");

      expect(() => Meteor.call("accounts/addressBookUpdate", 123456))
        .to.throw(Error, /must be an object/);

      expect(() => Meteor.call("accounts/addressBookUpdate", null))
        .to.throw(Error, /must be an object/);

      expect(() => Meteor.call("accounts/addressBookUpdate"))
        .to.throw(Error, /must be an object/);

      expect(() => Meteor.call("accounts/addressBookUpdate", "asdad", 123))
        .to.throw(Error, /must be an object/);

      expect(() => Meteor.call("accounts/addressBookUpdate", {}))
        .to.throw(Error, /Full name is required/);

      // https://github.com/aldeed/meteor-simple-schema/issues/522
      expect(function () {
        return Meteor.call(
          "accounts/addressBookUpdate",
          () => { expect(true).to.be.true; }
        );
      }).to.not.throw();
      expect(updateAccountSpy).to.not.have.been.called;
    });
  });

  describe("addressBookRemove", function () {
    it("should allow user to remove address", function () {
      const address = fakeAccount.profile.addressBook[0];
      expect(fakeAccount.profile.addressBook.length).to.equal(1);

      Meteor.call("accounts/addressBookRemove", address._id);

      const account = Accounts.findOne({ _id: fakeAccount._id });
      expect(account.profile.addressBook.length).to.equal(0);
    });

    // TODO: I don't believe this test does what it says it does
    // I am pretty sure the user acting is the same user who is being acted upon
    it("should allow Admin to remove other user address", function () {
      const address = fakeAccount.profile.addressBook[0];
      sandbox.stub(Reaction, "hasPermission", () => true);
      expect(fakeAccount.profile.addressBook.length).to.equal(1);

      Meteor.call("accounts/addressBookRemove", address._id, fakeAccount.userId);

      const account = Accounts.findOne({ _id: fakeAccount._id });
      expect(account.profile.addressBook.length).to.equal(0);
    });

    it("should throw error if wrong arguments were passed", function () {
      const updateAccountSpy = sandbox.spy(Accounts, "update");

      expect(() => Meteor.call("accounts/addressBookRemove", 123456))
        .to.throw(Match.Error, /Expected string, got number/);

      expect(() => Meteor.call("accounts/addressBookRemove", {}))
        .to.throw(Match.Error, /Expected string, got object/);

      expect(() => Meteor.call("accounts/addressBookRemove", null))
        .to.throw(Match.Error, /Expected string, got null/);

      expect(() => Meteor.call("accounts/addressBookRemove"))
        .to.throw(Match.Error, /Expected string, got undefined/);

      expect(() => Meteor.call("accounts/addressBookRemove", "asdad", 123))
        .to.throw(Match.Error, /Match.Optional/);

      // https://github.com/aldeed/meteor-simple-schema/issues/522
      expect(function () {
        return Meteor.call(
          "accounts/addressBookRemove",
          () => { expect(true).to.be.true; }
        );
      }).to.not.throw();
      expect(updateAccountSpy).to.not.have.been.called;
    });

    it("should throw an error if address does not exist to remove", function () {
      expect(() => Meteor.call("accounts/addressBookRemove", "asdasdasd"))
        .to.throw(ReactionError, /Address Not Found/);
    });
  });

  describe("accounts/inviteShopMember", function () {
    let createUserSpy;
    let groupId;
    let group;

    function callDescribed(accountAttributes = {}) {
      const options = Object.assign({
        shopId,
        groupId,
        email: fakeUser.emails[0].address,
        name: fakeAccount.profile.addressBook[0].fullName
      }, accountAttributes);

      return Meteor.call("accounts/inviteShopMember", options);
    }

    function stubPermissioning(settings) {
      const { hasPermission, canInviteToGroup } = settings;

      sandbox.stub(Reaction, "hasPermission", () => hasPermission);
      sandbox
        .stub(Reaction, "canInviteToGroup", () => canInviteToGroup)
        .withArgs({ group, user: fakeUser });
    }

    beforeEach(function () {
      createUserSpy = sandbox.spy(MeteorAccounts, "createUser");

      groupId = Random.id();
      group = Factory.create("group");
      sandbox.stub(Groups, "findOne", () => group).withArgs({ _id: groupId });
    });

    it("requires reaction-accounts permission", function () {
      stubPermissioning({ hasPermission: false });
      sandbox.stub(Logger, "error") // since we expect this, let's keep the output clean
        .withArgs(sinon.match(/reaction-accounts permissions/));

      expect(callDescribed).to.throw(ReactionError, /Access denied/);
      expect(createUserSpy).to.not.have.been.called;
    });

    it("ensures the user has invite permission for this group/shop", function () {
      stubPermissioning({ hasPermission: true, canInviteToGroup: false });

      expect(callDescribed).to.throw(ReactionError, /Cannot invite/);
      expect(createUserSpy).to.not.have.been.called;
    });

    it("prevents inviting the owner of a shop (only a member)", function () {
      group.slug = "owner";
      stubPermissioning({ hasPermission: true, canInviteToGroup: true });

      expect(callDescribed).to.throw(ReactionError, /invite owner/);
      expect(createUserSpy).to.not.have.been.called;
    });
  });

  describe("accounts/inviteShopOwner", function () {
    let createUserSpy;
    let groupId;
    let group;

    function callDescribed(accountAttributes = {}, shopData) {
      const options = Object.assign({
        email: fakeUser.emails[0].address,
        name: fakeAccount.profile.addressBook[0].fullName
      }, accountAttributes);

      return Meteor.call("accounts/inviteShopOwner", options, shopData);
    }

    function stubPermissioning(settings) {
      const { hasPermission } = settings;

      sandbox
        .stub(Reaction, "hasPermission", () => hasPermission)
        .withArgs("admin", fakeAccount.userId, sinon.match.string);
    }

    beforeEach(function () {
      // fakeAccount = Factory.create("account");
      createUserSpy = sandbox.spy(MeteorAccounts, "createUser");

      // resolves issues with the onCreateUser event handler
      groupId = Random.id();
      group = Factory.create("group");
      sandbox
        .stub(Groups, "findOne", () => group)
        .withArgs({ _id: groupId, shopId: sinon.match.string });

      // since we expect a note to be written, let's ignore it to keep the output clean
      sandbox.stub(Logger, "info").withArgs(sinon.match(/Created shop/));
    });

    it("requires admin permission", function () {
      stubPermissioning({ hasPermission: false });

      expect(callDescribed).to.throw(ReactionError, /Access denied/);
      expect(createUserSpy).to.not.have.been.called;
    });

    it("creates a shop with the data provided", function () {
      const primaryShop = getShop();
      const name = Random.id();
      const shopData = { name };
      const email = `${Random.id()}@example.com`;

      stubPermissioning({ hasPermission: true });
      sandbox.stub(Reaction, "getPrimaryShop", () => primaryShop);

      sandbox.stub(Accounts, "findOne", () => fakeAccount)
        .withArgs({ id: fakeUser._id });

      callDescribed({ email }, shopData);

      const newShopCount = Shops.find({ name }).count();
      expect(newShopCount).to.equal(1);
    });
  });
});
