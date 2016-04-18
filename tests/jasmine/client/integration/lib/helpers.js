/*
* waitForElement
* see: https://velocity.readme.io/docs/jasmine-template-testing
*/

waitForElement = function (selector, successCallback) {
  const checkInterval = 50;
  const timeoutInterval = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  const startTime = Date.now();
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

signUp = function (user, callback) {
  $(".dropdown-toggle").trigger("click");
  $("[data-event-action=signUp]").trigger("click");
  $(".login-input-email").val(user.email);
  $(".login-input-password").val(user.password);
  $("[data-event-action='register']").trigger("click");
  callback && callback();
};
