import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction, Router } from "/client/api";
import { App } from "../components";

function composer(props, onData) {
  onData(null, {
    isActionViewOpen: Reaction.isActionViewOpen(),
    hasDashboardAccess: Reaction.hasDashboardAccessForAnyShop(),
    currentRoute: Router.current()
  });
}

registerComponent("App", App, [
  composeWithTracker(composer)
]);

export default compose(composeWithTracker(composer))(App);
