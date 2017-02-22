import React, { Component, PropTypes } from "react";
import Alert from "./alert";

class Alerts extends Component {
  renderAlerts() {
    if (Array.isArray(this.props.alerts)) {
      return this.props.alerts.map((alert, index) => {
        return (
          <Alert
            alert={alert}
            key={index}
            onAlertRemove={this.props.onAlertRemove}
            onAlertSeen={this.props.onAlertSeen}
          />
        );
      });
    }
  }

  render() {
    return (
      <div className="alert-container">
        {this.renderAlerts()}
      </div>
    );
  }
}

Alerts.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.object),
  onAlertRemove: PropTypes.func,
  onAlertSeen: PropTypes.func
};

export default Alerts;
