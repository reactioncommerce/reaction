/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import { Roles } from "meteor/alanning:roles";
import { Translations } from "/lib/collections";
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
    it("should throw 403 error by non admin", function () {
      sandbox.stub(Roles, "userIsInRole", () => false);
      const removeTranslationSpy = sandbox.spy(Translations, "remove");
      const importTranslationSpy = sandbox.spy(Reaction.Importer, "translation");
      expect(() => Meteor.call("i18n/flushTranslations")).to.throw(Meteor.Error, /Access Denied/);
      expect(removeTranslationSpy).to.not.have.been.called;
      expect(importTranslationSpy).to.not.have.been.called;
    });

    it("should remove and load translations back by admin", function () {
      this.timeout(20000);
      sandbox.stub(Meteor, "userId", () => "0123456789");
      sandbox.stub(Roles, "userIsInRole", () => true);
      const removeTranslationSpy = sandbox.spy(Translations, "remove");
      const importTranslationSpy = sandbox.spy(Reaction.Importer, "translation");
      Factory.create("shop");
      Meteor.call("i18n/flushTranslations");
      expect(removeTranslationSpy).to.have.been.called;
      expect(importTranslationSpy).to.have.been.called;
    });
  });
});
