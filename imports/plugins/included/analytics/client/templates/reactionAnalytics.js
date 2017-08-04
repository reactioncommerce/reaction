import { Template } from "meteor/templating";
import AnalyticsSettingsContainer from "../containers/analyticsSettingsContainer";

Template.reactionAnalyticsSettings.helpers({
  component() {
    return {
      component: AnalyticsSettingsContainer,
      enabled: {
        googleAnalytics: typeof ga === "function",
        segmentio: typeof analytics === "object",
        mixpanel: typeof mixpanel === "object"
      }
    };
  }
});
