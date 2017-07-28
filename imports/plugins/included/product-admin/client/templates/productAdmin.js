import { Components } from "@reactioncommerce/reaction-components";
import { Template } from "meteor/templating";

Template.ProductAdmin.helpers({
  component() {
    const currentData = Template.currentData() || {};

    return {
      ...currentData,
      component: Components.ProductAdmin
    };
  }
});
