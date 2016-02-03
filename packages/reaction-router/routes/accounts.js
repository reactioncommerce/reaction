/**
 * Router for core routes related to account profiles, sign in and management
 */

//
// accounts/profile
//
ReactionRouter.route("/account/profile", {
  name: "account/profile",
  action: function (params, queryParams) {
    renderLayout({
      template: "accountProfile"
    });
  }
});

// Sign in page
ReactionRouter.route("/account/signIn", {
  path: "signin",
  action: function (params, queryParams) {
    renderLayout({
      template: "loginForm"
    });
  }
});
