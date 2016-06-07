/**
 * ReactionEmailFromTemplate - Returns a rendered and translated
 * email template.
 * @param {String} template name of the template
 * @param {String} lng language of the email text
 * @param {String} data data context for rendering
 * @param {String} fallbackLng language that is used if lng has no translations
 * @returns {Object} returns rendered HTML mail
 */
ReactionEmailFromTemplate = function (template, lng, data, fallbackLng) {
  check(template, String);
  check(lng, String);
  check(data, Match.Optional(Object));
  check(fallbackLng, Match.Optional(String));

  let fallbackLngs;
  if (typeof(fallbackLng) === "undefined") {
    fallbackLngs = "en";
  } else if (fallbackLng !== "en") {
    // also add english as second fallback..
    fallbackLngs = [fallbackLng, "en"];
  }

  if (!Template[template]) {
    ReactionCore.Log.fatal(`Template '${ template }' does not exist. ` +
      `Did you register it in the approriate workflow step (register.js)?`);
  }
  Template[template].helpers({
    _: function (key) {
      // Don't know where the last argument comes from...
      let slice = Array.prototype.slice.call(arguments, 1, -1);
      if (slice.length === 2 && typeof(slice[1]) === "object") {
        // e.g. {name: 'Dolly', age: 13}
        slice = slice[1];
      }
      const options = {
        postProcess: "sprintf",
        sprintf: slice,
        lng: lng,
        fallbackLng: fallbackLngs
      };
      return Spacebars.SafeString(i18next.t(key, options));
    }
  });

  return SSR.render(template, data);
};

checkPackageIsEnabled = function () {
  const enabled = ReactionCore.Collections.Packages.findOne({
    shopId: ReactionCore.getShopId(),
    name: PKG_NAME,
    enabled: true});
  if (!enabled) {
    ReactionCore.Log.info("No email templates available. " +
      "Unable to send notification emails. " +
      "Enable email notifications in admin dashboard.");
    throw new Meteor.Error(403, "Unable to send invitation email.");
  }
};

if (ReactionCore && ReactionCore.Hooks) {
  /**
   * orders/sendNotification
   * send cusstomers an confirmation when an order arrives
   * @param {String} order - order
   * @returns {Boolean} True, if email was sent successfully
   */
  ReactionCore.Hooks.Events.add("orders/sendNotification", (order) => {
    check(order, Object);
    checkPackageIsEnabled();

    let shop = ReactionCore.Collections.Shops.findOne(order.shopId);
    let shipment = order.shipping[0];

    ReactionCore.configureMailUrl();
    ReactionCore.Log.info("orders/sendNotification", order.workflow.status);

    // anonymous users without emails.
    if (!order.email) {
      ReactionCore.Log.warn("No shop email configured. Using anonymous order.");
      return true;
    }

    // handle missing root shop email
    if (!shop.emails[0].address) {
      shop.emails[0].address = "no-reply@reactioncommerce.com";
      ReactionCore.Log.warn("No shop email configured. Using no-reply to send mail");
    }
    let tpl = `orders/${order.workflow.status}`;
    const profile = Meteor.call("accounts/getUserProfile", order.userId);

    const html = ReactionEmailFromTemplate(
      tpl,
      profile.language,
      { homepage: Meteor.absoluteUrl(),
        shop: shop,
        order: order,
        shipment: shipment
      },
      shop.language
    );
    try {
      return Email.send({
        to: order.email,
        from: `${shop.name} <${shop.emails[0].address}>`,
        subject: `Order update from ${shop.name}`,
        html: html
      });
    } catch (error) {
      ReactionCore.Log.error("Unable to send notification email: " + error);
      throw new Meteor.Error("error-sending-email", "Unable to send order notification email.", error);
    }
  });

  /**
   * accounts/inviteShopMember
   * invite new admin users
   * (not consumers) to secure access in the dashboard
   * to permissions as specified in packages/roles
   * @param {String} shopId - shop to invite user
   * @param {String} email - email of invitee
   * @param {String} name - name to address email
   * @returns {Boolean} returns falsy value on success
   */
  ReactionCore.Hooks.Events.add("accounts/inviteShopMember", (data) => {
    let {shopId, email, name} = data;
    check(shopId, String);
    check(email, String);
    check(name, String);
    checkPackageIsEnabled();

    let currentUserName;
    let shop;
    let token;
    let user;
    let userId;
    // this.unblock();

    shop = ReactionCore.Collections.Shops.findOne(shopId);

    if (!ReactionCore.hasPermission("reaction-accounts", Meteor.userId(), shopId)) {
      throw new Meteor.Error(403, "Access denied");
    }

    ReactionCore.configureMailUrl();
    // don't send account emails unless email server configured
    if (!process.env.MAIL_URL) {
      ReactionCore.Log.info(`Mail not configured: suppressing invite email output`);
      return true;
    }
    // everything cool? invite user
    if (shop && email && name) {
      let currentUser = Meteor.user();
      if (currentUser) {
        if (currentUser.profile) {
          currentUserName = currentUser.profile.name;
        } else {
          currentUserName = currentUser.username;
        }
      } else {
        currentUserName = "Admin";
      }

      user = Meteor.users.findOne({
        "emails.address": email
      });

      if (!user) {
        userId = Accounts.createUser({
          email: email,
          username: name
        });
        user = Meteor.users.findOne(userId);
        if (!user) {
          throw new Error("Can't find user");
        }
        token = Random.id();
        Meteor.users.update(userId, {
          $set: {
            "services.password.reset": {
              token: token,
              email: email,
              when: new Date()
            }
          }
        });

        const profile = ReactionCore.Collections.Accounts.findOne({userId: userId}).profile;
        const html = ReactionEmailFromTemplate(
          "accounts/inviteShopMember",
          profile.language,
          {
            homepage: Meteor.absoluteUrl(),
            shop: shop,
            currentUserName: currentUserName,
            invitedUserName: name,
            url: Accounts.urls.enrollAccount(token)
          }
        );

        try {
          return Email.send({
            to: email,
            from: `${shop.name} <${shop.emails[0].address}>`,
            subject: `You have been invited to join ${shop.name}`,
            html: html
          });
        } catch (_error) {
          throw new Meteor.Error(403, "Unable to send invitation email.");
        }
      } else {
        const profile = ReactionCore.Collections.Accounts.findOne({userId: user._id}).profile;
        const html = ReactionEmailFromTemplate(
          "accounts/inviteShopMember",
          profile.language,
          {
            homepage: Meteor.absoluteUrl(),
            shop: shop,
            currentUserName: currentUserName,
            invitedUserName: name,
            url: Meteor.absoluteUrl()
          }
        );
        try {
          return Email.send({
            to: email,
            from: `${shop.name} <${shop.emails[0].address}>`,
            subject: `You have been invited to join the ${shop.name}`,
            html: html
          });
        } catch (_error) {
          throw new Meteor.Error(403, "Unable to send invitation email.");
        }
      }
    } else {
      throw new Meteor.Error(403, "Access denied");
    }
    return true;
  });

  /**
   * accounts/sendWelcomeEmail
   * send an email to consumers on sign up
   * @param {String} shopId - shopId of new User
   * @param {String} userId - new userId to welcome
   * @returns {Boolean} returns boolean
   */
  ReactionCore.Hooks.Events.add("accounts/sendWelcomeEmail", (data) => {
    let {shopId, userId} = data;
    check(shopId, String);
    check(userId, String);
    checkPackageIsEnabled();

    // this.unblock();

    const user = ReactionCore.Collections.Accounts.findOne(userId);
    const shop = ReactionCore.Collections.Shops.findOne(shopId);
    let shopEmail;

    // anonymous users arent welcome here
    if (!user.emails || !user.emails.length > 0) {
      return true;
    }

    let userEmail = user.emails[0].address;

    // provide some defaults for missing shop email.
    if (!shop.emails) {
      shopEmail = `${shop.name}@localhost`;
      ReactionCore.Log.debug(`Shop email address not configured. Using ${shopEmail}`);
    } else {
      shopEmail = shop.emails[0].address;
    }

    // configure email
    ReactionCore.configureMailUrl();
    // don't send account emails unless email server configured
    if (!process.env.MAIL_URL) {
      ReactionCore.Log.info(`Mail not configured: suppressing welcome email output`);
      return true;
    }

    const html = ReactionEmailFromTemplate(
      "accounts/sendWelcomeEmail",
      user.profile.language, {
        homepage: Meteor.absoluteUrl(),
        shop: shop,
        user: Meteor.user()
      },
      shop.language
    );
    try {
      return Email.send({
        to: userEmail,
        from: `${shop.name} <${shopEmail}>`,
        subject: `Welcome to ${shop.name}!`,
        html: html
      });
    } catch (e) {
      ReactionCore.Log.warn("Unable to send email, check configuration and port.", e);
    }
  });
}
