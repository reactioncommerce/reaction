import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import { Translation } from "../translation";

class Alert extends Component {

  componentDidMount() {
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

  render() {
    const {
      message,
      mode,
      options
    } = this.props.alert;

    const alertClassName = classnames({
      "alert": true,
      [`alert-${mode || "info"}`]: true
    });

    return (
      <div className={alertClassName}>
        <Translation defaultValue={message} i18nKey={options.i18nKey} />
      </div>
    );
  }
}

Alert.propTypes = {
  alert: PropTypes.object
};

export default Alert;
