var signIn = function (user, callback) {

  $('.dropdown-toggle').trigger('click')
  $('#signup-link').trigger('click')
  $('#login-email').val(user.email)
  $('#login-password').val(user.password)
  $('#login-buttons-password').trigger('click')

  callback();

  return;
};


describe("User sign in", function () {
  var user = "notValidEmail";
  var password = "";

  it("should display invalid username error", function() {
    signIn(user);
    expect($(".login-form .form-group--email").hasClass('has-error')).toBe(true);
  });

});
