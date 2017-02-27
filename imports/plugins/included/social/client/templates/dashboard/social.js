import SocialSettingsContainer from "../../containers/socialSettingsContainer";

Template.socialSettings.helpers({
  SocialSettingsComponent() {
    return {
      component: SocialSettingsContainer
    };
  }
});
