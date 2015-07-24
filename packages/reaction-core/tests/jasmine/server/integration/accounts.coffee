fakeUser = Fake.user fields: [
  'name'
  'username'
  'emails.address'
  'profile.name'
]

fakeAddress = {
  fullName: fakeUser.profile.name
  address1: _.random(0, 100) + " " + Fake.word()
  address2: _.random(0, 100) + " " + Fake.word()
  city: Fake.word()
  company: Fake.word()
  phone: '0180055551212'
  region: Fake.word()
  postal: '90401-0000'
  country: 'USA'
  isCommercial: false
  isShippingDefault: true
  isBillingDefault: true
}

shopId = Factory.create("shop")._id


describe "Account Meteor method ", ->
  describe 'addressBookAdd', ->
    beforeEach ->
      ReactionCore.Collections.Accounts.remove {}

    it 'should throw 400 Match Failed error if the doc doesn\'t match the Address Schema', (done) ->
      account = Factory.create 'account'
      spyOn(ReactionCore.Collections.Accounts, 'update')
      expect(-> Meteor.call 'addressBookAdd', {}, account._id).toThrow()
      expect(ReactionCore.Collections.Accounts.update).not.toHaveBeenCalled()
      done()

    it 'should throw error if updated by user who doesn\'t own the account', (done) ->
      account1 = Factory.create 'account'
      account2 = Factory.create 'account'
      spyOn(Meteor, 'userId').and.returnValue account1._id
      spyOn(ReactionCore.Collections.Accounts, 'update')

      expect(-> Meteor.call 'addressBookAdd', fakeAddress, account2._id).not.toThrow()

      expect(ReactionCore.Collections.Accounts.update).toHaveBeenCalled()

      done()

  describe 'inviteShopMember', ->
    it 'should not let non-Owners invite a user to the shop', (done) ->
      spyOn(ReactionCore, 'hasOwnerAccess').and.returnValue false
      spyOn(Accounts, 'createUser')
      shopId = Factory.create('shop')._id

      expect(-> Meteor.call "inviteShopMember", shopId, fakeUser.emails[0].address, fakeUser.profile.name ).toThrow(new Meteor.Error 403, "Access denied")

      expect(Accounts.createUser).not.toHaveBeenCalledWith({username: fakeUser.profile.name})
      done()

    it 'should let a Owner invite a user to the shop', (done) ->
      spyOn(ReactionCore, 'hasOwnerAccess').and.returnValue true
      spyOn(Accounts, 'createUser')
      shopId = Factory.create('shop')._id
      # send an invite with fake user, we shouldn't get access denied.
      expect(-> Meteor.call  "inviteShopMember", shopId, fakeUser.emails[0].address, fakeUser.profile.name ).not.toThrow(new Meteor.Error 403, "Access denied")
      # not sure how to test for email send (perhaps for the thrown error)
      expect(Accounts.createUser).toHaveBeenCalledWith({email: fakeUser.emails[0].address, username: fakeUser.profile.name})
      done()
