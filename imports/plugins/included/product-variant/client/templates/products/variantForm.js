import { Components } from "@reactioncommerce/reaction-components";
import { Template } from "meteor/templating";

Template.variantForm.helpers({
  component() {
    const currentData = Template.currentData() || {};

    return {
      ...currentData,
      component: Components.VariantEditForm
    };
  }
});
