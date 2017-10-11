import { Template } from "meteor/templating";
import { Reaction } from "/lib/api";
import { i18next } from "/client/api";
import { Shops } from "/lib/collections";

Template.stripeConnectSignupButton.events({
  "click [data-event-action='button-click-stripe-signup']": function () {
    const shopId = Reaction.getShopId();
    const primaryShopId = Reaction.getPrimaryShopId();
    const primaryStripePackage = Reaction.getPackageSettingsWithOptions({
      shopId: primaryShopId,
      name: "reaction-stripe",
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
      return Alerts.toast(`${i18next.t("admin.connect.stripeConnectNotEnabled")}`, "error");
    }

    const shop = Shops.findOne({ _id: shopId });

    if (!shop || !shop.workflow || shop.workflow.status !== "active") {
      return Alerts.toast(`${i18next.t("admin.connect.shopNotActive")}`, "error");
    }

    if (!shop.emails || !Array.isArray(shop.emails) || shop.emails.length === 0) {
      return Alerts.toast(`${i18next.t("admin.connect.shopEmailNotConfigured")}`, "error");
    }

    if (!shop.addressBook || !Array.isArray(shop.addressBook) || shop.addressBook.length === 0) {
      return Alerts.toast(`${i18next.t("admin.connect.shopAddressNotConfigured")}`, "error");
    }

    const email = shop.emails[0].address;
    const country = shop.addressBook[0].country;
    const phoneNumber = shop.addressBook[0].phone;
    const businessName = shop.addressBook[0].company;
    const streetAddress = shop.addressBook[0].address1;
    const city = shop.addressBook[0].city;
    const state = shop.addressBook[0].state;
    const zip = shop.addressBook[0].postal;

    const stripeConnectAuthorizeUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&state=${shopId}&client_id=${clientId}&scope=read_write`;
    const autofillParams = `&stripe_user[email]=${email}&stripe_user[country]=${country}&stripe_user[phone_number]=${phoneNumber}&stripe_user[business_name]=${businessName}&stripe_user[street_address]=${streetAddress}&stripe_user[city]=${city}&stripe_user[state]=${state}&stripe_user[zip]=${zip}`; // eslint-disable-line max-len
    window.open(stripeConnectAuthorizeUrl + autofillParams, "_blank");
  }
});
