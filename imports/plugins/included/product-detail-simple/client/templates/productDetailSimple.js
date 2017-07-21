import { Components } from "@reactioncommerce/reaction-components";
import { Template } from "meteor/templating";

Template.productDetailSimple.helpers({
  PDC() {
    return Components.ProductDetail;
  }
});

Template.productDetailSimpleToolbar.helpers({
  PublishContainerComponent() {
    return {
      component: Components.ProductPublish
    };
  }
});
