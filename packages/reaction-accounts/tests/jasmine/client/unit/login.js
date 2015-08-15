
describe("User sign up", function () {

  beforeEach(function(done) {
    var user = {
      email: "Not a valid email",
      password: "1234"
    }

    $('.login-input--email').val(user.email);
    $('.login-input--password').val(user.password);
    $('.action--submit').trigger('click');

    setTimeout(function() {
      done();
    }, 1)
  });

  it("should display invalid username error", function() {
    expect($(".login-form .form-group--email").hasClass('has-error')).toBe(true);
  });

});
