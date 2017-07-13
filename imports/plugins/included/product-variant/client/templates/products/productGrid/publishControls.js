import { Template } from "meteor/templating";
import GridPublishContainer from "/imports/plugins/included/product-variant/containers/gridPublishContainer";

Template.gridPublishControls.helpers({
  PublishComponent() {
    return {
      component: GridPublishContainer
    };
  }
});
