/**
 * Router for core routes related to account profiles, sign in and management
 */
// define default routing groups
account = ReactionRouter.group({
  name: "account",
  prefix: "/account"
});
//
// accounts/profile
//
account.route("/profile", {
  name: "account/profile",
  action: function (params, queryParams) {
    renderLayout({
      template: "accountProfile"
    });
  }
});

// Sign in page
account.route("/signIn", {
  path: "signin",
  action: function (params, queryParams) {
    renderLayout({
      template: "loginForm"
    });
  }
});
