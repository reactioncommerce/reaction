
describe("Account Registration Validation ", function () {
  describe("usernamne valiation ", function () {
    it(
      "should not allow a invalid username of length 3",
      done => {
        const username = "tn";
        Meteor.call("accounts/validation/username", username, function (error, result) {
          expect(result).toEqual(jasmine.any(Object));
          return done();
        });
      }
    );

    it(
      "should allow a username of valid length",
      done => {
        const username = "tenten";
        Meteor.call("accounts/validation/username", username, function (error, result) {
          expect(result).toEqual(true);
          return done();
        });
      }
    );
  });

  describe("email address valiation ", function () {
    it(
      "should not allow an invalid email address",
      done => {
        const email = "emailwebsite.com";
        Meteor.call("accounts/validation/email", email, false, function (error, result) {
          expect(result).toEqual(jasmine.any(Object));
          return done();
        });
      }
    );

    it(
      "should allow a valid email address",
      done => {
        const email = "email@website.com";
        Meteor.call("accounts/validation/email", email, false, function (error, result) {
          expect(result).toEqual(true);
          return done();
        });
      }
    );

    it(
      "should allow a blank optional email address",
      done => {
        const email = "";
        Meteor.call("accounts/validation/email", email, true, function (error, result) {
          expect(result).toEqual(true);
          return done();
        });
      }
    );

    it(
      "should allow a valid, supplied, optional email address",
      done => {
        const email = "email@website.com";
        Meteor.call("accounts/validation/email", email, true, function (error, result) {
          expect(result).toEqual(true);
          return done();
        });
      }
    );

    it(
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

  describe("password validation", function () {
    it(
      "should not allow a password under 6 characters in length",
      done => {
        const password = "abc12";
        Meteor.call("accounts/validation/password", password, undefined, function (error, result) {
          expect(result).toEqual(jasmine.any(Object));
          return done();
        });
      }
    );

    it(
      "should allow a password of exactly 6 characters in length",
      done => {
        const password = "abc123";
        Meteor.call("accounts/validation/password", password, undefined, function (error, result) {
          expect(result).toBe(true);
          return done();
        });
      }
    );

    it(
      "should allow a password of 6 characters or more in length",
      done => {
        const password = "abc1234";
        Meteor.call("accounts/validation/password", password, undefined, function (error, result) {
          expect(result).toBe(true);
          return done();
        });
      }
    );

    it(
      "should allow a password of 6 characters or more in length with only uppercase characters",
      done => {
        const password = "ABC1234";
        Meteor.call("accounts/validation/password", password, undefined, function (error, result) {
          expect(result).toBe(true);
          return done();
        });
      }
    );

    it(
      "should allow a password of 6 characters or more in length uppercase and lower characters",
      done => {
        const password = "abcABC1234";
        Meteor.call("accounts/validation/password", password, undefined, function (error, result) {
          expect(result).toBe(true);
          return done();
        });
      }
    );

    it(
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
