/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { Match } from "meteor/check";
import { Factory } from "meteor/dburles:factory";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Packages } from "/lib/collections";
import { Reaction } from "/server/api";

describe("Update Package", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("package/update", function () {
    it("should throw an 'Access Denied' error for non-admins", function (done) {
      const pkgUpdateSpy = sandbox.spy(Packages, "update");
      const examplePackage = Factory.create("examplePackage");

      function updatePackage() {
        return Meteor.call("package/update", examplePackage.name, "settings", {});
      }
      expect(updatePackage).to.throw(Meteor.Error, /Access Denied/);
      expect(pkgUpdateSpy).to.not.have.been.called;

      return done();
    });

    it("should throw an error when supplied with an argument of the wrong type", function (done) {
      const pkgUpdateSpy = sandbox.spy(Packages, "update");
      sandbox.stub(Reaction, "getShopId", () => "randomId");
      sandbox.stub(Reaction, "hasPermission", () => true);

      function updatePackage(packageName, field, value) {
        return Meteor.call("package/update", packageName, field, value);
      }
      expect(() => updatePackage([], "someField", { foo: "bar" })).to.throw(Match.Error, /Match error: Expected string, got object/);
      expect(() => updatePackage("somePackage", [], { foo: "bar" })).to.throw(Match.Error, /Match error: Expected string, got object/);
      expect(() => updatePackage("somePackage", "someField", "")).to.throw(Match.Error, /Match error: Expected object, got string/);
      expect(pkgUpdateSpy).to.not.have.been.called;

      return done();
    });

    it("should be able to update any Package", function (done) {
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

      return done();
    });
  });
});
