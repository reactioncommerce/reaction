import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import * as Collections from "/lib/collections";
import { Hooks, Logger, Reaction } from "/server/api";

export default function () {
  /**
   * Make sure initial admin user has verified their
   * email before allowing them to login.
   *
   * http://docs.meteor.com/#/full/accounts_validateloginattempt
   */

  Accounts.validateLoginAttempt(function (attempt) {
    if (!attempt.allowed) {
      return false;
    }

    // confirm this is the accounts-password login method
    if (attempt.type !== "password" || attempt.methodName !== "login") {
      return attempt.allowed;
    }

    if (!attempt.user) {
      return attempt.allowed;
    }

    const loginEmail = attempt.methodArguments[0].user.email;
    const adminEmail = process.env.REACTION_EMAIL;

    if (loginEmail && loginEmail === adminEmail) {
      // filter out the matching login email from any existing emails
      const userEmail = _.filter(attempt.user.emails, function (email) {
        return email.address === loginEmail;
      });

      // check if the email is verified
      if (!userEmail.length || !userEmail[0].verified) {
        throw new Meteor.Error("access-denied", "Oops! Please validate your email first.");
      }
    }

    return attempt.allowed;
  });

  /**
   * Reaction Accounts handlers
   * creates a login type "anonymous"
   * default for all unauthenticated visitors
   */
  Accounts.registerLoginHandler(function (options) {
    if (!options.anonymous) {
      return {};
    }
    const stampedToken = Accounts._generateStampedLoginToken();
    const userId = Accounts.insertUserDoc({
      services: {
        anonymous: true
      },
      token: stampedToken.token
    });
    const loginHandler = {
      type: "anonymous",
      userId: userId
    };
    return loginHandler;
  });

  /**
   * Accounts.onCreateUser event
   * adding either a guest or anonymous role to the user on create
   * adds Accounts record for reaction user profiles
   * we clone the user into accounts, as the user collection is
   * only to be used for authentication.
   * - defaultVisitorRole
   * - defaultRoles
   * can be overriden from Shops
   *
   * @see: http://docs.meteor.com/#/full/accounts_oncreateuser
   */
  Accounts.onCreateUser((options, user) => {
    const shopId = Reaction.getShopId(); // current shop; not primary shop
    const groupToAddUser = options.groupId;
    const roles = {};
    const additionals = {
      name: options && options.name,
      profile: Object.assign({}, options && options.profile)
    };
    if (!user.emails) user.emails = [];
    // init default user roles
    // we won't create users unless we have a shop.
    if (shopId) {
      // retain language when user has defined a language
      // perhaps should be treated as additionals
      // or in onLogin below, or in the anonymous method options
      if (!(Meteor.users.find().count() === 0)) { // dont set on inital admin
        if (!user.profile) user.profile = {};
        const currentUser = Meteor.user(user);
        if (currentUser && currentUser.profile) {
          if (currentUser.profile.lang && !user.profile.lang) {
            user.profile.lang = currentUser.profile.lang;
          }
          if (currentUser.profile.currency && !user.profile.currency) {
            user.profile.currency = currentUser.profile.currency;
          }
        }
      }
      // if we don't have user.services we're an anonymous user
      if (!user.services) {
        const group = Collections.Groups.findOne({ slug: "guest", shopId });
        const defaultGuestRoles = group.permissions;
        // if no defaultGuestRoles retrieved from DB, use the default Reaction set
        roles[shopId] = defaultGuestRoles || Reaction.defaultVisitorRoles;
        additionals.groups = [group._id];
      } else {
        let group;
        if (groupToAddUser) {
          group = Collections.Groups.findOne({ _id: groupToAddUser, shopId });
        } else {
          group = Collections.Groups.findOne({ slug: "customer", shopId });
        }
        // if no group or customer permissions retrieved from DB, use the default Reaction customer set
        roles[shopId] = group.permissions || Reaction.defaultCustomerRoles;
        additionals.groups = [group._id];
        // also add services with email defined to user.emails[]
        for (const service in user.services) {
          if (user.services[service].email) {
            const email = {
              provides: "default",
              address: user.services[service].email,
              verified: true
            };
            user.emails.push(email);
          }
          if (user.services[service].name) {
            user.username = user.services[service].name;
            additionals.profile.name = user.services[service].name;
          }
          // TODO: For now we have here instagram, twitter and google avatar cases
          // need to make complete list
          if (user.services[service].picture) {
            additionals.profile.picture = user.services[service].picture;
          } else if (user.services[service].profile_image_url_https) {
            additionals.profile.picture = user.services[service].
              dprofile_image_url_https;
          } else if (user.services[service].profile_picture) {
            additionals.profile.picture = user.services[service].profile_picture;
          }
          // Correctly map Instagram profile data to Meteor user / Accounts
          if (user.services.instagram) {
            user.username = user.services[service].username;
            user.name = user.services[service].full_name;
            additionals.name = user.services[service].full_name;
            additionals.profile.picture = user.services[service].profile_picture;
            additionals.profile.bio = user.services[service].bio;
            additionals.profile.name = user.services[service].full_name;
            additionals.profile.username = user.services[service].username;
          }
        }
      }
      // clone before adding roles
      const account = Object.assign({}, user, additionals);
      account.userId = user._id;
      Collections.Accounts.insert(account);

      const userDetails = Collections.Accounts.findOne({
        _id: user._id
      });

      // send a welcome email to new users,
      // but skip the first default admin user
      // (default admins already get a verification email)
      if (!(Meteor.users.find().count() === 0) && !userDetails.profile.invited) {
        Meteor.call("accounts/sendWelcomeEmail", shopId, user._id);
      }

      // assign default user roles
      user.roles = roles;

      // run onCreateUser hooks
      // (the user object must be returned by all callbacks)
      const userDoc = Hooks.Events.run("onCreateUser", user, options);
      return userDoc;
    }
  });

  /**
   * Accounts.onLogin event
   * let's remove "anonymous" role, if the login type isn't "anonymous"
   * @param {Object} options - user account creation options
   * @fires "cart/mergeCart" Method
   */
  Accounts.onLogin((opts) => {
    // run onLogin hooks
    // (the options object must be returned by all callbacks)
    const options = Hooks.Events.run("onLogin", opts);

    // remove anonymous role
    // all users are guest, but anonymous user don't have profile access
    // or ability to order history, etc. so ensure its removed upon login.
    if (options.type !== "anonymous" && options.type !== "resume") {
      const update = {
        $pullAll: {}
      };

      update.$pullAll["roles." + Reaction.getShopId()] = ["anonymous"];

      Meteor.users.update({
        _id: options.user._id
      }, update, {
        multi: true
      });
      // debug info
      Logger.debug("removed anonymous role from user: " +
        options.user._id);

      // do not call `cart/mergeCart` on methodName === `createUser`, because
      // in this case `cart/mergeCart` calls from cart publication
      if (options.methodName === "createUser") return true;

      // onLogin, we want to merge session cart into user cart.
      const cart = Collections.Cart.findOne({
        userId: options.user._id
      });

      // for a rare use cases
      if (typeof cart !== "object") return false;
      // in current version currentSessionId will be available for anonymous
      // users only, because it is unknown for me how to pass sessionId when user
      // logged in
      let currentSessionId;
      if (options.methodArguments && options.methodArguments.length === 1 && options.methodArguments[0].sessionId) {
        currentSessionId = options.methodArguments[0].sessionId;
      }
      // changing of workflow status from now happens within `cart/mergeCart`
      return Meteor.call("cart/mergeCart", cart._id, currentSessionId);
    }
  });
}
