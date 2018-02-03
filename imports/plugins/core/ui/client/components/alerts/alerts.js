import React from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";

const Alerts = ({ alerts, handleAlertRemove, handleAlertSeen }) => (
  Array.isArray(alerts) &&
  <div className="alert-container">
    {alerts.map((alert) => (
      <Components.Alert
        alert={alert}
        key={alert._id}
        onAlertRemove={handleAlertRemove}
        onAlertSeen={handleAlertSeen}
      />
    ))}
  </div>
);


Alerts.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.object),
  handleAlertRemove: PropTypes.func,
  handleAlertSeen: PropTypes.func
};

export default Alerts;
