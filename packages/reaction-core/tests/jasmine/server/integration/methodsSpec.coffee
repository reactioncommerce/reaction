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
        
    describe "locateAddress", ->
      
      it "should locate an address based on known US coordinates", (done) ->
        address = {}
        Meteor.call "locateAddress", 34.043125, -118.267118, (error, addr) ->
          address = addr if addr
        expect(address).toEqual({
          latitude: 34.043125
          longitude: -118.267118
          country: 'United States'
          city: 'Los Angeles'
          state: 'California'
          stateCode: 'CA'
          zipcode: '90015'
          streetName: 'South Figueroa Street'
          streetNumber: '1111'
          countryCode: 'US'
          })
        done()
        
      it "should locate an address with known international coordinates", (done) ->
        address = {}
        Meteor.call "locateAddress", 53.414619, -2.947065, (error, addr) ->
          address = addr if addr
        expect(address).toEqual({
          latitude: 53.4146191
          longitude: -2.9470654
          country: 'United Kingdom'
          city: 'Liverpool'
          state: null
          stateCode: null
          zipcode: 'L6 6AW'
          streetName: 'Molyneux Road'
          streetNumber: '188'
          countryCode: 'GB'
          })
        done()
        
      it "should provide default empty address", (done) ->
        address = {}
        Meteor.call "locateAddress", 26.352498, -89.25293, (error, addr) ->
          address = addr if addr
        expect(address).toEqual({
          latitude: null
          longitude: null
          country: 'United States'
          city: null
          state: null
          stateCode: null
          zipcode: null
          streetName: null
          streetNumber: null
          countryCode: 'US'
          })
        done()
