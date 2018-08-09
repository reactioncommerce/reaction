import Logger from "@reactioncommerce/logger";
import { Template } from "meteor/templating";
import { Reaction, Router } from "/client/api";
import { Orders } from "/lib/collections";
import { ReactiveDict } from "meteor/reactive-dict";
import { ReactiveVar } from "meteor/reactive-var";

/**
* completedPDFLayout
* inheritsHelpersFrom dashboardOrdersList
* Uses the browser print function.
*/
Template.completedPDFLayout.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    order: {},
    ready: false
  });

  this.readyVar = new ReactiveVar(false);

  import("moment")
    .then((module) => {
      this.moment = module.default;
      return this.readyVar.set(true);
    })
    .catch((error) => {
      Logger.error(error, "Unable to load moment");
    });

  const currentRoute = Router.current();

  this.autorun(() => {
    this.subscribe("Orders");

    const order = Orders.findOne({
      _id: currentRoute.params.id
    });
    this.state.set({
      order
    });
  });
});


Template.completedPDFLayout.helpers({
  order() {
    return Template.instance().state.get("order");
  },
  billing() {
    const order = Template.instance().state.get("order");
    if (order && order.billing && order.billing.length) {
      return order.billing[0];
    }

    return null;
  },
  dateFormat(context, block) {
    const { moment } = Template.instance();
    if (moment) {
      moment.locale(Reaction.Locale.get().language);
      const format = block.hash.format || "MMM DD, YYYY hh:mm:ss A";
      return moment(context).format(format);
    }
    return "";
  },
  ready() {
    return Template.instance().readyVar.get();
  }
});
