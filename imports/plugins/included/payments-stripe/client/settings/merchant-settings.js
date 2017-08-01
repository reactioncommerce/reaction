import { Template }  from "meteor/templating";

import { Reaction } from "/client/api";

Template.stripeConnectMerchantSignup.helpers({
  stripeConnectIsConnected() {
    const stripe = Reaction.getPackageSettingsWithOptions({
      shopId: Reaction.getShopId(),
      name: "reaction-stripe"
    });
    console.log(stripe);
    return stripe && stripe.settings && stripe.settings.connectAuth;
  }
});
