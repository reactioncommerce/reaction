import { Shops, Tags } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import { stubs, spies } from "meteor/practicalmeteor:sinon";
import { Reaction } from "/server/api";

describe("Server/Core", function () {
  describe("shop/removeHeaderTag", function () {
    beforeEach(function () {
      return Tags.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      let currentTag;
      let tag;
      stubs.create("hasPermissionStub", Reaction, "hasPermission");
      stubs.hasPermissionStub.returns(false);
      spies.create("tagUpdateSpy", Tags, "update");
      // spyOn(Tags, "update");
      spies.create("tagRemoveSpy", Tags, "remove");
      // spyOn(Tags, "remove");
      tag = Factory.create("tag");
      currentTag = Factory.create("tag");
      let removeTagFunc = function () {
        return Meteor.call("shop/removeHeaderTag", tag._id, currentTag._id);
      };
      expect(removeTagFunc).to.throw(Meteor.Error, /Access Denied/);
      expect(spies.tagUpdateSpy).to.not.have.been.called;
      expect(spies.tagRemoveSpy).to.not.have.been.called;
      return done();
    });

    it("should remove header tag by admin", function (done) {
      let currentTag;
      let tag;
      stubs.create("hasPermissionStub", Reaction, "hasPermission");
      stubs.hasPermissionStub.returns(true);
      tag = Factory.create("tag");
      currentTag = Factory.create("tag");
      expect(Tags.find().count()).to.equal(2);
      Meteor.call("shop/removeHeaderTag", tag._id, currentTag._id);
      expect(Tags.find().count()).to.equal(1);
      return done();
    });
  });

  describe("shop/updateHeaderTags", function () {
    beforeEach(function () {
      Shops.remove({});
      return Tags.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      let tag;
      stubs.create("hasPermissionStub", Reaction, "hasPermission");
      stubs.hasPermissionStub.returns(false);
      // spyOn(Roles, "userIsInRole").and.returnValue(false);
      spies.create("tagUpdateSpy", Tags, "update");
      // spyOn(Tags, "update");
      tag = Factory.create("tag");
      let updateTagFunc = function () {
        return Meteor.call("shop/updateHeaderTags", tag._id);
      };
      expect(updateTagFunc).to.throw(Meteor.Error, /Access Denied/);
      expect(Tags.update).not.to.have.been.called;
      return done();
    });

    it("should insert new header tag with 1 argument by admin", function (done) {
      stubs.create("hasPermissionStub", Reaction, "hasPermission");
      stubs.hasPermissionStub.returns(true);
      // spyOn(ReactionCore.hasPermission, "createProduct").and.returnValue(true);
      let tag;
      let tagCount = Tags.find().count();
      Factory.create("shop"); // Create shop so that ReactionCore.getShopId() doesn't fail
      Meteor.call("shop/updateHeaderTags", "new tag");
      expect(Tags.find().count()).to.equal(tagCount + 1);
      tag = Tags.find().fetch()[0];
      expect(tag.name).to.equal("new tag");
      expect(tag.slug).to.equal("new-tag");
      return done();
    });

    it("should update existing header tag with 2 arguments by admin", function (done) {
      let tag;
      stubs.create("hasPermissionStub", Reaction, "hasPermission");
      stubs.hasPermissionStub.returns(true);

      // spyOn(Roles, "userIsInRole").and.returnValue(true);
      tag = Factory.create("tag");
      Meteor.call("shop/updateHeaderTags", "updated tag", tag._id);
      expect(Tags.find().count()).to.equal(1);
      tag = Tags.find().fetch()[0];
      expect(tag.name).to.equal("updated tag");
      expect(tag.slug).to.equal("updated-tag");
      return done();
    });
  });

  describe("shop/locateAddress", function () {
    it("should locate an address based on known US coordinates", function (done) {
      this.timeout(5000);
      let address = Meteor.call("shop/locateAddress", 34.043125, -118.267118);
      expect(address.zipcode).to.equal("90015");
      return done();
    });

    it("should locate an address with known international coordinates", function (done) {
      this.timeout(5000);
      let address = Meteor.call("shop/locateAddress", 53.414619, -2.947065);
      expect(address.formattedAddress).to.contain("Molyneux Rd, Kensington, Liverpool, Merseyside L6 6AW, UK");
      return done();
    });

    it("should provide default empty address", function (done) {
      this.timeout(5000);
      let address = Meteor.call("shop/locateAddress", 26.352498, -89.25293);
      expect(address).to.equal({
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
