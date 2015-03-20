Jasmine.onTest ->

  describe "Meteor method ", ->

    describe "flushTranslations", ->

      it "should throw 403 error by non admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue false
        spyOn(ReactionCore.Collections.Translations, "remove")
        spyOn(Fixtures, "loadI18n")

        expect(-> Meteor.call "flushTranslations").toThrow(new Meteor.Error 403, "Access Denied")
        expect(ReactionCore.Collections.Translations.remove).not.toHaveBeenCalled()
        expect(Fixtures.loadI18n).not.toHaveBeenCalled()
        done()

      it "should remove and load translations back by admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true
        spyOn(ReactionCore.Collections.Translations, "remove")
        spyOn(Fixtures, "loadI18n")

        Meteor.call "flushTranslations"

        expect(ReactionCore.Collections.Translations.remove).toHaveBeenCalled()
        expect(Fixtures.loadI18n).toHaveBeenCalled()
        done()

    describe "removeHeaderTag", ->

      beforeEach ->
        Tags.remove {}

      it "should throw 403 error by non admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue false
        spyOn(Tags, "update")
        spyOn(Tags, "remove")

        tag = Factory.create "tag"
        currentTag = Factory.create "tag"
        expect(-> Meteor.call "removeHeaderTag", tag._id, currentTag._id).toThrow(new Meteor.Error 403, "Access Denied")
        expect(Tags.update).not.toHaveBeenCalled()
        expect(Tags.remove).not.toHaveBeenCalled()
        done()

      it "should remove header tag by admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true

        tag = Factory.create "tag"
        currentTag = Factory.create "tag"
        expect(Tags.find().count()).toEqual 2
        Meteor.call "removeHeaderTag", tag._id, currentTag._id
        expect(Tags.find().count()).toEqual 1
        done()

    describe "updateHeaderTags", ->

      beforeEach ->
        Tags.remove {}

      it "should throw 403 error by non admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue false
        spyOn(Tags, "update")
        
        tag = Factory.create "tag"
        expect(-> Meteor.call "updateHeaderTags", tag._id).toThrow(new Meteor.Error 403, "Access Denied")
        expect(Tags.update).not.toHaveBeenCalled()
        done()

      it "should insert new header tag with 1 argument by admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true

        Meteor.call "updateHeaderTags", "new tag"
        expect(Tags.find().count()).toEqual 1

        tag = Tags.find().fetch()[0]
        expect(tag.name).toEqual "new tag"
        expect(tag.slug).toEqual "new-tag"
        done()

      it "should update exising header tag with 2 arguments by admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true

        tag = Factory.create "tag"
        Meteor.call "updateHeaderTags", "updated tag", tag._id
        expect(Tags.find().count()).toEqual 1

        tag = Tags.find().fetch()[0]
        expect(tag.name).toEqual "updated tag"
        expect(tag.slug).toEqual "updated-tag"
        done()

    describe "createProduct", ->

      beforeEach ->
        Products.remove {}

      it "should throw 403 error by non admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue false
        spyOn(Products, "insert")

        expect(-> Meteor.call "createProduct").toThrow(new Meteor.Error 403, "Access Denied")
        expect(Products.insert).not.toHaveBeenCalled()
        done()

      it "should create new product by admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true
        spyOn(Products, "insert").and.returnValue 1

        expect(Meteor.call "createProduct").toEqual 1

        expect(Products.insert).toHaveBeenCalled()
        done()

    describe "deleteProduct", ->

      beforeEach ->
        Products.remove {}

      it "should throw 403 error by non admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue false
        spyOn(Products, "remove")

        product = Factory.create "product"
        expect(-> Meteor.call "deleteProduct", product._id).toThrow(new Meteor.Error 403, "Access Denied")
        expect(Products.remove).not.toHaveBeenCalled()
        done()

      it "should delete product by admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true

        product = Factory.create "product"
        expect(Products.find().count()).toEqual 1
        expect(Meteor.call "deleteProduct", product._id).toBe true
        expect(Products.find().count()).toEqual 0
        done()

    describe "cloneProduct", ->

      beforeEach ->
        Products.remove {}

      it "should throw 403 error by non admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue false
        product = Factory.create "product"
        spyOn(Products, "insert")
        
        expect(-> Meteor.call "cloneProduct", product).toThrow(new Meteor.Error 403, "Access Denied")
        expect(Products.insert).not.toHaveBeenCalled()
        done()

      it "should clone product by admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true

        product = Factory.create "product"
        expect(Products.find().count()).toEqual 1
        Meteor.call "cloneProduct", product
        expect(Products.find().count()).toEqual 2

        productCloned = Products.find({_id: {$ne: product._id}}).fetch()[0]
        expect(productCloned.title).toEqual product.title + '1'
        expect(productCloned.pageTitle).toEqual product.pageTitle
        expect(productCloned.description).toEqual product.description

        done()
        
    describe "createVariant", ->
      
      beforeEach ->
        Products.remove {}
      
      it "should throw 403 error by non admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue false
        product = Factory.create "product"
        spyOn(Products, "update")
        expect(-> Meteor.call "createVariant", product._id).toThrow(new Meteor.Error 403, "Access Denied")
        expect(Products.update).not.toHaveBeenCalled()
        done()
        
      it "should create variant by admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true
        product = Factory.create "product"
        expect(_.size(product.variants)).toEqual 1
        Meteor.call "createVariant", product._id
        product = Products.findOne(product._id)
        variant = product.variants[1]
        expect(_.size(product.variants)).toEqual 2
        
        expect(variant.title).toEqual ""
        expect(variant.price).toEqual 0
        done()


    describe "cloneVariant", ->
      
      beforeEach ->
        Products.remove {}
      
      it "should throw 403 error by non admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue false
        product = Factory.create "product"
        spyOn(Products, "insert")
        expect(-> Meteor.call "cloneVariant", product._id, product.variants[0]._id).toThrow(new Meteor.Error 403, "Access Denied")
        expect(Products.insert).not.toHaveBeenCalled()
        done()
      
      it "should clone variant by admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true
        product = Factory.create "product"
        expect(_.size(product.variants)).toEqual 1
        Meteor.call "cloneVariant", product._id, product.variants[0]._id
        product = Products.findOne(product._id)
        expect(_.size(product.variants)).toEqual 2
        done()
        
    describe "deleteVariant", ->
      
      beforeEach ->
        Products.remove {}
      
      it "should throw 403 error by non admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue false
        product = Factory.create "product"
        spyOn(Products, "update")
        expect(-> Meteor.call "deleteVariant", product.variants[0]._id).toThrow(new Meteor.Error 403, "Access Denied")
        expect(Products.update).not.toHaveBeenCalled()
        done()
      
      it "should delete variant by admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true
        product = Factory.create "product"
        expect(_.size(product.variants)).toEqual 1
        Meteor.call "deleteVariant", product.variants[0]._id
        product = Products.findOne(product._id)
        expect(_.size(product.variants)).toEqual 0
        done()
      
