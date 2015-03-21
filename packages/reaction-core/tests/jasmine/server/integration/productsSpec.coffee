Jasmine.onTest ->

  describe "Product Meteor method ", ->

    # Variant Method Tests
    
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
        
    describe "updateVariant", ->
      
      beforeEach ->
        Products.remove {}
      
      it "should throw 403 error by non admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue false
        product = Factory.create "product"
        spyOn(Products, "update")
        expect(-> Meteor.call "updateVariant", product.variants[0]).toThrow(new Meteor.Error 403, "Access Denied")
        expect(Products.update).not.toHaveBeenCalled()
        done()
        
      it "should update individual variant by admin passing in full object", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true
        product = Factory.create "product"
        variant = product.variants[0]
        
        # Update variant
        variant["title"] = "Updated Title"
        variant["price"] = 7
        Meteor.call "updateVariant", variant
        
        # Get updated variant
        updatedProduct = Products.find({"variants._id": variant._id}).fetch()[0]
        updatedVariant = updatedProduct.variants[0]
        expect(updatedVariant.price).toEqual 7
        expect(updatedVariant.title).toEqual "Updated Title"
        done()

      it "should update individual variant by admin passing in partial object", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true
        product = Factory.create "product"
        variant = product.variants[0]
        
        Meteor.call "updateVariant", { _id: variant._id, title: "Updated Title", price: 7 }
        
        # Get updated variant
        updatedProduct = Products.find({"variants._id": variant._id}).fetch()[0]
        updatedVariant = updatedProduct.variants[0]
        expect(updatedVariant.price).toEqual 7
        expect(updatedVariant.title).toEqual "Updated Title"
        expect(updatedVariant.optionTitle).toEqual variant.optionTitle
        done()

    describe "updateVariants", ->
      
      beforeEach ->
        Products.remove {}
      
      it "should throw 403 error by non admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue false
        product = Factory.create "product"
        spyOn(Products, "update")
        expect(-> Meteor.call "updateVariants", product.variants).toThrow(new Meteor.Error 403, "Access Denied")
        expect(Products.update).not.toHaveBeenCalled()
        done()
        
      it "should update all variants by admin passing in array of objects", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true
        product = Factory.create "product"
        Meteor.call "cloneVariant", product._id, product.variants[0]._id
        product = Products.findOne({"variants._id": product.variants[0]._id})

        # Update variant
        product.variants[0].title = "Updated Title"
        product.variants[0].price = 7
        product.variants[1].title = "Updated Clone Title"
        
        Meteor.call "updateVariants", product.variants
        
        # Get updated variant
        updatedProduct = Products.findOne({"variants._id": product.variants[0]._id})
        updatedVariant = updatedProduct.variants[0]
        clonedVariant = updatedProduct.variants[1]
        expect(updatedVariant.price).toEqual 7
        expect(updatedVariant.title).toEqual "Updated Title"
        expect(clonedVariant.title).toEqual "Updated Clone Title"
        expect(clonedVariant.optionTitle).toEqual product.variants[1].optionTitle
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
        
      it "should delete all child variants (options) by admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true
        product = Factory.create "product"
        Meteor.call "cloneVariant", product._id, product.variants[0]._id, product.variants[0]._id
        product = Products.findOne(product._id)
        expect(_.size(product.variants)).toEqual 2
        Meteor.call "deleteVariant", product.variants[0]._id
        product = Products.findOne(product._id)
        expect(_.size(product.variants)).toEqual 0
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


    describe "updateProductField", ->

      beforeEach ->
        Products.remove {}

      it "should throw 403 error by non admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue false
        product = Factory.create "product"
        spyOn(Products, "update")
        
        expect(-> Meteor.call "updateProductField", product._id, "title", "Updated Title").toThrow(new Meteor.Error 403, "Access Denied")
        expect(Products.update).not.toHaveBeenCalled()
        done()

      it "should update product field by admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true

        product = Factory.create "product"
        Meteor.call "updateProductField", product._id, "title", "Updated Title"

        product = Products.findOne({_id: product._id})
        expect(product.title).toEqual 'Updated Title'

        done()

    describe "updateProductTags", ->
      
      beforeEach ->
        Products.remove {}
        Tags.remove {}
      
      it "should throw 403 error by non admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue false
        product = Factory.create "product"
        spyOn(Products, "update")
        spyOn(Tags, "insert")
        
        expect(-> Meteor.call "updateProductTags", product._id, "productTag", null).toThrow(new Meteor.Error 403, "Access Denied")
        expect(Products.update).not.toHaveBeenCalled()
        expect(Tags.insert).not.toHaveBeenCalled()
        done()
        
      it "should add new tag when passed tag name and null ID by admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true
        
        product = Factory.create "product"
        tagName = "Product Tag"
        newTag =
          slug: getSlug tagName
          name: tagName
        
        expect(Tags.findOne({"name": tagName})).toEqual undefined
        
        Meteor.call "updateProductTags", product._id, tagName, null
        
        tag = Tags.findOne({name: tagName})
        expect(tag.slug).toEqual getSlug tagName
        product = Products.findOne({_id: product._id})
        expect(product.hashtags).toContain tag._id
        done()
        
      it "should add existing tag when passed existing tag and tag._id by admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true
        
        product = Factory.create "product"
        tag = Factory.create "tag"
        expect(Tags.find().count()).toEqual 1
        expect(product.hashtags).not.toContain tag._id
        
        Meteor.call "updateProductTags", product._id, tag.name, tag._id
        
        expect(Tags.find().count()).toEqual 1
        product = Products.findOne({_id: product._id})
        expect(product.hashtags).toContain tag._id
        done()
        
    describe "removeProductTag", ->
      
      beforeEach ->
        Products.remove {}
        Tags.remove {}
        
      it "should throw 403 error by non admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue false
        product = Factory.create "product"
        tag = Factory.create "tag"
        spyOn(Products, "update")
        spyOn(Tags, "remove")
        
        expect(-> Meteor.call "removeProductTag", product._id, tag._id).toThrow(new Meteor.Error 403, "Access Denied")
        expect(Products.update).not.toHaveBeenCalled()
        expect(Tags.remove).not.toHaveBeenCalled()
        done()
      
      it "should remove product tag by admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true
        product = Factory.create "product"
        tag = Factory.create "tag"
        Meteor.call "updateProductTags", product._id, tag.name, tag._id
        
        product = Products.findOne({_id: product._id})
        expect(product.hashtags).toContain tag._id
        expect(Tags.find().count()).toEqual 1
        
        Meteor.call "removeProductTag", product._id, tag._id
        product = Products.findOne({_id: product._id})
        expect(product.hashtags).not.toContain tag._id
        expect(Tags.find().count()).toEqual 0
        done()

      # Test that tag is removed if and only if there are no more products
      # or related tags associated with it
    
    describe "setHandleTag", ->
      
      beforeEach ->
        Products.remove {}
        Tags.remove {}
      
      it "should throw 403 error by non admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue false
        product = Factory.create "product"
        tag = Factory.create "tag"
        spyOn(Products, "update")
        
        expect(-> Meteor.call "setHandleTag", product._id, tag._id).toThrow(new Meteor.Error 403, "Access Denied")
        expect(Products.update).not.toHaveBeenCalled()
        done()
      
      it "should set handle tag for product by admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue true
        product = Factory.create "product"
        tag = Factory.create "tag"
        Meteor.call "setHandleTag", product._id, tag._id
        
        product = Products.findOne({_id: product._id})
        expect(product.handle).toEqual tag.slug
        done()
        
    describe "updateProductPosition", ->
      
      beforeEach ->
        Products.remove {}
        Tags.remove {}
      
      it "should throw 403 error by non admin", (done) ->
        spyOn(Roles, "userIsInRole").and.returnValue false
        product = Factory.create "product"
        spyOn(Products, "update")
        
        expect(-> Meteor.call "updateProductPosition", product._id, {}).toThrow(new Meteor.Error 403, "Access Denied")
        expect(Products.update).not.toHaveBeenCalled()
        done()
      
      it "should update product position by admin", (done) ->
        # Something wrong with updateProductPosition currently.
        spyOn(Roles, "userIsInRole").and.returnValue true
        product = Factory.create "product"
        tag = Factory.create "tag"
        
        position =
          tag: tag._id
          position: 0
          weight: '0'
          updatedAt: new Date()
        
        Meteor.call "updateProductPosition", product._id, position
        
        product = Products.findOne(product._id)
        expect(product.positions[0].tag).toEqual tag._id
        done()
