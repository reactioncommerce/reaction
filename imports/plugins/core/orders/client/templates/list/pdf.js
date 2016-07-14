import { Template } from "meteor/templating";
import { Router } from "/client/api";
import { Orders } from "/lib/collections";
import { ReactiveDict } from "meteor/reactive-dict";

/**
* completedPDFLayout
* inheritsHelpersFrom dashboardOrdersList
* Uses the browser print function.
*/
Template.completedPDFLayout.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    order: {}
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
    if (order) {
      return order.billing[0];
    }

    return null;
  }
});
