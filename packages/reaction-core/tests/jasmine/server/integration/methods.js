describe("core methods", function () {
  describe("flushTranslations", function () {
    it("should throw 403 error by non admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(ReactionCore.Collections.Translations, "remove");
      spyOn(Fixtures, "loadI18n");
      expect(function () {
        return Meteor.call("flushTranslations");
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(ReactionCore.Collections.Translations.remove).not.toHaveBeenCalled();
      expect(Fixtures.loadI18n).not.toHaveBeenCalled();
      return done();
    });
    return it("should remove and load translations back by admin", function (done) {
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      spyOn(ReactionCore.Collections.Translations, "remove");
      spyOn(Fixtures, "loadI18n");
      Meteor.call("flushTranslations");
      expect(ReactionCore.Collections.Translations.remove).toHaveBeenCalled();
      expect(Fixtures.loadI18n).toHaveBeenCalled();
      return done();
    });
  });
  describe("removeHeaderTag", function () {
    beforeEach(function () {
      return Tags.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      var currentTag, tag;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(Tags, "update");
      spyOn(Tags, "remove");
      tag = Factory.create("tag");
      currentTag = Factory.create("tag");
      expect(function () {
        return Meteor.call("removeHeaderTag", tag._id, currentTag._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Tags.update).not.toHaveBeenCalled();
      expect(Tags.remove).not.toHaveBeenCalled();
      return done();
    });
    return it("should remove header tag by admin", function (done) {
      var currentTag, tag;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      tag = Factory.create("tag");
      currentTag = Factory.create("tag");
      expect(Tags.find().count()).toEqual(2);
      Meteor.call("removeHeaderTag", tag._id, currentTag._id);
      expect(Tags.find().count()).toEqual(1);
      return done();
    });
  });
  describe("updateHeaderTags", function () {
    beforeEach(function () {
      return Tags.remove({});
    });
    it("should throw 403 error by non admin", function (done) {
      var tag;
      spyOn(Roles, "userIsInRole").and.returnValue(false);
      spyOn(Tags, "update");
      tag = Factory.create("tag");
      expect(function () {
        return Meteor.call("updateHeaderTags", tag._id);
      }).toThrow(new Meteor.Error(403, "Access Denied"));
      expect(Tags.update).not.toHaveBeenCalled();
      return done();
    });
    it("should insert new header tag with 1 argument by admin", function (done) {
      var tag;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      Meteor.call("updateHeaderTags", "new tag");
      expect(Tags.find().count()).toEqual(1);
      tag = Tags.find().fetch()[0];
      expect(tag.name).toEqual("new tag");
      expect(tag.slug).toEqual("new-tag");
      return done();
    });
    return it("should update exising header tag with 2 arguments by admin", function (done) {
      var tag;
      spyOn(Roles, "userIsInRole").and.returnValue(true);
      tag = Factory.create("tag");
      Meteor.call("updateHeaderTags", "updated tag", tag._id);
      expect(Tags.find().count()).toEqual(1);
      tag = Tags.find().fetch()[0];
      expect(tag.name).toEqual("updated tag");
      expect(tag.slug).toEqual("updated-tag");
      return done();
    });
  });
  return describe("locateAddress", function () {
    it("should locate an address based on known US coordinates", function (done) {
      var address = Meteor.call("locateAddress", 34.043125, -118.267118);
      expect(address).toEqual({
        formattedAddress: '1111 South Figueroa Street, Los Angeles, CA 90015, USA',
        latitude: 34.043125,
        longitude: -118.267118,
        extra: {
          googlePlaceId: 'ChIJ0ygfX7jHwoARdAU7rfbSlxQ',
          confidence: 1,
          premise: null,
          subpremise: null,
          neighborhood: 'Downtown',
          establishment: null
        },
        administrativeLevels: {
          level2long: 'Los Angeles County',
          level2short: 'Los Angeles County',
          level1long: 'California',
          level1short: 'CA'
        },
        streetNumber: '1111',
        streetName: 'South Figueroa Street',
        city: 'Los Angeles',
        country: 'United States',
        countryCode: 'US',
        zipcode: '90015'
      });
      return done();
    });
    it("should locate an address with known international coordinates", function (done) {
      var address = Meteor.call("locateAddress", 53.414619, -2.947065);

      expect(address).toEqual({
        formattedAddress: '188 Molyneux Road, Kensington, Liverpool, Merseyside L6 6AW, UK',
        latitude: 53.4146191,
        longitude: -2.9470654,
        extra: {
          googlePlaceId: 'ChIJq3w3Fgohe0gRIIZ3kXH8aAI',
          confidence: 1,
          premise: null,
          subpremise: null,
          neighborhood: null,
          establishment: null
        },
        administrativeLevels: {
          level2long: 'Merseyside',
          level2short: 'Mersyd'
        },
        streetNumber: '188',
        streetName: 'Molyneux Road',
        city: 'Liverpool',
        country: 'United Kingdom',
        countryCode: 'GB',
        zipcode: 'L6 6AW'
      });
      return done();
    });
    return it("should provide default empty address", function (done) {
      var address = Meteor.call("locateAddress", 26.352498, -89.25293);

      expect(address).toEqual({
        latitude: null,
        longitude: null,
        country: 'United States',
        city: null,
        state: null,
        stateCode: null,
        zipcode: null,
        streetName: null,
        streetNumber: null,
        countryCode: 'US'
      });
      return done();
    });
  });
});
