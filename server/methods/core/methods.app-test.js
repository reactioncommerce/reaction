/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Factory } from "meteor/dburles:factory";
import { Shops, Tags } from "/lib/collections";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Reaction } from "/server/api";

describe("Server/Core", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("shop/removeHeaderTag", function () {
    beforeEach(function () {
      return Tags.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      const tagUpdateSpy = sandbox.spy(Tags, "update");
      const tagRemoveSpy = sandbox.spy(Tags, "remove");
      const tag = Factory.create("tag");
      const currentTag = Factory.create("tag");
      function removeTagFunc() {
        return Meteor.call("shop/removeHeaderTag", tag._id, currentTag._id);
      }
      expect(removeTagFunc).to.throw(Meteor.Error, /Access Denied/);
      expect(tagUpdateSpy).to.not.have.been.called;
      expect(tagRemoveSpy).to.not.have.been.called;
      return done();
    });

    it("should remove header tag by admin", function (done) {
      sandbox.stub(Reaction, "hasPermission", function () {
        return true;
      });

      const tag = Factory.create("tag");
      const currentTag = Factory.create("tag");
      expect(Tags.find().count()).to.equal(2);
      Meteor.call("shop/removeHeaderTag", tag._id, currentTag._id);
      expect(Tags.find().count()).to.equal(1);
      return done();
    });
  });

  describe("shop/createTag", () => {
    beforeEach(() => {
      Tags.remove({});
    });

    it("should throw 403 error by non admin", () => {
      sandbox.stub(Roles, "userIsInRole", () => false);
      sandbox.spy(Tags, "insert");
      expect(function () {
        return Meteor.call("shop/createTag", "testTag", true);
      }).to.throw(Meteor.Error, /Access Denied/);
      expect(Tags.insert).not.to.have.been.called;
    });

    it("should create new tag", (done) => {
      sandbox.stub(Roles, "userIsInRole", () => true);
      sandbox.spy(Tags, "insert");
      expect(Meteor.call("shop/createTag", "testTag", true)).to.be.a("string");
      expect(Tags.insert).to.have.been.called;
      return done();
    });
  });

  describe("shop/updateHeaderTags", function () {
    beforeEach(function () {
      Shops.remove({});
      return Tags.remove({});
    });

    it("should throw 403 error by non admin", function (done) {
      sandbox.spy(Tags, "update");
      const tag = Factory.create("tag");
      function updateTagFunc() {
        return Meteor.call("shop/updateHeaderTags", tag._id);
      }
      expect(updateTagFunc).to.throw(Meteor.Error, /Access Denied/);
      expect(Tags.update).not.to.have.been.called;
      return done();
    });

    it("should insert new header tag with 1 argument by admin", function (done) {
      sandbox.stub(Reaction, "hasPermission", function () {
        return true;
      });
      const tagCount = Tags.find().count();
      Factory.create("shop"); // Create shop so that ReactionCore.getShopId() doesn't fail
      Meteor.call("shop/updateHeaderTags", "new tag");
      expect(Tags.find().count()).to.equal(tagCount + 1);
      const tag = Tags.find().fetch()[0];
      expect(tag.name).to.equal("new tag");
      expect(tag.slug).to.equal("new-tag");
      return done();
    });

    it("should update existing header tag with 2 arguments by admin", function (done) {
      let tag;
      sandbox.stub(Reaction, "hasPermission", function () {
        return true;
      });
      tag = Factory.create("tag");
      Meteor.call("shop/updateHeaderTags", "updated tag", tag._id);
      expect(Tags.find().count()).to.equal(1);
      tag = Tags.findOne();
      expect(tag.name).to.equal("updated tag");
      expect(tag.slug).to.equal("updated-tag");
      return done();
    });
  });
});
