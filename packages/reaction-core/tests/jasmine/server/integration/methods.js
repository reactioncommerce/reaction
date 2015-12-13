describe("core methods", function () {
  describe("flushTranslations", function () {
    it("should throw 403 error by non admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(ReactionCore.Collections.Translations, "remove");
      spyOn(ReactionImport, "translation");
      expect(function () {
        return Meteor.call("flushTranslations");
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Translations.remove).not.toHaveBeenCalled();
      expect(ReactionImport.translation).not.toHaveBeenCalled();
      return done();
    });
    it("should remove and load translations back by admin", function (done) {
      spyOn(Meteor, "userId").and.returnValue("0123456789");
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      spyOn(ReactionCore.Collections.Translations, "remove");
      Factory.create("shop");
      // spyOn(ReactionImport, "process");
      Meteor.call("flushTranslations");
      expect(ReactionCore.Collections.Translations.remove).toHaveBeenCalled();
      // expect(ReactionImport.process).toHaveBeenCalled();
      return done();
    });
  });

  describe("shop/removeHeaderTag", function () {
    beforeEach(function () {
      return ReactionCore.Collections.Tags.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      let currentTag;
      let tag;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(ReactionCore.Collections.Tags, "update");
      spyOn(ReactionCore.Collections.Tags, "remove");
      tag = Factory.create("tag");
      currentTag = Factory.create("tag");
      expect(function () {
        return Meteor.call("shop/removeHeaderTag", tag._id, currentTag._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Tags.update).not.toHaveBeenCalled();
      expect(ReactionCore.Collections.Tags.remove).not.toHaveBeenCalled();
      return done();
    });
    it("should remove header tag by admin", function (done) {
      let currentTag;
      let tag;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      tag = Factory.create("tag");
      currentTag = Factory.create("tag");
      expect(ReactionCore.Collections.Tags.find().count()).toEqual(2);
      Meteor.call("shop/removeHeaderTag", tag._id, currentTag._id);
      expect(ReactionCore.Collections.Tags.find().count()).toEqual(1);
      return done();
    });
  });

  describe("shop/updateHeaderTags", function () {
    beforeEach(function () {
      ReactionCore.Collections.Shops.remove({});
      return ReactionCore.Collections.Tags.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      let tag;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(ReactionCore.Collections.Tags, "update");
      tag = Factory.create("tag");
      expect(function () {
        return Meteor.call("shop/updateHeaderTags", tag._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Tags.update).not.toHaveBeenCalled();
      return done();
    });

    it("should insert new header tag with 1 argument by admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      spyOn(ReactionCore, "hasPermission").and.returnValue(true);
      // spyOn(ReactionCore.hasPermission, "createProduct").and.returnValue(true);
      let tag;

      let tagCount = ReactionCore.Collections.Tags.find().count();

      Factory.create("shop"); // Create shop so that ReactionCore.getShopId() doesn't fail
      Meteor.call("shop/updateHeaderTags", "new tag");
      expect(ReactionCore.Collections.Tags.find().count()).toEqual(tagCount + 1);
      tag = ReactionCore.Collections.Tags.find().fetch()[0];
      expect(tag.name).toEqual("new tag");
      expect(tag.slug).toEqual("new-tag");
      return done();
    });

    it("should update existing header tag with 2 arguments by admin", function (done) {
      let tag;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      tag = Factory.create("tag");
      Meteor.call("shop/updateHeaderTags", "updated tag", tag._id);
      expect(ReactionCore.Collections.Tags.find().count()).toEqual(1);
      tag = ReactionCore.Collections.Tags.find().fetch()[0];
      expect(tag.name).toEqual("updated tag");
      expect(tag.slug).toEqual("updated-tag");
      return done();
    });
  });

  describe("shop/locateAddress", function () {
    it("should locate an address based on known US coordinates", function (done) {
      let address = Meteor.call("shop/locateAddress", 34.043125, -118.267118);

      expect(address).toEqual({
        formattedAddress: "1111 S Figueroa St, Los Angeles, CA 90015, USA",
        latitude: 34.043125,
        longitude: -118.267118,
        extra:
         { googlePlaceId: "ChIJ0ygfX7jHwoARdAU7rfbSlxQ",
           confidence: 1,
           premise: null,
           subpremise: null,
           neighborhood: "Downtown",
           establishment: null },
        administrativeLevels:
         { level2long: "Los Angeles County",
           level2short: "Los Angeles County",
           level1long: "California",
           level1short: "CA" },
        streetNumber: "1111",
        streetName: "South Figueroa Street",
        city: "Los Angeles",
        country: "United States",
        countryCode: "US",
        zipcode: "90015"
      });
      return done();
    });

    it("should locate an address with known international coordinates", function (done) {
      let address = Meteor.call("shop/locateAddress", 53.414619, -2.947065);
      expect(address.formattedAddress).toContain("Molyneux Rd, Kensington, Liverpool, Merseyside L6 6AW, UK");
      return done();
    });

    it("should provide default empty address", function (done) {
      let address = Meteor.call("shop/locateAddress", 26.352498, -89.25293);

      expect(address).toEqual({
        latitude: null,
        longitude: null,
        country: "United States",
        city: null,
        state: null,
        stateCode: null,
        zipcode: null,
        streetName: null,
        streetNumber: null,
        countryCode: "US"
      });

      return done();
    });
  });
});
