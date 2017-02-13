// import { expect } from "meteor/practicalmeteor:chai";
// import Fixtures from "/server/imports/fixtures";
// import { Reaction } from "/server/api";
// import { Packages } from "/lib/collections";
// import { createCart } from "/server/imports/fixtures/cart";
// import taxCalc from "./taxCalc";
//
// Fixtures();
//
// describe("Avalara taxRate API", function () {
//   before(function () {
//     Packages.update({
//       name: "taxes-avalara",
//       shopId: Reaction.getShopId()
//     }, { $set: { enabled: true } });
//     taxCalc.saveCompanyCode();
//   });
//
//   describe("when checking address", function () {
//     it("should return true", function (done) {
//       this.timeout(5000);
//       const address = {
//         address1: "8008 Norton Ave.",
//         address2: "Apartment 2",
//         city: "West Hollywood",
//         region: "CA",
//         postal: "90046",
//         country: "US"
//       };
//       const result = taxCalc.validateAddress(address);
//       expect(result).to.be.an("object");
//       expect(result.errors.length).to.equal(0);
//       done();
//     });
//
//     it("should return our company", function (done) {
//       this.timeout(5000);
//       const result = taxCalc.getCompanies();
//       expect(result.data.value[0].name).to.equal("Reaction Commerce, Inc");
//       done();
//     });
//   });
//
//   describe("when trying to save company code", function () {
//     it("should return a company code", function (done) {
//       const result = taxCalc.saveCompanyCode();
//       const pkgData = Packages.findOne({
//         name: "taxes-avalara",
//         shopId: Reaction.getShopId(),
//         enabled: true
//       });
//       expect(result).to.equal(pkgData.settings.avalara.companyCode);
//       done();
//     });
//   });
//
//   describe("when trying to get the company code from the DB", function () {
//     it("should return a company code", function (done) {
//       taxCalc.saveCompanyCode();
//       const result = taxCalc.getCompanyCode();
//       const pkgData = Packages.findOne({
//         name: "taxes-avalara",
//         shopId: Reaction.getShopId(),
//         enabled: true
//       });
//       expect(result).to.equal(pkgData.settings.avalara.companyCode);
//       done();
//     });
//   });
//
//   describe("processing a Sales Order", function () {
//     this.timeout(5000);
//     it("should return a tax estimate document", function (done) {
//       const options = {};
//       options.shippingAddress = {
//         country: "US",
//         address1: "2110 Main St.",
//         address2: "Suite 207",
//         postal: "90405",
//         city: "Santa Monica",
//         region: "CA",
//         isBillingDefault: true,
//         isShippingDefault: true
//       };
//       const cart = createCart("BCTMZ6HTxFSppJESk", "6qiqPwBkeJdtdQc4G", options);
//       const result = taxCalc.estimateCart(cart);
//       expect(result.status).to.equal("Temporary");
//       done();
//     });
//
//     it("should return a cart updated with tax informtion", function (done) {
//       const options = {};
//       options.shippingAddress = {
//         country: "US",
//         address1: "2110 Main St.",
//         address2: "Suite 207",
//         postal: "90405",
//         city: "Santa Monica",
//         region: "CA",
//         isBillingDefault: true,
//         isShippingDefault: true
//       };
//       const cart = createCart("BCTMZ6HTxFSppJESk", "6qiqPwBkeJdtdQc4G", options);
//       const result = taxCalc.applyEstimateToCart(cart);
//       expect(result).to.not.be.undefined;
//       done();
//     });
//   });
// });
