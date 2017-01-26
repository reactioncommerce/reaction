import geocoder from "./geocode";
import { expect } from "meteor/practicalmeteor:chai";


describe("Geocoding", function () {
  it("should return data for a valid address", function () {
    const address = {
      fullName: "Fake User",
      address1: "8008 Norton Ave.",
      address2: "Apartment 2",
      city: "West Hollywood",
      phone: "(555) 555-5555",
      region: "CA",
      postal: "90046",
      country: "US",
      isCommercial: false,
      isBillingDefault: true,
      isShippingDefault: true
    };
    const result = geocoder.geocode(address);
    expect(result).to.be.an("object");
    expect(result.address1).to.equal("8008 Norton Ave.");
    expect(result.address2).to.equal("Apartment 2");
    expect(result.city).to.equal("West Hollywood");
    expect(result.country).to.equal("US");
    expect(result.postal).to.equal("90046");
  });

  it("should return the correct address result for a 'slightly' invalid address", function () {
    const address = {
      fullName: "Fake User",
      address1: "8008 Norton Ave.",
      address2: "Apartment 2",
      city: "Los Angeles",
      phone: "(555) 555-5555",
      region: "CA",
      postal: "90046",
      country: "US",
      isCommercial: false,
      isBillingDefault: true,
      isShippingDefault: true
    };
    const result = geocoder.geocode(address);
    expect(result.postal).to.equal("90046");
    expect(result.city).to.equal("West Hollywood");
  });
});
