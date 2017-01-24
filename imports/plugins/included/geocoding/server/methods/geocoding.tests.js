import geocoder from "./geocode";
import { expect } from "meteor/practicalmeteor:chai";


describe("Geocoding", function () {
  it("should return data for a valid address", function () {
    const address = "123 Main St. Los Angeles, CA 90046";
    geocoder.geocode(address, function (results) {
      console.log("results", results);
      expect(results).to.not.be.undefined;
    });
  });
});
