import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import { Packages, Shipping } from "/lib/collections";

/*
/*
 * Template Shipping Events
 */

Template.shippingRates.events({
  "click"() {
    return Alerts.removeSeen();
  },
  "click [data-action=addShippingProvider]"() {
    Reaction.setActionViewDetail({
      label: i18next.t("shipping.addShippingProvider"),
      template: "addShippingProvider"
    });
  }
});


Template.shippingRatesSettings.onCreated(function () {
  // don't show unless we have services
  // Reaction.hideActionView();
  this.autorun(() => {
    this.subscribe("Shipping");
  });
});

Template.shippingRatesSettings.helpers({
  packageData() {
    return Packages.findOne({
      name: "shipping-rates"
    });
  },
  shipping() {
    const instance = Template.instance();
    if (instance.subscriptionsReady()) {
      return Shipping.find({
        shopId: Reaction.getShopId()
      });
    }
    return [];
  },
  selectedShippingProvider() {
    return Session.equals("selectedShippingProvider", true);
  }
});
