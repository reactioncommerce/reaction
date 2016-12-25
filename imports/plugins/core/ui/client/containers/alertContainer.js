import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { Alerts } from "../components";
import { default as ReactionAlerts } from "/imports/plugins/core/layout/client/templates/layout/alerts/inlineAlerts";

class AlertContainer extends Component {
  handleAlertRemove(alert) {
    ReactionAlerts.collection_.remove(alert._id);
  }

  handleAlertSeen(alert) {
    ReactionAlerts.collection_.update(alert._id, {
      $set: {
        seen: true
      }
    });
  }

  render() {
    return (
      <div className="alert-container">
        <Alerts
          onAlertRemove={this.handleAlertRemove}
          onAlertSeen={this.handleAlertSeen}
          {...this.props}
        />
      </div>
    );
  }
}

function composer(props, onData) {
  const alerts = ReactionAlerts.collection_.find({
    "options.placement": props.placement || "",
    "options.id": props.id || ""
  }).fetch();

  onData(null, {
    alerts: alerts
  });
}

AlertContainer.propTypes = {
  id: PropTypes.string,
  placement: PropTypes.string
};

export default composeWithTracker(composer)(AlertContainer);
