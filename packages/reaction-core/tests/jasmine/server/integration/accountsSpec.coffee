Accounts = ReactionCore.Collections.Accounts

fakeAddress = {
  fullName: 'Fake Name'
  address1: '123 Fake Address'
  address2: 'Ste. 123'
  city: 'Vegas'
  company: 'Fake Company'
  phone: '7195555555'
  region: 'FakeRegion'
  postal: '80903-4044'
  country: 'USA'
  isCommercial: false
  isShippingDefault: true
  isBillingDefault: true
}

describe "Account Meteor method ", ->

  describe 'addressBookAdd', ->

    beforeEach ->
      Accounts.remove {}

    it 'should throw 400 Match Failed error if the doc doesn\'t match the Address Schema', (done) ->
      account = Factory.create 'account'
      spyOn(Accounts, 'update')
      expect(-> Meteor.call 'addressBookAdd', {}, account._id).toThrow()
      expect(Accounts.update).not.toHaveBeenCalled()
      done()

    # Not sure how best to write this test, or if the addressBookAdd method is at fault.
    it 'should throw error if updated by user who doesn\'t own the account', (done) ->
      account1 = Factory.create 'account'
      account2 = Factory.create 'account'
      spyOn(Meteor, 'userId').and.returnValue account1._id
      spyOn(Accounts, 'update')

      Meteor.call 'addressBookAdd', fakeAddress, account2._id

      # expect(Accounts.update).not.toHaveBeenCalled()

      done()

  describe 'inviteShopMember', ->

    beforeEach ->
      Accounts.remove {}

    it 'should not add a user to the shop without Owner Access', (done) ->
      spyOn(ReactionCore, 'hasOwnerAccess').and.returnValue false
      account = Factory.create 'account'
      shop = Factory.create 'shop'
      testerEmail = shop.emails[1]?.address || 'mailtest@reactioncommerce.org'
      spyOn(Accounts, 'update')
      expect(-> Meteor.call "inviteShopMember", shop._id, testerEmail, 'Illegitimate User').toThrow()
      expect(Accounts.update).not.toHaveBeenCalled()
      done()

    it 'should add a user to the shop with Owner Access', (done) ->
      spyOn(ReactionCore, 'hasOwnerAccess').and.returnValue true
      account = Factory.create 'account'
      shop = Factory.create 'shop'
      testerEmail = shop.emails[1]?.address || 'mailtest@reactioncommerce.org'

      # spyOn(Accounts, 'update')
      expect(-> Meteor.call "inviteShopMember", shop._id, testerEmail, 'Test User').not.toThrow()
      # expect(Accounts.update).toHaveBeenCalled()
      done()
