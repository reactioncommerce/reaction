# shop schema and factory test
describe "core shop schema", ->

    beforeEach ->
      Shops.remove {}

    it "should create a new factory shop", (done) ->
      spyOn(Roles, "userIsInRole").and.returnValue true
      spyOn(Shops, "insert")
      shop = Factory.create "shop"
      expect(Shops.insert).toHaveBeenCalled()
      # expect(_.size(shop.domains)).toEqual 1
      done()


# Shop Method Tests
describe "core shop methods", ->

  describe "createShop", ->

    # beforeEach ->
    #   Shops.remove {}
    #   Products.remove {}

    it "should throw 403 error by non admin", (done) ->
      spyOn(Roles, "userIsInRole").and.returnValue false
      spyOn(Shops, "insert")
      expect(-> Meteor.call "createShop").toThrow(new Meteor.Error 403, "Access Denied")
      expect(Shops.insert).not.toHaveBeenCalled()
      done()

    it "should create new shop for admin", (done) ->
      spyOn(Roles, "userIsInRole").and.returnValue true
      spyOn(Shops, "insert")
      shopId = Meteor.call "createShop"

      expect(Shops.insert).toHaveBeenCalled()
      shop = Shops.findOne()
      # expect(_.size(shop.domains)).toEqual 1
      done()

  describe "createShop and createProduct(shopId)", ->

    it "should create the product(shopId:shopId) in the new shop", (done) ->
      spyOn(Roles, "userIsInRole").and.returnValue true
      # test createShop method first
      Meteor.call "createShop"
      shop = Factory.create "shop"
      shopId = shop._id
      # expect( ReactionCore.getShopId() ).toEqual shopId
      expect(ReactionCore.Collections.Shops.find().count()).toEqual 2
      # create product
      Meteor.call "createProduct", shopId: shopId, (error, productId) ->
        product = Products.findOne(productId)
        expect(_.size(product.variants)).toEqual 1
        # new product shop id should be new shop created
        expect(product.shopId).toEqual shopId
      done()
