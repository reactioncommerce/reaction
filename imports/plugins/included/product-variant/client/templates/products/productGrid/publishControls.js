import { Template } from "meteor/templating";
import GridPublishContainer from "../../../containers/gridPublishContainer";

Template.gridPublishControls.helpers({
  PublishComponent() {
    return {
      component: GridPublishContainer
    };
  }
});
