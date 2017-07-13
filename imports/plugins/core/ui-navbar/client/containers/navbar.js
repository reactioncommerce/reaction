import { registerComponent } from "@reactioncommerce/reaction-components";
import { withProps } from "recompose";
import { Reaction } from "/client/api";
import NavBar from "../components/navbar";

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

const props = {
  searchEnabled,
  searchTemplate,
  hasProperPermission
};

registerComponent("NavBar", NavBar, withProps(props));

export default withProps(props)(NavBar);
