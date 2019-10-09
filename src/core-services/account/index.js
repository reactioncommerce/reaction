import i18n from "./i18n/index.js";
import mutations from "./mutations/index.js";
import queries from "./queries/index.js";
import { registerPluginHandler } from "./registration.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import startup from "./startup.js";
import tokenMiddleware from "./util/tokenMiddleware.js";
import { getHasPermissionFunctionForUser } from "./util/hasPermission.js";
import { getShopsUserHasPermissionForFunctionForUser } from "./util/shopsUserHasPermissionFor.js";
import accountByUserId from "./util/accountByUserId.js";

const ENROLL_URI_BASE = "account/enroll";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Accounts",
    name: "reaction-accounts",
    i18n,
    addRolesToGroups: [{
      groups: ["guest", "customer"],
      roles: [
        "account/login",
        "account/verify",
        "not-found",
        "reset-password",
        ENROLL_URI_BASE
      ]
    }],
    collections: {
      Accounts: {
        name: "Accounts",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ groups: 1 }, { name: "c2_groups" }],
          [{ shopId: 1 }, { name: "c2_shopId" }],
          [{ userId: 1 }, { name: "c2_userId" }]
        ]
      },
      Groups: {
        name: "Groups"
      },
      roles: {
        name: "roles"
      },
      users: {
        name: "users"
      }
    },
    auth: {
      accountByUserId,
      getHasPermissionFunctionForUser,
      getShopsUserHasPermissionForFunctionForUser
    },
    functionsByType: {
      registerPluginHandler: [registerPluginHandler],
      startup: [startup]
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    queries,
    expressMiddleware: [
      {
        route: "graphql",
        stage: "authenticate",
        fn: tokenMiddleware
      }
    ],
    settings: {},
    registry: [{
      route: "/dashboard/accounts",
      name: "accounts",
      provides: ["dashboard"],
      label: "Accounts",
      description: "Manage how members sign into your shop.",
      icon: "fa fa-users",
      container: "core",
      template: "accountsDashboard",
      workflow: "coreAccountsWorkflow",
      priority: 1
    }, {
      route: "/account/profile/verify",
      label: "Account Verify",
      name: "account/verify",
      workflow: "coreAccountsWorkflow",
      template: "VerifyAccount"
    }, {
      label: "Account Settings",
      icon: "fa fa-sign-in",
      provides: ["settings"],
      route: "/dashboard/account/settings",
      container: "accounts",
      workflow: "coreAccountsWorkflow",
      template: "accountsSettings",
      showForShopTypes: ["primary"]
    }, {
      route: "/dashboard/accounts",
      name: "dashboard/accounts",
      workflow: "coreAccountsWorkflow",
      provides: ["shortcut"],
      label: "Accounts",
      icon: "fa fa-users",
      priority: 1,
      container: "dashboard",
      template: "accountsDashboard"
    }, {
      route: "/account/profile",
      template: "accountProfile",
      name: "account/profile",
      label: "Profile",
      icon: "fa fa-user",
      provides: ["userAccountDropdown"]
    }, {
      route: "/reset-password/:token/:status?",
      template: "loginFormUpdatePassword",
      workflow: "none",
      meta: { noAdminControls: true },
      name: "reset-password",
      label: "reset-password"
    }, {
      route: `/${ENROLL_URI_BASE}/:token/:status?`,
      template: "loginFormUpdatePassword",
      workflow: "none",
      meta: { noAdminControls: true },
      name: ENROLL_URI_BASE,
      label: "Account Enroll"
    }, {
      route: "account/invite",
      label: "Account Invite",
      permission: "accountInvite",
      name: "account/invite"
    }],
    layout: [{
      layout: "coreLayout",
      workflow: "coreAccountsWorkflow",
      collection: "Accounts",
      theme: "default",
      enabled: true,
      structure: {
        template: "accountsDashboard",
        layoutHeader: "NavBar",
        layoutFooter: "",
        notFound: "notFound",
        dashboardHeader: "dashboardHeader",
        dashboardControls: "",
        dashboardHeaderControls: "",
        adminControlsFooter: "adminControlsFooter"
      }
    }]
  });
}
