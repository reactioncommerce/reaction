/*
* waitForElement
* see: https://velocity.readme.io/docs/jasmine-template-testing
*/

waitForElement = function (selector, successCallback) {
  let checkInterval = 50;
  let timeoutInterval = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  let startTime = Date.now();
  let intervalId = Meteor.setInterval(function () {
    if (Date.now() > startTime + timeoutInterval) {
      Meteor.clearInterval(intervalId);
      // Jasmine will handle the test timeout error
    } else if ($(selector).length > 0) {
      Meteor.clearInterval(intervalId);
      successCallback();
    }
  }, checkInterval);
};


describe("User sign up", function () {
  beforeEach(function (done) {
    let user = {
      email: "",
      password: ""
    };

    $(".login-input-email").val(user.email);
    $(".login-input-password").val(user.password);

    setTimeout(function () {
      done();
    }, 1);
  });

  it("should display invalid username error", function (done) {
    waitForElement($(".login-input-email"), function () {
      let emailInput = $(".login-input-email");
      let passInput = $(".login-input-password");
      let loginSubmit = $("[data-event-action=submitSignInForm");

      let user = {
        email: faker.name.findName(),
        password: faker.hacker.noun
      };

      let spyOnLoginSubmit = spyOnEvent(loginSubmit, "click");

      emailInput.val(user.email);
      passInput.val(user.password);
      loginSubmit.trigger("click");

      expect(spyOnLoginSubmit).toHaveBeenTriggered();

      // Same thing
      expect($(".login-form .form-group-email")).toHaveClass("has-error");
      expect($(".login-form .form-group-email").hasClass("has-error")).toBeTruthy();
    });

    done();
  });
});
