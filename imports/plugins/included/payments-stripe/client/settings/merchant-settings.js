import { Template } from "meteor/templating";

import { Reaction } from "/client/api";

Template.stripeConnectMerchantSignup.helpers({
  stripeConnectIsConnected() {
    const stripe = Reaction.getPackageSettingsWithOptions({
      shopId: Reaction.getShopId(),
      name: "reaction-stripe"
    });
    return stripe && stripe.settings && stripe.settings.connectAuth && stripe.settings.connectAuth.access_token;
  }
});
