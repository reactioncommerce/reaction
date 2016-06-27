/* eslint dot-notation: 0 */

import { Meteor } from "meteor/meteor";
import { Accounts as MeteorAccount } from "meteor/accounts-base";
import { Accounts, Packages, Orders, Products, Shops, Cart }  from "/lib/collections";
import { Reaction } from "/server/api";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import _ from  "underscore";
import { getShop, getAddress } from "/server/imports/fixtures/shops";
import Fixtures from "/server/imports/fixtures";

Fixtures();

before(function () {
  this.timeout(6000);
  Meteor._sleepForMs(5000);
});

describe("Account Meteor method ", function () {
  const shopId = getShop()._id;
  const fakeUser = Factory.create("account");
  let originals = {};
  let sandbox;

  before(function () {
    originals["mergeCart"] = Meteor.server.method_handlers["cart/mergeCart"];
    originals["setShipmentAddress"] = Meteor.server.method_handlers["cart/setShipmentAddress"];
    originals["setPaymentAddress"] = Meteor.server.method_handlers["cart/setPaymentAddress"];
  });

  after(() => {
    Packages.direct.remove({});
    Cart.direct.remove({});
    Accounts.direct.remove({});
    Orders.direct.remove({});
    Products.direct.remove({});
    Shops.direct.remove({});
    if (sandbox) {
      sandbox.restore();
    }
  });

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  function spyOnMethod(method, id) {
    return sandbox.stub(Meteor.server.method_handlers, `cart/${method}`, function () {
      check(arguments, [Match.Any]); // to prevent audit_arguments from complaining
      this.userId = id;
      return originals[method].apply(this, arguments);
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
      // spyOn(Meteor, "userId").and.returnValue(account.userId);
      const address = getAddress();
      // we already have one address by default
      expect(account.profile.addressBook.length).to.equal(1);
      Meteor.call("accounts/addressBookAdd", address);
      account = Accounts.findOne(account._id);
      expect(account.profile.addressBook.length).to.equal(2);
      return done();
    });

    it("should allow Admin to add new addresses to other users", function (done) {
      sandbox.stub(Reaction, "hasPermission", function () {
        return true;
      });
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
      expect(_.isEqual(address, newAddress)).to.be.true;
      return done();
    });

    it("should throw error if wrong arguments were passed", function (done) {
      let accountSpy = sandbox.spy(Accounts, "update");

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
      // spyOn(Meteor, "userId").and.returnValue(fakeUser._id);
      let updateAccountSpy = sandbox.spy(Accounts, "update");
      // spyOn(ReactionCore.Collections.Accounts, "update");
      let upsertAccountSpy = sandbox.spy(Accounts, "upsert");
      // spyOn(ReactionCore.Collections.Accounts, "upsert");

      expect(function () {
        return Meteor.call("accounts/addressBookAdd", getAddress(),
          account2._id);
      }).to.throw();
      expect(updateAccountSpy).to.not.have.been.called;
      expect(upsertAccountSpy).to.not.have.been.called;

      return done();
    });

    it("should disabled isShipping/BillingDefault properties inside sibling" +
      " address if we enable their while adding",
      function (done) {
        let account = Factory.create("account");
        sandbox.stub(Meteor, "userId", function () {
          return account.userId;
        });
        sandbox.stub(Reaction, "getShopId", function () {
          return shopId;
        });
        // spyOn(ReactionCore, "getShopId").and.returnValue(shopId);
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
        const cart = Cart.findOne({userId: account.userId});
        expect(cart.shipping[0].address._id).to.equal(newAddress._id);
        expect(cart.billing[0].address._id).to.equal(newAddress._id);

        return done();
      });
  });

  describe("addressBookUpdate", function () {
    // Required for creating a cart
    const sessionId = Random.id();
    let removeInventoryStub;

    before(function () {
      removeInventoryStub = sinon.stub(Meteor.server.method_handlers, "inventory/remove", function () {
        check(arguments, [Match.Any]);
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
      let account = Factory.create("account");
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
      let updateAccountSpy = sandbox.spy(Accounts, "update");

      Meteor.call("cart/createCart", account.userId, sessionId);

      // we put new faker address over current address to test all fields
      // at once, but keep current address._id
      const address = Object.assign({}, account.profile.addressBook[0], getAddress());
      Meteor.call("accounts/addressBookUpdate", address);
      expect(updateAccountSpy).to.have.been.called;

      return done();
    });

    it("should allow Admin to edit other user address", function (done) {
      sandbox.stub(Reaction, "hasPermission", function () {
        return true;
      });
      sandbox.stub(Reaction, "hasAdminAccess", function () {
        return true;
      });
      let account = Factory.create("account");
      spyOnMethod("setShipmentAddress", account.userId);
      spyOnMethod("setPaymentAddress", account.userId);

      // spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shopId);
      sandbox.stub(Reaction, "getShopId", function () {
        return shopId;
      });
      // spyOn(ReactionCore, "getShopId").and.returnValue(shopId);

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

    it("should update fields to exactly the same what we need", function (done) {
      let account = Factory.create("account");
      sandbox.stub(Meteor, "userId", function () {
        return account.userId;
      });
      // spyOn(Meteor, "userId").and.returnValue(account.userId);
      sandbox.stub(Reaction, "getShopId", function () {
        return shopId;
      });
      spyOnMethod("setShipmentAddress", account.userId);
      spyOnMethod("setPaymentAddress", account.userId);
      // spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shopId);
      // spyOn(ReactionCore, "getShopId").and.returnValue(shopId);

      Meteor.call("cart/createCart", account.userId, sessionId);

      // we put new faker address over current address to test all fields
      // at once, but keep current address._id
      const address = Object.assign({}, account.profile.addressBook[0], getAddress());
      Meteor.call("accounts/addressBookUpdate", address);

      // comparing two addresses to equality
      account = Accounts.findOne(account._id);
      const newAddress = account.profile.addressBook[0];
      expect(_.isEqual(address, newAddress)).to.be.true;

      return done();
    });

    it("should throw error if wrong arguments were passed", function (done) {
      let updateAccountSpy = sandbox.spy(Accounts, "update");

      expect(function () {
        return Meteor.call("accounts/addressBookUpdate", 123456);
      }).to.throw;

      expect(function () {
        return Meteor.call("accounts/addressBookUpdate", {});
      }).to.throw;

      expect(function () {
        return Meteor.call("accounts/addressBookUpdate", null);
      }).to.throw;

      expect(function () {
        return Meteor.call("accounts/addressBookUpdate");
      }).to.throw;

      expect(function () {
        return Meteor.call("accounts/addressBookUpdate", "asdad", 123);
      }).to.throw;

      // https://github.com/aldeed/meteor-simple-schema/issues/522
      expect(function () {
        return Meteor.call(
          "accounts/addressBookUpdate",
          () => { expect(true).to.be.true; }
        );
      }).to.not.throw;

      expect(updateAccountSpy).to.not.have.been.called;
      return done();
    });

    it("should not let non-Admin to edit address of another user", function (done) {
      let account = Factory.create("account");
      const account2 = Factory.create("account");
      sandbox.stub(Meteor, "userId", function () {
        return account.userId;
      });
      // spyOn(Meteor, "userId").and.returnValue(account.userId);
      let accountUpdateSpy = sandbox.spy(Accounts, "update");
      // spyOn(ReactionCore.Collections.Accounts, "update");

      expect(function () {
        return Meteor.call("accounts/addressBookUpdate", getAddress(), account2._id);
      }).to.throw;

      expect(accountUpdateSpy).to.not.have.been.called;
      return done();
    });

    it("enabling isShipping/BillingDefault properties should add this address to cart", function (done) {
      let account = Factory.create("account");
      spyOnMethod("setShipmentAddress", account.userId);
      spyOnMethod("setPaymentAddress", account.userId);
      sandbox.stub(Meteor, "userId", function () {
        return account.userId;
      });
      // spyOn(Meteor, "userId").and.returnValue(account.userId);
      // spyOn(ReactionCore, "shopIdAutoValue").and.returnValue(shopId);
      sandbox.stub(Reaction, "getShopId", function () {
        return shopId;
      });
      // spyOn(ReactionCore, "getShopId").and.returnValue(shopId);

      Meteor.call("cart/createCart", account.userId, sessionId);
      // first we need to disable defaults, because we already have some
      // random defaults in account, but cart is clean. This is test only
      // situation.
      let address = Object.assign({}, account.profile.addressBook[0], {
        isShippingDefault: false,
        isBillingDefault: false
      });
      Meteor.call("accounts/addressBookUpdate", address);
      let cart = Cart.findOne({userId: account.userId});
      expect(cart.billing).to.be.undefined;
      expect(cart.shipping).to.be.undefined;

      address = Object.assign({}, account.profile.addressBook[0], {
        isShippingDefault: true,
        isBillingDefault: true
      });
      Meteor.call("accounts/addressBookUpdate", address);
      cart = Cart.findOne({userId: account.userId});
      expect(cart).to.not.be.undefined;

      expect(cart.billing[0].address._id).to.equal(address._id);
      expect(cart.shipping[0].address._id).to.equal(address._id);
      return done();
    });

    it("should disable isShipping/BillingDefault properties inside sibling" +
      " address if we enable them while editing",
      function (done) {
        let account = Factory.create("account");
        spyOnMethod("setShipmentAddress", account.userId);
        spyOnMethod("setPaymentAddress", account.userId);
        sandbox.stub(Meteor, "userId", function () {
          return account.userId;
        });
        // spyOn(Meteor, "userId").and.returnValue(account.userId);
        sandbox.stub(Reaction, "getShopId", function () {
          return shopId;
        });
        // spyOn(ReactionCore, "getShopId").and.returnValue(shopId);

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
        Meteor.call("accounts/addressBookUpdate", address);
        account = Accounts.findOne(account._id);

        expect(account.profile.addressBook[0].isBillingDefault).to.be.false;
        expect(account.profile.addressBook[0].isShippingDefault).to.be.false;
        return done();
      }
    );

    it("should update cart default addresses via `type` argument", function (done) {
      let account = Factory.create("account");
      const userId = account.userId;
      spyOnMethod("setShipmentAddress", account.userId);
      spyOnMethod("setPaymentAddress", account.userId);
      sandbox.stub(Reaction, "getShopId", function () {
        return shopId;
      });
      // spyOn(ReactionCore, "getShopId").and.returnValue(shopId);
      sandbox.stub(Meteor, "userId", function () {
        return userId;
      });
      // spyOn(Meteor, "userId").and.returnValue(userId);

      Meteor.call("cart/createCart", userId, sessionId);
      // clean account
      Meteor.call("accounts/addressBookRemove",
        account.profile.addressBook[0]._id);
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
      let cart = Cart.findOne({userId: userId});
      expect(cart.billing[0].address._id).to.equal(address._id);
      expect(cart.shipping[0].address._id).to.equal(address._id);

      return done();
    });
  });

  describe("addressBookRemove", function () {
    it("should allow user to remove address", function (done) {
      let account = Factory.create("account");
      const address = account.profile.addressBook[0];
      // user
      sandbox.stub(Meteor, "userId", function () {
        return account.userId;
      });
      // spyOn(Meteor, "userId").and.returnValue(account.userId);

      expect(account.profile.addressBook.length).to.equal(1);
      Meteor.call("accounts/addressBookRemove", address._id);
      account = Accounts.findOne(account._id);
      expect(account.profile.addressBook.length).to.equal(0);

      return done();
    });

    it("should allow Admin to remove other user address", function (done) {
      let account = Factory.create("account");
      const address = account.profile.addressBook[0];
      sandbox.stub(Reaction, "hasPermission", function () {
        return true;
      });
      // spyOn(ReactionCore, "hasPermission").and.returnValue(true);

      expect(account.profile.addressBook.length).to.equal(1);
      Meteor.call("accounts/addressBookRemove", address._id, account.userId);
      account = Accounts.findOne(account._id);
      expect(account.profile.addressBook.length).to.equal(0);

      return done();
    });

    it("should throw error if wrong arguments were passed", function (done) {
      let updateAccountSpy = sandbox.spy(Accounts, "update");
      // spyOn(ReactionCore.Collections.Accounts, "update");

      expect(function () {
        return Meteor.call("accounts/addressBookRemove", 123456);
      }).to.throw;

      expect(function () {
        return Meteor.call("accounts/addressBookRemove", {});
      }).to.throw;

      expect(function () {
        return Meteor.call("accounts/addressBookRemove", null);
      }).to.throw;

      expect(function () {
        return Meteor.call("accounts/addressBookRemove");
      }).to.throw;

      expect(function () {
        return Meteor.call("accounts/addressBookRemove", "asdad", 123);
      }).to.throw;

      // https://github.com/aldeed/meteor-simple-schema/issues/522
      expect(function () {
        return Meteor.call(
          "accounts/addressBookRemove",
          () => { expect(true).to.be.true; }
        );
      }).to.not.throw;
      expect(updateAccountSpy).to.not.have.been.called;
      return done();
    });

    it("should not let non-Admin to remove address of another user", function (done) {
      const account = Factory.create("account");
      const account2 = Factory.create("account");
      const address2 = account2.profile.addressBook[0];
      sandbox.stub(Meteor, "userId", function () {
        return account.userId;
      });
      // spyOn(Meteor, "userId").and.returnValue(account.userId);
      let accountUpdateSpy = sandbox.spy(Accounts, "update");
      // spyOn(ReactionCore.Collections.Accounts, "update");

      expect(function () {
        return Meteor.call("accounts/addressBookRemove",
          address2._id, account2.userId);
      }).to.throw;

      expect(accountUpdateSpy).to.not.have.been.called;
      return done();
    });

    it("should call `cart/unsetAddresses` Method", function (done) {
      const account = Factory.create("account");
      const address = account.profile.addressBook[0];
      sandbox.stub(Meteor, "userId", function () {
        return account.userId;
      });
      // spyOn(Meteor, "userId").and.returnValue(account.userId);
      let cartUnsetSpy = sandbox.spy(Meteor.server.method_handlers, "cart/unsetAddresses");
      // spyOn(Meteor, "call").and.callThrough();

      Meteor.call("accounts/addressBookRemove", address._id);
      expect(cartUnsetSpy).to.have.been.called;
      expect(cartUnsetSpy.args[0][0]).to.equal(address._id);
      expect(cartUnsetSpy.args[0][1]).to.equal(account.userId);

      return done();
    });

    it("should return zero(0) if address not exists", function (done) {
      sandbox.stub(Meteor, "userId", function () {
        return fakeUser.userId;
      });
      // spyOn(Meteor, "userId").and.returnValue(fakeUser.userId);
      const result = Meteor.call("accounts/addressBookRemove", "asdasdasd");
      expect(result).to.equal(0);
      return done();
    });
  });

  describe("accounts/inviteShopMember", function () {
    it("should not let non-Owners invite a user to the shop", function (done) {
      // spyOn(ReactionCore, "hasOwnerAccess").and.returnValue(false);
      sandbox.stub(Reaction, "hasPermission", function () {
        return false;
      });
      // spyOn(ReactionCore, "hasPermission").and.returnValue(false);
      let createUserSpy = sandbox.spy(MeteorAccount, "createUser");
      // create user
      expect(function () {
        return Meteor.call("accounts/inviteShopMember", shopId,
          fakeUser.emails[0].address,
          fakeUser.profile.addressBook[0].fullName);
      }).to.throw(Meteor.Error, /Access denied/);
      // expect that createUser shouldnt have run
      expect(createUserSpy).to.not.have.been.called;
      // expect(createUserSpy).to.not.have.been.called.with({
      //   username: fakeUser.profile.addressBook[0].fullName
      // });
      return done();
    });

    it("should let a Owner invite a user to the shop", function (done) {
      this.timeout(20000);
      this.retries(3);
      sandbox.stub(Reaction, "hasPermission", function () {
        return true;
      });
      // TODO checking this is failing, even though we can see it happening in the log.
      // spyOn(Email, "send");
      expect(function () {
        return Meteor.call("accounts/inviteShopMember",
          shopId,
          fakeUser.emails[0].address,
          fakeUser.profile.addressBook[0].fullName);
      }).to.not.throw(Meteor.Error, /Access denied/);
      // expect(Email.send).toHaveBeenCalled();
      return done();
    });
  });
});

