import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @file Hydra Oauth plugin
 *
 * @namespace HydraOauth
 */

Reaction.registerPackage({
  label: "HydraOauth",
  name: "reaction-hydra-oauth",
  autoEnable: true,
  addRolesToGroups: [{
    allShops: true,
    groups: ["guest", "customer"],
    roles: ["account/login", "not-found"]
  }],
  registry: [{
    route: "/account/login",
    name: "account/login",
    label: "OAuth Login",
    meta: {
      noAdminControls: true,
      oauthLoginFlow: true
    },
    description: "Oauth Login Provider Page",
    workflow: "hydraOauthLogin",
    template: "hydraOauthLoginForm"
  }, {
    route: "/not-found",
    name: "not-found",
    label: "not-found",
    meta: {
      noAdminControls: true,
      oauthLoginFlow: true
    },
    description: "Not Found Page",
    workflow: "hydraOauthLogin",
    template: "notFound"
  }],
  layout: [{
    layout: "hydraOauthLogin",
    workflow: "hydraOauthLogin",
    theme: "default",
    enabled: true,
    structure: {
      layout: "hydraOauthLogin",
      layoutHeader: "",
      layoutFooter: "",
      notFound: "notFound"
    }
  }]
});
