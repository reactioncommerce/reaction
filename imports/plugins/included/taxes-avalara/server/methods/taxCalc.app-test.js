import { expect } from "meteor/practicalmeteor:chai";
import Fixtures from "/server/imports/fixtures";
import { Reaction } from "/server/api";
import { Packages } from "/lib/collections";
import { createCart } from "/server/imports/fixtures/cart";
import taxCalc from "./taxCalc";

Fixtures();

describe("Avalara taxRate API", function () {

  before(function () {
    Packages.update({
      name: "taxes-avalara",
      shopId: Reaction.getShopId()
    }, { $set: { enabled: true } });
    taxCalc.saveCompanyCode();
  });

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

    it("should return our company", function (done) {
      this.timeout(5000);
      const result = taxCalc.getCompanies();
      expect(result.data.value[0].name).to.equal("Reaction Commerce, Inc");
      done();
    });
  });

  describe("when trying to save company code", function () {
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

  describe("when trying to get the company code from the DB", function () {
    it("should return a company code", function (done) {
      taxCalc.saveCompanyCode();
      const result = taxCalc.getCompanyCode();
      const pkgData = Packages.findOne({
        name: "taxes-avalara",
        shopId: Reaction.getShopId(),
        enabled: true
      });
      expect(result).to.equal(pkgData.settings.avalara.companyCode);
      done();
    });
  });

  describe.only("processing a Sales Invoice", function () {
    this.timeout(5000);
    it("should return a salesinvoice with taxes", function (done) {
      const cart = createCart("BCTMZ6HTxFSppJESk", "6qiqPwBkeJdtdQc4G");

      const result = taxCalc.estimateCart(cart);
      // console.log("line item result", result.data.lines[0]);
      expect(result).to.not.be.undefined;
      done();
    });
  });
});
