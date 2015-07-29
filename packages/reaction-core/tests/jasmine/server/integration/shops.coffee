# shop schema and factory test
describe "core shop schema", ->

    beforeEach ->
      Shops.remove {}

    it "should create a new factory shop", (done) ->
      spyOn(Roles, "userIsInRole").and.returnValue true
      spyOn(Shops, "insert")
      shop = Factory.create "shop"
      expect(Shops.insert).toHaveBeenCalled()
      done()


# Shop Method Tests
describe "core shop methods", ->

  beforeEach ->
      Shops.remove {}

  describe "createShop", ->
    it "should throw 403 error by non admin", (done) ->
      spyOn(Roles, "userIsInRole").and.returnValue false
      spyOn(Shops, "insert")
      expect(-> Meteor.call "createShop").toThrow(new Meteor.Error 403, "Access Denied")
      expect(Shops.insert).not.toHaveBeenCalled()
      done()

    it "should create new shop for admin", (done) ->
      spyOn(Roles, "userIsInRole").and.returnValue true
      spyOn(Shops, "insert")
      expect(-> Meteor.call "createShop").not.toThrow(new Meteor.Error 403, "Access Denied")
      expect(Shops.insert).toHaveBeenCalled()
      done()
