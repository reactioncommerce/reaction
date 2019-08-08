import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Reaction } from "/lib/api";
import { i18next } from "/client/api";
import { Shops } from "/lib/collections";

Template.stripeConnectSignupButton.events({
  "click [data-event-action='button-click-stripe-signup']"() {
    const shopId = Reaction.getShopId();
    const primaryShopId = Reaction.getPrimaryShopId();
    const primaryStripePackage = Reaction.getPackageSettingsWithOptions({
      shopId: primaryShopId,
      name: "reaction-marketplace",
      enabled: true
    });

    // eslint-disable-next-line
    // debugger;
    let clientId;

    if (primaryStripePackage &&
        primaryStripePackage.settings &&
        primaryStripePackage.settings.public &&
        typeof primaryStripePackage.settings.public.client_id === "string") {
      // If the primaryshop has stripe enabled and set the client_id
      clientId = primaryStripePackage.settings.public.client_id;
    } else {
      Alerts.toast(`${i18next.t("admin.connect.stripeConnectNotEnabled")}`, "error");
      return;
    }

    const shop = Shops.findOne({ _id: shopId });

    if (!shop || !shop.workflow || shop.workflow.status !== "active") {
      Alerts.toast(`${i18next.t("admin.connect.shopNotActive")}`, "error");
      return;
    }

    if (!shop.emails || !Array.isArray(shop.emails) || shop.emails.length === 0) {
      Alerts.toast(`${i18next.t("admin.connect.shopEmailNotConfigured")}`, "error");
      return;
    }

    if (!shop.addressBook || !Array.isArray(shop.addressBook) || shop.addressBook.length === 0) {
      Alerts.toast(`${i18next.t("admin.connect.shopAddressNotConfigured")}`, "error");
      return;
    }

    const { country } = shop.addressBook[0];
    const phoneNumber = shop.addressBook[0].phone;
    const businessName = shop.addressBook[0].company;
    const streetAddress = shop.addressBook[0].address1;
    const { city } = shop.addressBook[0];
    const state = shop.addressBook[0].region;
    const zip = shop.addressBook[0].postal;

    const user = Meteor.user() || {};

    const defaultEmail =
      user.emails.find((email) => email.provides === "default");
    const defaultEmailAddress = defaultEmail ? defaultEmail.address : "";

    const [firstName, ...last] = user.name ? user.name.split(" ") : [];
    const lastName = last.join(" ");

    const stripeConnectAuthorizeUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&state=${shopId}&client_id=${clientId}&scope=read_write`;
    const autofillParams = `&stripe_user[email]=${defaultEmailAddress}&stripe_user[country]=${country}&stripe_user[phone_number]=${phoneNumber}&stripe_user[business_name]=${businessName}&stripe_user[street_address]=${streetAddress}&stripe_user[city]=${city}&stripe_user[state]=${state}&stripe_user[zip]=${zip}&stripe_user[first_name]=${firstName}&stripe_user[last_name]=${lastName}`; // eslint-disable-line max-len
    window.open(stripeConnectAuthorizeUrl + autofillParams, "_blank");
  }
});
