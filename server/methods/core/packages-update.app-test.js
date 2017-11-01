import { Meteor } from "meteor/meteor";
import { Factory } from "meteor/dburles:factory";
import { Packages } from "/lib/collections";
import { expect } from "meteor/practicalmeteor:chai";
import { sinon } from "meteor/practicalmeteor:sinon";
import { Reaction } from "/server/api";

describe.only("Update Package", function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe.only("package/update", function () {
    it.only("should throw an 'Access Denied' error for non-admins", function (done) {
      const pkgUpdateSpy = sandbox.spy(Packages, "update");
      const examplePackage = Factory.create("examplePackage");

      function updatePackage() {
        return Meteor.call("package/update", examplePackage.name, "settings", {});
      }
      expect(updatePackage).to.throw(Meteor.Error, /Access Denied/);
      expect(pkgUpdateSpy).to.not.have.been.called;

      return done();
    });

    it.only("should be able to update any Package", function (done) {
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
