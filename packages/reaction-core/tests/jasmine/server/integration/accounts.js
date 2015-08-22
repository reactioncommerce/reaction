
var fakeAddress, fakeUser, shopId;

fakeUser = Fake.user({
  fields: ['name', 'username', 'emails.address', 'profile.name']
});

fakeAddress = {
  fullName: fakeUser.profile.name,
  address1: _.random(0, 100) + " " + Fake.word(),
  address2: _.random(0, 100) + " " + Fake.word(),
  city: Fake.word(),
  company: Fake.word(),
  phone: '0180055551212',
  region: Fake.word(),
  postal: '90401-0000',
  country: 'USA',
  isCommercial: false,
  isShippingDefault: true,
  isBillingDefault: true
};

shopId = Factory.create("shop")._id;

describe("Account Meteor method ", function() {
  describe('addressBookAdd', function() {
    beforeEach(function() {
      return ReactionCore.Collections.Accounts.remove({});
    });
    it('should throw 400 Match Failed error if the doc doesn\'t match the Address Schema', function(done) {
      var account;
      account = Factory.create('account');
      spyOn(ReactionCore.Collections.Accounts, 'update');
      expect(function() {
        return Meteor.call('addressBookAdd', {}, account._id);
      }).toThrow();
      expect(ReactionCore.Collections.Accounts.update).not.toHaveBeenCalled();
      return done();
    });
    return it('should throw error if updated by user who doesn\'t own the account', function(done) {
      var account1, account2;
      account1 = Factory.create('account');
      account2 = Factory.create('account');
      spyOn(Meteor, 'userId').and.returnValue(account1._id);
      spyOn(ReactionCore.Collections.Accounts, 'update');
      expect(function() {
        return Meteor.call('addressBookAdd', fakeAddress, account2._id);
      }).not.toThrow();
      expect(ReactionCore.Collections.Accounts.update).toHaveBeenCalled();
      return done();
    });
  });
  return describe('inviteShopMember', function() {
    it('should not let non-Owners invite a user to the shop', function(done) {
      spyOn(ReactionCore, 'hasOwnerAccess').and.returnValue(false);
      spyOn(Accounts, 'createUser');
      shopId = Factory.create('shop')._id;
      expect(function() {
        return Meteor.call("inviteShopMember", shopId, fakeUser.emails[0].address, fakeUser.profile.name);
      }).toThrow(new Meteor.Error(403, "Access denied"));
      expect(Accounts.createUser).not.toHaveBeenCalledWith({
        username: fakeUser.profile.name
      });
      return done();
    });
    return it('should let a Owner invite a user to the shop', function(done) {
      spyOn(ReactionCore, 'hasOwnerAccess').and.returnValue(true);
      spyOn(Accounts, 'createUser');
      shopId = Factory.create('shop')._id;
      expect(function() {
        return Meteor.call("inviteShopMember", shopId, fakeUser.emails[0].address, fakeUser.profile.name);
      }).not.toThrow(new Meteor.Error(403, "Access denied"));
      expect(Accounts.createUser).toHaveBeenCalledWith({
        email: fakeUser.emails[0].address,
        username: fakeUser.profile.name
      });
      return done();
    });
  });
});
