/*
 * client integration tests for layouts
 * integration tests are those that check client
 * interactions with the server
 */
function signUp(user) {
  $(".dropdown-toggle").trigger("click");
  $("#signup-link").trigger("click");
  $("#login-email").val(user.email);
  $("#login-password").val(user.password);
  $("#login-buttons-password").trigger("click");
}

describe("User signup", function () {
  let user = {
    email: faker.internet.email(),
    password: faker.internet.password()
  };

  it("should return a meteor userId users by one", function () {
    signUp(user);
    expect(Meteor.userId()).not.toBeNull();
  });

  it("should automatically log-in new user", function () {
    expect(Meteor.userId()).not.toBeNull();
  });
});

describe("client layout", function () {
  describe("coreLayout template", function () {
    it("loads navigation header", function () {
      expect($("body > nav.reaction-navigation-header").text()).not.toBeNull();
    });

    it("loads product pricing", function () {
      expect($("div.currency-symbol").text()).not.toBeNull();
    });
  });
});
