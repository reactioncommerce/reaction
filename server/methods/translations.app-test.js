import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Translations }  from "/lib/collections";
import { Reaction } from "/server/api";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import Fixtures from "/server/imports/fixtures";

Fixtures();

describe("i18n methods", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("i18n/flushTranslations", function () {
    it("should throw 403 error by non admin", function (done) {
      sandbox.stub(Roles, "userIsInRole", function () {
        return false;
      });
      // spyOn(Roles, "userIsInRole").and.returnValue(false);
      let removeTranslationSpy = sandbox.spy(Translations, "remove");
      // spyOn(Translations, "remove");
      let importTranslationSpy = sandbox.spy(Reaction.Import, "translation");
      // spyOn(Reaction.Import, "translation");
      expect(function () {
        return Meteor.call("i18n/flushTranslations");
      }).to.throw(Meteor.Error, /Access Denied/);
      expect(removeTranslationSpy).to.not.have.been.called;
      expect(importTranslationSpy).to.not.have.been.called;
      return done();
    });

    it("should remove and load translations back by admin", function (done) {
      sandbox.stub(Meteor, "userId", function () {
        return "0123456789";
      });
      // spyOn(Meteor, "userId").and.returnValue("0123456789");
      sandbox.stub(Roles, "userIsInRole", function () {
        return true;
      });
      // spyOn(Roles, "userIsInRole").and.returnValue(true);
      let removeTranslationSpy = sandbox.spy(Translations, "remove");
      // spyOn(ReactionCore.Collections.Translations, "remove");
      Factory.create("shop");
      // spyOn(ReactionImport, "process");
      Meteor.call("i18n/flushTranslations");
      expect(removeTranslationSpy).to.have.been.called;
      // expect(ReactionImport.process).toHaveBeenCalled();
      return done();
    });
  });
});
