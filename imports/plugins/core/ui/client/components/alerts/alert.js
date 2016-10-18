import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import { Translation } from "../translation";

class Alert extends Component {

  componentDidMount() {
    if (this.props.alert) {
      const {
        options
      } = this.props.alert;

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
    // If we have an alert object, most likely form the global alert system,
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
          <Translation defaultValue={message} i18nKey={options.i18nKey} />
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

export default Alert;
