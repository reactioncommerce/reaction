import { Components } from "@reactioncommerce/reaction-components";
import { Template } from "meteor/templating";

Template.productDetailSimpleToolbar.helpers({
  PublishContainerComponent() {
    return {
      component: Components.ProductPublish
    };
  }
});
