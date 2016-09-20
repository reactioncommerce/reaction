import SearchContainer from "../containers/settingsContainer.js";

Template.revisionControlSettings.helpers({
  SearchContainerComponent() {
    return {
      component: SearchContainer
    };
  }
});
