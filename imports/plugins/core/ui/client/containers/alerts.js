import { compose, withProps, pure } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Alerts } from "../components";
import { default as ReactionAlerts } from "/imports/plugins/core/layout/client/templates/layout/alerts/inlineAlerts";

const handlers = {
  handleAlertRemove(alert) {
    ReactionAlerts.collection_.remove(alert._id);
  },

  handleAlertSeen(alert) {
    ReactionAlerts.collection_.update(alert._id, {
      $set: {
        seen: true
      }
    });
  }
};

function composer(props, onData) {
  const alerts = ReactionAlerts.collection_.find({
    "options.placement": props.placement || "",
    "options.id": props.id || ""
  }).fetch();

  onData(null, { alerts });
}

registerComponent("Alerts", Alerts, [
  composeWithTracker(composer),
  withProps(handlers),
  pure
]);

export default compose(
  composeWithTracker(composer),
  withProps(handlers),
  pure
)(Alerts);
