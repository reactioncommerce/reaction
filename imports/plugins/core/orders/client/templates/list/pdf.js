import { Template } from "meteor/templating";
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
