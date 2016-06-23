import { Meteor } from "meteor/meteor";
import { expect } from "meteor/practicalmeteor:chai";
import Fixtures from "/server/imports/fixtures";

Fixtures();

// These are client-side only function (???) so they cannot be test from here
describe.skip("Account Registration Validation ", function () {
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

    it.skip(
      "should allow a valid email address",
      done => {
        const email = "email@website.com";
        Meteor.call("accounts/validation/email", email, false, function (error, result) {
          expect(result).toEqual(true);
          return done();
        });
      }
    );

    it.skip(
      "should allow a blank optional email address",
      done => {
        const email = "";
        Meteor.call("accounts/validation/email", email, true, function (error, result) {
          expect(result).toEqual(true);
          return done();
        });
      }
    );

    it.skip(
      "should allow a valid, supplied, optional email address",
      done => {
        const email = "email@website.com";
        Meteor.call("accounts/validation/email", email, true, function (error, result) {
          expect(result).toEqual(true);
          return done();
        });
      }
    );

    it.skip(
      "should not allow an invalid, supplied, optional email address",
      done => {
        const email = "emailwebsite.com";
        Meteor.call("accounts/validation/email", email, true, function (error, result) {
          expect(result).toEqual(jasmine.any(Object));
          return done();
        });
      }
    );
  });

  describe.skip("password validation", function () {
    it.skip(
      "should not allow a password under 6 characters in length",
      done => {
        const password = "abc12";
        Meteor.call("accounts/validation/password", password, undefined, function (error, result) {
          expect(result).toEqual(jasmine.any(Object));
          return done();
        });
      }
    );

    it.skip(
      "should allow a password of exactly 6 characters in length",
      done => {
        const password = "abc123";
        Meteor.call("accounts/validation/password", password, undefined, function (error, result) {
          expect(result).toBe(true);
          return done();
        });
      }
    );

    it.skip(
      "should allow a password of 6 characters or more in length",
      done => {
        const password = "abc1234";
        Meteor.call("accounts/validation/password", password, undefined, function (error, result) {
          expect(result).toBe(true);
          return done();
        });
      }
    );

    it.skip(
      "should allow a password of 6 characters or more in length with only uppercase characters",
      done => {
        const password = "ABC1234";
        Meteor.call("accounts/validation/password", password, undefined, function (error, result) {
          expect(result).toBe(true);
          return done();
        });
      }
    );

    it.skip(
      "should allow a password of 6 characters or more in length uppercase and lower characters",
      done => {
        const password = "abcABC1234";
        Meteor.call("accounts/validation/password", password, undefined, function (error, result) {
          expect(result).toBe(true);
          return done();
        });
      }
    );

    it.skip(
      "should allow a password of 6 characters or more in length uppercase, lower, and symbol characters",
      done => {
        const password = "abcABC1234@#$%^";
        Meteor.call("accounts/validation/password", password, undefined, function (error, result) {
          expect(result).toBe(true);
          return done();
        });
      }
    );
  });
});

