import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class Alert extends Component {
  componentDidMount() {
    if (this.props.alert) {
      const { options } = this.props.alert;

      if (this.props.onAlertSeen) {
        this.props.onAlertSeen(this.props.alert);
      }

      if (this.props.alert && this.props.alert.options && this.props.alert.options.autoHide) {
        setTimeout(() => {
          if (this.props.onAlertRemove) {
            this.props.onAlertRemove(this.props.alert);
          }
        }, options.autoHide);
      }
    }
  }

  render() {
    // If we have an alert object, most likely from the global alert system,
    // then display a standard alert
    if (this.props.alert) {
      const {
        message,
        mode,
        options
      } = this.props.alert;

      const alertClassName = classnames({
        alert: true,
        [`alert-${mode || "info"}`]: true
      });

      return (
        <div className={alertClassName}>
          <Components.Translation defaultValue={message} i18nKey={options.i18nKey} />
          {this.props.children}
        </div>
      );
    }

    // Otherwise, it's up to the user to provide the content via props

    const alertClassName = classnames({
      alert: true,
      [`alert-${this.props.mode || "info"}`]: true
    });

    return (
      <div className={alertClassName}>
        {this.props.children}
      </div>
    );
  }
}

Alert.propTypes = {
  alert: PropTypes.object,
  children: PropTypes.node,
  mode: PropTypes.oneOf(["info", "warning", "danger", "success"]),
  onAlertRemove: PropTypes.func,
  onAlertSeen: PropTypes.func
};

registerComponent("Alert", Alert);

export default Alert;
