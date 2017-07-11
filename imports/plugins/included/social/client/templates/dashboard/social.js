import { Template } from "meteor/templating";
import SocialSettingsContainer from "../../containers/socialSettingsContainer";

Template.socialSettings.helpers({
  SocialSettingsComponent() {
    return {
      component: SocialSettingsContainer
    };
  }
});
