/*
* waitForElement
* see: https://velocity.readme.io/docs/jasmine-template-testing
*/

waitForElement = function (selector, successCallback) {
  var checkInterval = 50;
  var timeoutInterval = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  var startTime = Date.now();
  var intervalId = Meteor.setInterval(function () {
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
    var user = {
      email: "",
      password: ""
    };

    $('.login-input--email').val(user.email);
    $('.login-input--password').val(user.password);

    setTimeout(function () {
      done();
    }, 1);
  });

  it("should display invalid username error", function (done) {
    waitForElement($('.login-input--email'), function() {
      var emailInput = $('.login-input--email');
      var passInput = $('.login-input--password');
      var accountDropdown = $('.accounts-dropdown .dropdown-toggle');
      var loginSubmit = $('.action--submit');

      var user = {
        email: faker.name.findName(),
        password: faker.hacker.noun,
      };


      var spyOnLoginSubmit = spyOnEvent(loginSubmit, 'click');

      $('.login-input--email').val(user.email);
      $('.login-input--password').val(user.password);
      $('.action--submit').trigger('click');

      expect(spyOnLoginSubmit).toHaveBeenTriggered();

      // Same thing
      expect( $(".login-form .form-group--email")).toHaveClass('has-error');
      expect($(".login-form .form-group--email").hasClass('has-error')).toBeTruthy();
    });
    done();
  });
});
