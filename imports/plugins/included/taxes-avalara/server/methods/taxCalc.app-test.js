import { expect } from "meteor/practicalmeteor:chai";
import Fixtures from "/server/imports/fixtures";
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

    it.only("should return nothing", function (done) {
      this.timeout(5000);
      const result = taxCalc.getCompanies();
      expect(result.data.value[0].name).to.equal("Reaction Commerce, Inc");
      done();
    });
  });
});
