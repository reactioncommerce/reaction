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
import { SSR } from "meteor/meteorhacks:ssr";
import { Accounts, Groups, Packages, Orders, Products, Shops, Cart } from "/lib/collections";
import Reaction from "/server/api/core";
import { getShop, getAddress } from "/server/imports/fixtures/shops";
import Fixtures from "/server/imports/fixtures";

Fixtures();

describe("Account Meteor method ", function () {
  let shopId;
  let fakeUser;
  let fakeAccount;
  const originals = {};
  let sandbox;

  before(function () {
    originals["mergeCart"] = Meteor.server.method_handlers["cart/mergeCart"];
    originals["setShipmentAddress"] = Meteor.server.method_handlers["cart/setShipmentAddress"];
    originals["setPaymentAddress"] = Meteor.server.method_handlers["cart/setPaymentAddress"];
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
    sandbox.stub(Meteor, "userId", () => userId);
    sandbox.stub(Meteor, "user", () => fakeUser);
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

  describe("addressBookAdd", function () {
    beforeEach(function () {
      const sessionId = Random.id(); // Required for creating a cart
      // editing your address book also updates your cart, so be sure there
      // is a cart present
      Meteor.call("cart/createCart", fakeAccount.userId, sessionId);
    });

    it("should allow user to add new addresses", function () {
      const address = getAddress();
      // we already have one address by default
      expect(fakeAccount.profile.addressBook.length).to.equal(1);

      Meteor.call("accounts/addressBookAdd", address);

      const account = Accounts.findOne({ _id: fakeAccount._id });
      expect(account.profile.addressBook.length).to.equal(2);
    });

    it("should allow Admin to add new addresses to other users", function () {
      sandbox.stub(Reaction, "hasPermission", () => true);
      const address = getAddress();
      expect(fakeAccount.profile.addressBook.length).to.equal(1);

      Meteor.call("accounts/addressBookAdd", address, fakeAccount.userId);

      const account = Accounts.findOne({ _id: fakeAccount._id });
      expect(account.profile.addressBook.length).to.equal(2);
    });

    it("should insert exactly the same address as expected", function () {
      const address = getAddress();

      Meteor.call("accounts/addressBookAdd", address);

      const account = Accounts.findOne({ _id: fakeAccount._id });
      expect(account.profile.addressBook.length).to.equal(2);
      const newAddress = account.profile.addressBook[
        account.profile.addressBook.length - 1];
      delete newAddress._id;
      delete newAddress.failedValidation;
      expect(_.isEqual(address, newAddress)).to.be.true;
    });

    it("should throw error if wrong arguments were passed", function () {
      const accountSpy = sandbox.spy(Accounts, "update");

      expect(function () {
        return Meteor.call("accounts/addressBookAdd", 123456);
      }).to.throw(Error, /must be an object/);

      expect(function () {
        return Meteor.call("accounts/addressBookAdd", null);
      }).to.throw(Error, /must be an object/);

      expect(function () {
        return Meteor.call("accounts/addressBookAdd");
      }).to.throw(Error, /must be an object/);

      expect(function () {
        return Meteor.call("accounts/addressBookAdd", "asdad", 123);
      }).to.throw(Error, /must be an object/);

      expect(function () {
        return Meteor.call("accounts/addressBookAdd", {});
      }).to.throw(Error, /Full name is required/);

      // https://github.com/aldeed/meteor-simple-schema/issues/522
      expect(function () {
        return Meteor.call(
          "accounts/addressBookAdd",
          () => { expect(true).to.be.true; }
        );
      }).to.not.throw();

      expect(accountSpy).to.not.have.been.called;
    });

    it("should not let non-Admin add address to another user", function () {
      const account2 = Factory.create("account", { userId: Factory.create("user")._id });
      const updateAccountSpy = sandbox.spy(Accounts, "update");
      const upsertAccountSpy = sandbox.spy(Accounts, "upsert");
      expect(function () {
        return Meteor.call(
          "accounts/addressBookAdd", getAddress(),
          account2.userId
        );
      }).to.throw(Meteor.Error, /Access denied/);
      expect(updateAccountSpy).to.not.have.been.called;
      expect(upsertAccountSpy).to.not.have.been.called;
    });

    it(
      "should disable isShipping/BillingDefault properties inside sibling" +
      " address if we enable them while adding",
      function () {
        // cart was created without any default addresses, we need to add one
        const address = Object.assign({}, getAddress(), {
          isShippingDefault: true,
          isBillingDefault: true
        });
        Meteor.call("accounts/addressBookAdd", address);

        // Now we need to override cart with new address
        const newAddress = Object.assign({}, getAddress(), {
          _id: Random.id(),
          isShippingDefault: true,
          isBillingDefault: true
        });
        Meteor.call("accounts/addressBookAdd", newAddress);

        // now we need to get address ids from cart and compare their
        const cart = Cart.findOne({ userId: fakeAccount.userId });
        expect(cart.shipping[0].address._id).to.equal(newAddress._id);
        expect(cart.billing[0].address._id).to.equal(newAddress._id);
      }
    );
  });

  describe("addressBookUpdate", function () {
    let removeInventoryStub;

    before(function () {
      removeInventoryStub = sinon.stub(Meteor.server.method_handlers, "inventory/remove", function (...args) {
        check(args, [Match.Any]);
        return true;
      });
    });

    after(function () {
      removeInventoryStub.restore();
    });

    beforeEach(function () {
      const sessionId = Random.id(); // Required for creating a cart
      // editing your address book also updates your cart, so be sure there
      // is a cart present
      Meteor.call("cart/createCart", fakeAccount.userId, sessionId);
    });

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

    it("should not let non-Admin to edit address of another user", function () {
      const account2 = Factory.create("account");
      const accountUpdateSpy = sandbox.spy(Accounts, "update");

      expect(() => Meteor.call("accounts/addressBookUpdate", getAddress(), account2._id))
        .to.throw(Meteor.Error, /Access denied/);

      expect(accountUpdateSpy).to.not.have.been.called;
    });

    it("enabling isShipping/BillingDefault properties should add this address to cart", function () {
      // first we need to disable defaults, because we already have some
      // random defaults in account, but cart is clean. This is test only
      // situation.
      let address = Object.assign({}, fakeAccount.profile.addressBook[0], {
        isShippingDefault: false,
        isBillingDefault: false
      });
      Meteor.call("accounts/addressBookUpdate", address);

      let cart = Cart.findOne({ userId: fakeAccount.userId });
      // "cart/unsetAddresses" unsets cart.type.address, not cart.type,
      // so we ensure that either cart.type (if the address was never
      // created) or cart.type.address (if it had been unset) are now undefined
      expect(cart.billing && cart.billing.address).to.be.undefined;
      expect(cart.shipping && cart.shipping.address).to.be.undefined;

      address = Object.assign({}, fakeAccount.profile.addressBook[0], {
        isShippingDefault: true,
        isBillingDefault: true
      });
      Meteor.call("accounts/addressBookUpdate", address);
      cart = Cart.findOne({ userId: fakeAccount.userId });
      expect(cart).to.not.be.undefined;

      expect(cart.billing[0].address._id).to.equal(address._id);
      expect(cart.shipping[0].address._id).to.equal(address._id);
    });

    it(
      "should disable isShipping/BillingDefault properties inside sibling" +
      " address if we enable them while editing",
      function () {
        // cart was created without any default addresses, we need to add one
        let address = Object.assign({}, fakeAccount.profile.addressBook[0], {
          isShippingDefault: true,
          isBillingDefault: true
        });
        Meteor.call("accounts/addressBookUpdate", address);

        // we add new address with disabled defaults
        address = Object.assign({}, getAddress(), {
          _id: Random.id(),
          isShippingDefault: false,
          isBillingDefault: false
        });
        Meteor.call("accounts/addressBookAdd", address);
        // now we can test edit
        Object.assign(address, {
          isShippingDefault: true,
          isBillingDefault: true
        });

        Meteor.call("accounts/addressBookUpdate", address, null, "isBillingDefault");
        Meteor.call("accounts/addressBookUpdate", address, null, "isShippingDefault");
        const account = Accounts.findOne({ _id: fakeAccount._id });

        expect(account.profile.addressBook[0].isBillingDefault).to.be.false;
        expect(account.profile.addressBook[0].isShippingDefault).to.be.false;
      }
    );

    it("should update cart default addresses via `type` argument", function () {
      const { userId } = fakeAccount;
      // clean account
      Meteor.call(
        "accounts/addressBookRemove",
        fakeAccount.profile.addressBook[0]._id
      );
      // preparation
      let address = Object.assign({}, getAddress(), {
        _id: Random.id(),
        isShippingDefault: false,
        isBillingDefault: false
      });
      Meteor.call("accounts/addressBookAdd", address);
      address = Object.assign(address, {
        isShippingDefault: true,
        isBillingDefault: true
      });

      Meteor.call("accounts/addressBookUpdate", address, null, "isBillingDefault");
      Meteor.call("accounts/addressBookUpdate", address, null, "isShippingDefault");
      const cart = Cart.findOne({ userId });
      expect(cart.billing[0].address._id).to.equal(address._id);
      expect(cart.shipping[0].address._id).to.equal(address._id);
    });
  });

  describe("addressBookRemove", function () {
    beforeEach(function () {
      const sessionId = Random.id(); // Required for creating a cart
      // editing your address book also udpates your cart, so be sure there
      // is a cart present
      Meteor.call("cart/createCart", fakeAccount.userId, sessionId);
    });

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

    it("should not let non-Admin to remove address of another user", function () {
      const account2 = Factory.create("account");
      const address2 = account2.profile.addressBook[0];
      const accountUpdateSpy = sandbox.spy(Accounts, "update");
      expect(() => Meteor.call(
        "accounts/addressBookRemove",
        address2._id, account2.userId
      )).to.throw(Meteor.Error, /Access denied/);
      expect(accountUpdateSpy).to.not.have.been.called;
    });

    it("should call `cart/unsetAddresses` Method", function () {
      const address = fakeAccount.profile.addressBook[0];
      const cartUnsetSpy = sandbox.spy(Meteor.server.method_handlers, "cart/unsetAddresses");

      Meteor.call("accounts/addressBookRemove", address._id);
      expect(cartUnsetSpy).to.have.been.called;
      expect(cartUnsetSpy.args[0][0]).to.equal(address._id);
      expect(cartUnsetSpy.args[0][1]).to.equal(fakeAccount.userId);
    });

    it("should throw an error if address does not exist to remove", function () {
      expect(() => Meteor.call("accounts/addressBookRemove", "asdasdasd"))
        .to.throw(Meteor.Error, /Unable to remove address from account/);
    });
  });

  describe("accounts/inviteShopMember", function () {
    let createUserSpy;
    let sendEmailSpy;
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
      sendEmailSpy = sandbox.stub(Reaction.Email, "send"); // stub instead of spy so we don't actually try to send

      groupId = Random.id();
      group = Factory.create("group");
      sandbox.stub(Groups, "findOne", () => group).withArgs({ _id: groupId });
    });

    it("requires reaction-accounts permission", function () {
      stubPermissioning({ hasPermission: false });
      sandbox.stub(Logger, "error") // since we expect this, let's keep the output clean
        .withArgs(sinon.match(/reaction-accounts permissions/));

      expect(callDescribed).to.throw(Meteor.Error, /Access denied/);
      expect(createUserSpy).to.not.have.been.called;
    });

    it("ensures the user has invite permission for this group/shop", function () {
      stubPermissioning({ hasPermission: true, canInviteToGroup: false });

      expect(callDescribed).to.throw(Meteor.Error, /Cannot invite/);
      expect(createUserSpy).to.not.have.been.called;
    });

    it("prevents inviting the owner of a shop (only a member)", function () {
      group.slug = "owner";
      stubPermissioning({ hasPermission: true, canInviteToGroup: true });

      expect(callDescribed).to.throw(Meteor.Error, /invite owner/);
      expect(createUserSpy).to.not.have.been.called;
    });

    it("invites existing users", function () {
      const subjectSpy = sandbox.spy(SSR, "render");

      stubPermissioning({ hasPermission: true, canInviteToGroup: true });
      sandbox
        .stub(Meteor.users, "findOne", () => fakeUser)
        .withArgs({ "emails.address": fakeUser.emails[0].address });

      callDescribed();

      expect(sendEmailSpy).to.have.been.called;
      expect(createUserSpy).to.not.have.been.called;
      expect(subjectSpy)
        .to.have.been.calledWith(sinon.match(/inviteShopMember/));
    });

    it("creates and invites new users", function () {
      const email = `${Random.id()}@example.com`;
      const subjectSpy = sandbox.spy(SSR, "render");

      stubPermissioning({ hasPermission: true, canInviteToGroup: true });

      callDescribed({ email });

      expect(sendEmailSpy).to.have.been.called;
      expect(createUserSpy).to.have.been.called;
      expect(subjectSpy)
        .to.have.been.calledWith(sinon.match(/inviteNewShopMember/));
    });
  });

  describe("accounts/inviteShopOwner", function () {
    let createUserSpy;
    let sendEmailSpy;
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

      // the following stub is just to speed things up. the tests were timing
      // out in the shop creation step. this seems to resolve that.
      sandbox.stub(Reaction, "insertPackagesForShop");
    }

    beforeEach(function () {
      // fakeAccount = Factory.create("account");
      createUserSpy = sandbox.spy(MeteorAccounts, "createUser");
      sendEmailSpy = sandbox.stub(Reaction.Email, "send");

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

      expect(callDescribed).to.throw(Meteor.Error, /Access denied/);
      expect(createUserSpy).to.not.have.been.called;
    });

    it("invites existing users", function () {
      const subjectSpy = sandbox.spy(SSR, "render");

      stubPermissioning({ hasPermission: true });
      sandbox
        .stub(Meteor.users, "findOne", () => fakeUser)
        .withArgs({ "emails.address": fakeUser.emails[0].address });

      callDescribed();

      expect(sendEmailSpy).to.have.been.called;
      expect(createUserSpy).to.not.have.been.called;
      expect(subjectSpy)
        .to.have.been.calledWith(sinon.match(/inviteShopOwner/));
    });

    it("creates and invites new users", function () {
      const email = `${Random.id()}@example.com`;
      const subjectSpy = sandbox.spy(SSR, "render");

      stubPermissioning({ hasPermission: true });

      callDescribed({ email });

      expect(sendEmailSpy).to.have.been.called;
      expect(createUserSpy).to.have.been.called;
      expect(subjectSpy)
        .to.have.been.calledWith(sinon.match(/inviteShopOwner/));
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
