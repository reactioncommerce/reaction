/* eslint-disable require-jsdoc */
/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { Match } from "meteor/check";
import { Factory } from "meteor/dburles:factory";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Packages } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";

describe("Update Package", function () {
  let sandbox;

  before(function (done) {
    this.timeout(20000);
    Reaction.onAppStartupComplete(() => {
      done();
    });
  });

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("package/update", function () {
    it("should throw an 'Access Denied' error for non-admins", function () {
      this.timeout(20000);
      const pkgUpdateSpy = sandbox.spy(Packages, "update");
      const examplePackage = Factory.create("examplePackage");

      function updatePackage() {
        return Meteor.call("package/update", examplePackage.name, "settings", {});
      }
      expect(updatePackage).to.throw(ReactionError, /Access Denied/);
      expect(pkgUpdateSpy).to.not.have.been.called;
    });

    it("should throw an error when supplied with an argument of the wrong type", function () {
      this.timeout(20000);
      const pkgUpdateSpy = sandbox.spy(Packages, "update");
      sandbox.stub(Reaction, "getShopId", () => "randomId");
      sandbox.stub(Reaction, "hasPermission", () => true);

      function updatePackage(packageName, field, value) {
        return Meteor.call("package/update", packageName, field, value);
      }
      expect(() => updatePackage([], "someField", { foo: "bar" })).to.throw(Match.Error, /Match error: Expected string, got object/);
      expect(() => updatePackage("somePackage", [], { foo: "bar" })).to.throw(Match.Error, /Match error: Expected string, got object/);
      expect(() => updatePackage("somePackage", "someField", ""))
        .to.throw(Match.Error, /Match error: Failed Match.OneOf, Match.Maybe or Match.Optional validation/);
      expect(pkgUpdateSpy).to.not.have.been.called;
    });

    it("should be able to update any Package", function () {
      this.timeout(20000);
      const packageUpdateSpy = sandbox.spy(Packages, "update");
      const oldPackage = Factory.create("examplePackage");

      sandbox.stub(Reaction, "getShopId", () => oldPackage.shopId);
      sandbox.stub(Reaction, "hasPermission", () => true);
      const packageName = oldPackage.name;
      const newValues = {
        enabled: true,
        apiUrl: "http://foo-bar.com/api/v1"
      };
      Meteor.call("package/update", packageName, "settings", newValues);
      expect(packageUpdateSpy).to.have.been.called;
      const updatedPackage = Packages.findOne({ name: packageName });
      expect(oldPackage.settings.enabled).to.not.equal(updatedPackage.settings.enabled);
      expect(oldPackage.settings.apiUrl).to.not.equal(updatedPackage.settings.apiUrl);
    });
  });
});
