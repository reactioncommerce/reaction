/* eslint prefer-arrow-callback:0 */
import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";

// These are client-side only function (???) so they cannot be test from here
describe("Account Registration Validation ", function () {
  describe("username validation ", function () {
    it("should not allow a invalid username of length 3", function (done) {
      const username = "tn";
      Meteor.call("accounts/validation/username", username, function (error, result) {
        expect(error).to.be.undefined;
        expect(result).to.be.an("object");
        return done();
      });
    });

    it("should allow a username of valid length", function (done) {
      const username = "tenten";
      Meteor.call("accounts/validation/username", username, function (error, result) {
        expect(error).to.be.undefined;
        expect(result).to.be.true;
        return done();
      });
    });
  });

  describe("email address validation ", function () {
    it("should not allow an invalid email address", function (done) {
      this.timeout(4000);
      const email = "emailwebsite.com";
      Meteor.call("accounts/validation/email", email, false, function (error, result) {
        expect(result).to.be.an("object");
        return done();
      });
    });

    it("should allow a valid email address", function (done) {
      const email = "email@website.com";
      Meteor.call("accounts/validation/email", email, false, function (error, result) {
        expect(result).to.be.true;
        return done();
      });
    });

    it("should allow a blank optional email address", function (done) {
      const email = "";
      Meteor.call("accounts/validation/email", email, true, function (error, result) {
        expect(result).to.be.true;
        return done();
      });
    });

    it("should allow a valid, supplied, optional email address", function (done) {
      const email = "email@website.com";
      Meteor.call("accounts/validation/email", email, true, function (error, result) {
        expect(result).to.be.true;
        return done();
      });
    });

    it("should not allow an invalid, supplied, optional email address", function (done) {
      const email = "emailwebsite.com";
      Meteor.call("accounts/validation/email", email, true, function (error, result) {
        expect(result).to.be.an("object");
        return done();
      });
    });
  });

  describe("password validation", function () {
    it("should not allow a password under 6 characters in length", function (done) {
      const password = "abc12";
      Meteor.call("accounts/validation/password", password, undefined, function (error, result) {
        expect(result).to.be.an("array");
        const errMessage = result[0];
        expect(errMessage).to.be.an("object");
        expect(errMessage.reason).to.contain("at least 6 characters");
        return done();
      });
    });

    it("should allow a password of exactly 6 characters in length", function (done) {
      const password = "abc123";
      Meteor.call("accounts/validation/password", password, undefined, function (error, result) {
        expect(result).to.be.true;
        return done();
      });
    });

    it("should allow a password of 6 characters or more in length", function (done) {
      const password = "abc1234";
      Meteor.call("accounts/validation/password", password, undefined, function (error, result) {
        expect(result).to.be.true;
        return done();
      });
    });

    it("should allow a password of 6 characters or more in length with only uppercase characters", function (done) {
      const password = "ABC1234";
      Meteor.call("accounts/validation/password", password, undefined, function (error, result) {
        expect(result).to.be.true;
        return done();
      });
    });

    it("should allow a password of 6 characters or more in length uppercase and lower characters", function (done) {
      const password = "abcABC1234";
      Meteor.call("accounts/validation/password", password, undefined, function (error, result) {
        expect(result).to.be.true;
        return done();
      });
    });
    it("should allow a password of 6 characters or more in length uppercase, lower, and symbol characters", function (done) {
      const password = "abcABC1234@#$%^";
      Meteor.call("accounts/validation/password", password, undefined, function (error, result) {
        expect(result).to.be.true;
        return done();
      });
    });
  });
});
