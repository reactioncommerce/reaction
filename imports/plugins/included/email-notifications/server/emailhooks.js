import { getShopId } from "/lib/api";
import { Accounts, Packages, Shops } from "/lib/collections";
import { Logger, Hooks, Reaction } from "/server/api";
import { renderReactionEmail } from "./render";

/**
 * orders/sendNotification
 * send cusstomers an confirmation when an order arrives
 * @param {String} order - order
 * @returns {Boolean} True, if email was sent successfully
 */
Hooks.Events.add("orders/sendNotification", (order) => {
  check(order, Object);
  checkPackageIsEnabled();

  let shop = Shops.findOne(order.shopId);
  let shipment = order.shipping[0];

  Reaction.configureMailUrl();
  Logger.info({orderstatus: order.workflow.status}, "orders/sendNotification");

  // anonymous users without emails.
  if (!order.email) {
    Logger.warn("No shop email configured. Using anonymous order.");
    return true;
  }

  // handle missing root shop email
  if (!shop.emails[0].address) {
    shop.emails[0].address = "no-reply@reactioncommerce.com";
    Logger.warn("No shop email configured. Using no-reply to send mail");
  }
  let tpl = `orders/${order.workflow.status}`;
  const profile = Meteor.call("accounts/getUserProfile", order.userId);

  const html = renderReactionEmail(
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
    Logger.warn(error, "Unable to send email");
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
Hooks.Events.add("accounts/inviteShopMember", (data) => {
  let {shopId, email, name, currentUserId} = data;
  check(shopId, String);
  check(email, String);
  check(name, String);
  check(currentUserId, String);
  checkPackageIsEnabled();

  let currentUserName;
  let shop;
  let token;
  let user;
  let userId;

  shop = Shops.findOne(shopId);

  Reaction.configureMailUrl();
  // don't send account emails unless email server configured
  if (!process.env.MAIL_URL) {
    Logger.info(`Mail not configured: suppressing invite email output.`);
    return true;
  }
  // everything cool? invite user
  if (shop && email && name) {
    let currentUser = Meteor.users.findOne(currentUserId);
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

      const profile = Accounts.findOne({userId: userId}).profile;
      const html = renderReactionEmail(
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
      const profile = Accounts.findOne({userId: user._id}).profile;
      const html = renderReactionEmail(
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
Hooks.Events.add("accounts/sendWelcomeEmail", (data) => {
  let {shopId, userId} = data;
  check(shopId, String);
  check(userId, String);
  checkPackageIsEnabled();

  // this.unblock();

  const user = Accounts.findOne(userId);
  const shop = Shops.findOne(shopId);
  let shopEmail;

  // anonymous users arent welcome here
  if (!user.emails || !user.emails.length > 0) {
    return true;
  }

  let userEmail = user.emails[0].address;

  // provide some defaults for missing shop email.
  if (!shop.emails) {
    shopEmail = `${shop.name}@localhost`;
    Logger.debug(`Shop email address not configured. Using ${shopEmail}`);
  } else {
    shopEmail = shop.emails[0].address;
  }

  // configure email
  Reaction.configureMailUrl();
  // don't send account emails unless email server configured
  if (!process.env.MAIL_URL) {
    Logger.info(`Mail not configured: suppressing welcome email output`);
    return true;
  }

  const html = renderReactionEmail(
    "accounts/sendWelcomeEmail",
    user.profile.language, {
      homepage: Meteor.absoluteUrl(),
      shop: shop,
      user: user
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
    Logger.warn(e, "Unable to send email, check configuration and port.");
  }
});


function checkPackageIsEnabled() {
  const enabled = Packages.findOne({
    shopId: getShopId(),
    name: "reaction-email-notifications",
    enabled: true});
  if (!enabled) {
    Logger.info("No email templates available. " +
      "Unable to send notification emails. " +
      "Enable email notifications in admin dashboard.");
  }
}
