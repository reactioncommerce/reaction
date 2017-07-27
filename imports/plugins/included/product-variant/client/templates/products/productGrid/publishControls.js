import { Components } from "@reactioncommerce/reaction-components";
import { Template } from "meteor/templating";

Template.gridPublishControls.helpers({
  PublishComponent() {
    return {
      component: Components.GridProductPublish
    };
  }
});
