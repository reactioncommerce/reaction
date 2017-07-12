import React from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

const Alerts = ({ alerts, onAlertRemove, onAlertSeen }) => {
  if (Array.isArray(alerts)) {
    return (
      <div className="alert-container">
        {alerts.map((alert, index) => {
          return (
            <Components.Alert
              alert={alert}
              key={index}
              onAlertRemove={onAlertRemove}
              onAlertSeen={onAlertSeen}
            />
          );
        })}
      </div>
    );
  }
  return null;
};

Alerts.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.object),
  onAlertRemove: PropTypes.func,
  onAlertSeen: PropTypes.func
};

registerComponent("Alerts", Alerts);

export default Alerts;
