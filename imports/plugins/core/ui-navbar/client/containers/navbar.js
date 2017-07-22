import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import NavBar from "../components/navbar";

function composer(props, onData) {
  const searchPackage = Reaction.Apps({ provides: "ui-search" });
  let searchEnabled;
  let searchTemplate;

  if (searchPackage.length) {
    searchEnabled = true;
    searchTemplate = searchPackage[0].template;
  } else {
    searchEnabled = false;
  }

  const hasProperPermission = Reaction.hasPermission("account/profile");

  onData(null, {
    searchEnabled,
    searchTemplate,
    hasProperPermission
  });
}

registerComponent("NavBar", NavBar, composeWithTracker(composer));

export default composeWithTracker(composer)(NavBar);
