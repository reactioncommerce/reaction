import { Components } from "@reaction/components";
import { Template } from "meteor/templating";

Template.gridPublishControls.helpers({
  PublishComponent() {
    return {
      component: Components.GridProductPublish
    };
  }
});
