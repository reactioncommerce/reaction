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
Template.completedPDFLayout.onCreated(async function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    order: {},
    ready: false
  });

  this.readyVar = new ReactiveVar(false);
  this.moment = await import("moment");
  this.readyVar.set(true);

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
    moment.locale(Reaction.Locale.get().language);
    const f = block.hash.format || "MMM DD, YYYY hh:mm:ss A";
    return moment(context).format(f);
  },
  ready() {
    return Template.instance().readyVar.get();
  }
});
