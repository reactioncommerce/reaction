import { expect } from "meteor/practicalmeteor:chai";
import Fixtures from "/server/imports/fixtures";
import { Reaction } from "/server/api";
import { Packages } from "/lib/collections";
import taxCalc from "./taxCalc";

Fixtures();

describe("Avalara taxRate API", function () {

  describe("when checking address", function () {
    it("should return true", function (done) {
      this.timeout(5000);
      const address = {
        line1: "8008 Norton Ave.",
        line2: "Apartment 2",
        city: "West Hollywood",
        region: "CA",
        postalCode: "90046"
      };
      const result = taxCalc.validateAddress(address);
      expect(result).to.be.an("object");
      expect(result.error).to.be.undefined;
      done();
    });

    it("should return nothing", function (done) {
      this.timeout(5000);
      const result = taxCalc.getCompanies();
      expect(result.data.value[0].name).to.equal("Reaction Commerce, Inc");
      done();
    });
  });

  describe.only("when trying to save company code", function () {
    it("should return a company code", function (done) {
      const result = taxCalc.saveCompanyCode();
      const pkgData = Packages.findOne({
        name: "taxes-avalara",
        shopId: Reaction.getShopId(),
        enabled: true
      });
      expect(result).to.equal(pkgData.settings.avalara.companyCode);
      done();
    });
  });
});
