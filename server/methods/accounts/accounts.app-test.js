/* eslint dot-notation: 0 */
/* eslint prefer-arrow-callback:0 */
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import { check, Match } from "meteor/check";
import { Random } from "meteor/random";
import { Accounts as MeteorAccount } from "meteor/accounts-base";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Accounts, Packages, Orders, Products, Shops, Cart } from "/lib/collections";
import { Reaction } from "/server/api";
import { getShop, getAddress } from "/server/imports/fixtures/shops";
import Fixtures from "/server/imports/fixtures";

Fixtures();

before(function () {
  this.timeout(10000);
  Meteor._sleepForMs(7000);
});

describe("Account Meteor method ", function () {
  let shopId;
  const fakeUser = Factory.create("account");
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
  });

  afterEach(function () {
    sandbox.restore();
  });

  function spyOnMethod(method, id) {
    return sandbox.stub(Meteor.server.method_handlers, `cart/${method}`, function (...args) {
      check(args, [Match.Any]); // to prevent audit_arguments from complaining
      this.userId = id;
      return originals[method].apply(this, args);
    });
  }

  describe("addressBookAdd", function () {
    beforeEach(function () {
      Cart.remove({});
      Accounts.remove({});
    });

    it("should allow user to add new addresses", function (done) {
      let account = Factory.create("account");
      sandbox.stub(Meteor, "userId", function () {
        return account.userId;
      });
      const address = getAddress();
      // we already have one address by default
      expect(account.profile.addressBook.length).to.equal(1);
      Meteor.call("accounts/addressBookAdd", address);
      account = Accounts.findOne(account._id);
      expect(account.profile.addressBook.length).to.equal(2);
      return done();
    });

    it("should allow Admin to add new addresses to other users", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      let account = Factory.create("account");
      const address = getAddress();
      expect(account.profile.addressBook.length).to.equal(1);
      Meteor.call("accounts/addressBookAdd", address, account.userId);

      account = Accounts.findOne(account._id);
      expect(account.profile.addressBook.length).to.equal(2);
      return done();
    });

    it("should insert exactly the same address as expected", function (done) {
      let account = Factory.create("account");
      sandbox.stub(Meteor, "userId", function () {
        return account.userId;
      });
      const address = getAddress();
      Meteor.call("accounts/addressBookAdd", address);
      account = Accounts.findOne(account._id);
      expect(account.profile.addressBook.length).to.equal(2);
      const newAddress = account.profile.addressBook[
        account.profile.addressBook.length - 1];
      delete newAddress._id;
      delete newAddress.failedValidation;
      expect(_.isEqual(address, newAddress)).to.be.true;
      return done();
    });

    it("should throw error if wrong arguments were passed", function (done) {
      const accountSpy = sandbox.spy(Accounts, "update");

      expect(function () {
        return Meteor.call("accounts/addressBookAdd", 123456);
      }).to.throw;

      expect(function () {
        return Meteor.call("accounts/addressBookAdd", {});
      }).to.throw;

      expect(function () {
        return Meteor.call("accounts/addressBookAdd", null);
      }).to.throw;

      expect(function () {
        return Meteor.call("accounts/addressBookAdd");
      }).to.throw;

      expect(function () {
        return Meteor.call("accounts/addressBookAdd", "asdad", 123);
      }).to.throw;

      // https://github.com/aldeed/meteor-simple-schema/issues/522
      expect(function () {
        return Meteor.call(
          "accounts/addressBookAdd",
          () => { expect(true).to.be.true; }
        );
      }).to.not.throw;

      expect(accountSpy).to.not.have.been.called;

      return done();
    });

    it("should not let non-Admin add address to another user", function (done) {
      sandbox.stub(Meteor, "userId", function () {
        return fakeUser._id;
      });
      const account2 = Factory.create("account");
      const updateAccountSpy = sandbox.spy(Accounts, "update");
      const upsertAccountSpy = sandbox.spy(Accounts, "upsert");
      expect(function () {
        return Meteor.call(
          "accounts/addressBookAdd", getAddress(),
          account2._id
        );
      }).to.throw();
      expect(updateAccountSpy).to.not.have.been.called;
      expect(upsertAccountSpy).to.not.have.been.called;

      return done();
    });

    it(
      "should disable isShipping/BillingDefault properties inside sibling" +
      " address if we enable them while adding",
      function (done) {
        const account = Factory.create("account");
        sandbox.stub(Meteor, "userId", function () {
          return account.userId;
        });
        sandbox.stub(Reaction, "getShopId", function () {
          return shopId;
        });
        const sessionId = Random.id(); // Required for creating a cart
        spyOnMethod("setShipmentAddress", account.userId);
        spyOnMethod("setPaymentAddress", account.userId);

        Meteor.call("cart/createCart", account.userId, sessionId);
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
        const cart = Cart.findOne({ userId: account.userId });
        expect(cart.shipping[0].address._id).to.equal(newAddress._id);
        expect(cart.billing[0].address._id).to.equal(newAddress._id);

        return done();
      }
    );
  });

  describe("addressBookUpdate", function () {
    // Required for creating a cart
    const sessionId = Random.id();
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

    beforeEach(() => {
      Cart.remove({});
      Accounts.remove({});
    });

    it("should allow user to edit addresses", function (done) {
      const account = Factory.create("account");
      sandbox.stub(Meteor, "userId", function () {
        return account.userId;
      });
      sandbox.stub(Reaction, "getShopId", function () {
        return shopId;
      });
      sandbox.stub(Reaction, "hasAdminAccess", function () {
        return true;
      });
      spyOnMethod("setShipmentAddress", account.userId);
      spyOnMethod("setPaymentAddress", account.userId);
      const updateAccountSpy = sandbox.spy(Accounts, "update");

      Meteor.call("cart/createCart", account.userId, sessionId);

      // we put new faker address over current address to test all fields
      // at once, but keep current address._id
      const address = Object.assign({}, account.profile.addressBook[0], getAddress());
      Meteor.call("accounts/addressBookUpdate", address);
      expect(updateAccountSpy).to.have.been.called;

      return done();
    });

    it("should allow Admin to edit other user address", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      sandbox.stub(Reaction, "hasAdminAccess", () => true);
      let account = Factory.create("account");
      spyOnMethod("setShipmentAddress", account.userId);
      spyOnMethod("setPaymentAddress", account.userId);

      sandbox.stub(Reaction, "getShopId", () => shopId);
      Meteor.call("cart/createCart", account.userId, sessionId);

      // we put new faker address over current address to test all fields
      // at once, but keep current address._id
      const address = Object.assign({}, account.profile.addressBook[0], getAddress());
      Meteor.call("accounts/addressBookUpdate", address, account.userId);

      // comparing two addresses to equality
      account = Accounts.findOne(account._id);
      const newAddress = account.profile.addressBook[0];
      expect(_.isEqual(address, newAddress)).to.be.true;

      return done();
    });

    it("should update fields to exactly the same what we need", function () {
      let account = Factory.create("account");
      sandbox.stub(Meteor, "userId", () => account.userId);
      sandbox.stub(Reaction, "getShopId", () => shopId);
      spyOnMethod("setShipmentAddress", account.userId);
      spyOnMethod("setPaymentAddress", account.userId);
      Meteor.call("cart/createCart", account.userId, sessionId);

      // we put new faker address over current address to test all fields
      // at once, but keep current address._id
      const address = Object.assign({}, account.profile.addressBook[0], getAddress());
      Meteor.call("accounts/addressBookUpdate", address);

      // comparing two addresses to equality
      account = Accounts.findOne(account._id);
      const newAddress = account.profile.addressBook[0];
      expect(_.isEqual(address, newAddress)).to.be.true;
    });

    it("should throw error if wrong arguments were passed", function () {
      const updateAccountSpy = sandbox.spy(Accounts, "update");
      expect(() => Meteor.call("accounts/addressBookUpdate", 123456)).to.throw;
      expect(() => Meteor.call("accounts/addressBookUpdate", {})).to.throw;
      expect(() => Meteor.call("accounts/addressBookUpdate", null)).to.throw;
      expect(() => Meteor.call("accounts/addressBookUpdate")).to.throw;
      expect(() => Meteor.call("accounts/addressBookUpdate", "asdad", 123)).to.throw;

      // https://github.com/aldeed/meteor-simple-schema/issues/522
      expect(function () {
        return Meteor.call(
          "accounts/addressBookUpdate",
          () => { expect(true).to.be.true; }
        );
      }).to.not.throw;
      expect(updateAccountSpy).to.not.have.been.called;
    });

    it("should not let non-Admin to edit address of another user", function () {
      const account = Factory.create("account");
      const account2 = Factory.create("account");
      sandbox.stub(Meteor, "userId", () => account.userId);
      const accountUpdateSpy = sandbox.spy(Accounts, "update");
      expect(() => Meteor.call("accounts/addressBookUpdate", getAddress(), account2._id)).to.throw;
      expect(accountUpdateSpy).to.not.have.been.called;
    });

    it("enabling isShipping/BillingDefault properties should add this address to cart", function () {
      const account = Factory.create("account");
      spyOnMethod("setShipmentAddress", account.userId);
      spyOnMethod("setPaymentAddress", account.userId);
      sandbox.stub(Meteor, "userId", function () {
        return account.userId;
      });
      sandbox.stub(Reaction, "getShopId", () => shopId);
      Meteor.call("cart/createCart", account.userId, sessionId);
      // first we need to disable defaults, because we already have some
      // random defaults in account, but cart is clean. This is test only
      // situation.
      let address = Object.assign({}, account.profile.addressBook[0], {
        isShippingDefault: false,
        isBillingDefault: false
      });
      Meteor.call("accounts/addressBookUpdate", address);
      let cart = Cart.findOne({ userId: account.userId });
      expect(cart.billing).to.be.defined;
      expect(cart.shipping).to.be.undefined;

      address = Object.assign({}, account.profile.addressBook[0], {
        isShippingDefault: true,
        isBillingDefault: true
      });
      Meteor.call("accounts/addressBookUpdate", address);
      cart = Cart.findOne({ userId: account.userId });
      expect(cart).to.not.be.undefined;

      expect(cart.billing[0].address._id).to.equal(address._id);
      expect(cart.shipping[0].address._id).to.equal(address._id);
    });

    it(
      "should disable isShipping/BillingDefault properties inside sibling" +
      " address if we enable them while editing",
      function (done) {
        let account = Factory.create("account");
        spyOnMethod("setShipmentAddress", account.userId);
        spyOnMethod("setPaymentAddress", account.userId);
        sandbox.stub(Meteor, "userId", function () {
          return account.userId;
        });
        sandbox.stub(Reaction, "getShopId", () => shopId);
        Meteor.call("cart/createCart", account.userId, sessionId);
        // cart was created without any default addresses, we need to add one
        let address = Object.assign({}, account.profile.addressBook[0], {
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
        account = Accounts.findOne(account._id);

        expect(account.profile.addressBook[0].isBillingDefault).to.be.false;
        expect(account.profile.addressBook[0].isShippingDefault).to.be.false;
        return done();
      }
    );

    it("should update cart default addresses via `type` argument", function () {
      const account = Factory.create("account");
      const { userId } = account;
      spyOnMethod("setShipmentAddress", account.userId);
      spyOnMethod("setPaymentAddress", account.userId);
      sandbox.stub(Reaction, "getShopId", () => shopId);
      sandbox.stub(Meteor, "userId", () => userId);
      Meteor.call("cart/createCart", userId, sessionId);
      // clean account
      Meteor.call(
        "accounts/addressBookRemove",
        account.profile.addressBook[0]._id
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
    it("should allow user to remove address", function () {
      let account = Factory.create("account");
      const address = account.profile.addressBook[0];
      sandbox.stub(Meteor, "userId", () => account.userId);
      expect(account.profile.addressBook.length).to.equal(1);
      Meteor.call("accounts/addressBookRemove", address._id);
      account = Accounts.findOne(account._id);
      expect(account.profile.addressBook.length).to.equal(0);
    });

    it("should allow Admin to remove other user address", function () {
      let account = Factory.create("account");
      const address = account.profile.addressBook[0];
      sandbox.stub(Reaction, "hasPermission", () => true);
      expect(account.profile.addressBook.length).to.equal(1);
      Meteor.call("accounts/addressBookRemove", address._id, account.userId);
      account = Accounts.findOne(account._id);
      expect(account.profile.addressBook.length).to.equal(0);
    });

    it("should throw error if wrong arguments were passed", function () {
      const updateAccountSpy = sandbox.spy(Accounts, "update");
      expect(() => Meteor.call("accounts/addressBookRemove", 123456)).to.throw;
      expect(() => Meteor.call("accounts/addressBookRemove", {})).to.throw;
      expect(() => Meteor.call("accounts/addressBookRemove", null)).to.throw;
      expect(() => Meteor.call("accounts/addressBookRemove")).to.throw;
      expect(() => Meteor.call("accounts/addressBookRemove", "asdad", 123)).to.throw;

      // https://github.com/aldeed/meteor-simple-schema/issues/522
      expect(function () {
        return Meteor.call(
          "accounts/addressBookRemove",
          () => { expect(true).to.be.true; }
        );
      }).to.not.throw;
      expect(updateAccountSpy).to.not.have.been.called;
    });

    it("should not let non-Admin to remove address of another user", function () {
      const account = Factory.create("account");
      const account2 = Factory.create("account");
      const address2 = account2.profile.addressBook[0];
      sandbox.stub(Meteor, "userId", function () {
        return account.userId;
      });
      const accountUpdateSpy = sandbox.spy(Accounts, "update");
      expect(() => Meteor.call(
        "accounts/addressBookRemove",
        address2._id, account2.userId
      )).to.throw;
      expect(accountUpdateSpy).to.not.have.been.called;
    });

    it("should call `cart/unsetAddresses` Method", function () {
      const account = Factory.create("account");
      const address = account.profile.addressBook[0];
      sandbox.stub(Meteor, "userId", () => account.userId);
      const cartUnsetSpy = sandbox.spy(Meteor.server.method_handlers, "cart/unsetAddresses");

      Meteor.call("accounts/addressBookRemove", address._id);
      expect(cartUnsetSpy).to.have.been.called;
      expect(cartUnsetSpy.args[0][0]).to.equal(address._id);
      expect(cartUnsetSpy.args[0][1]).to.equal(account.userId);
    });

    it("should return zero(0) if address not exists", function () {
      sandbox.stub(Meteor, "userId", () => fakeUser.userId);
      const result = Meteor.call("accounts/addressBookRemove", "asdasdasd");
      expect(result).to.equal(0);
    });
  });

  describe("accounts/inviteShopMember", function () {
    it("should not let non-Owners invite a user to the shop", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const createUserSpy = sandbox.spy(MeteorAccount, "createUser");
      // create user
      expect(() =>
        Meteor.call("accounts/inviteShopMember", {
          shopId,
          groupId: Random.id(),
          email: fakeUser.emails[0].address,
          name: fakeUser.profile.addressBook[0].fullName
        })).to.throw(Meteor.Error, /Access denied/);
      // expect that createUser shouldnt have run
      expect(createUserSpy).to.not.have.been.called;
    });

    it("should let a Owner invite a user to the shop", function (done) {
      this.timeout(20000);
      this.retries(3);
      sandbox.stub(Reaction, "hasPermission", () => true);
      // TODO: Need to udpate this test to properly check the account created
      // there's currently an error with Media branding asset when trying to do that
      expect(() =>
        Meteor.call("accounts/inviteShopMember", {
          shopId,
          groupId: Random.id(),
          email: fakeUser.emails[0].address,
          name: fakeUser.profile.addressBook[0].fullName
        })).to.not.throw(Meteor.Error, /Access denied/);
      return done();
    });
  });

  describe("accounts/inviteShopOwner", function () {
    beforeEach(function () {
      sandbox.stub(Meteor, "user", function () {
        return fakeUser;
      });
    });

    it("should ensure only admin can invite as shop owner", function () {
      sandbox.stub(Reaction, "hasPermission", () => false);
      const createUserSpy = sandbox.spy(MeteorAccount, "createUser");
      expect(() =>
        Meteor.call("accounts/inviteShopOwner", {
          email: fakeUser.emails[0].address,
          name: fakeUser.profile.addressBook[0].fullName
        })).to.throw(Meteor.Error, /Access denied/);
      expect(createUserSpy).to.not.have.been.called;
    });

    it("should confirm if email already exists before creating", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      expect(() =>
        Meteor.call("accounts/inviteShopOwner", {
          email: fakeUser.emails[0].address,
          name: fakeUser.profile.addressBook[0].fullName
        })).to.not.throw(Meteor.Error, /Access denied/);

      return done();
    });

    it("should let admin invite a user to manage a shop", function (done) {
      sandbox.stub(Reaction, "hasPermission", () => true);
      expect(() =>
        Meteor.call("accounts/inviteShopOwner", {
          email: "custom@email.co",
          name: "custom name"
        })).to.not.throw(Meteor.Error, /Access denied/);

      return done();
    });
  });
});
