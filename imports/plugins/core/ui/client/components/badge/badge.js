import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames/dedupe";
import { Translation } from "/imports/plugins/core/ui/client/components";

class Badge extends Component {
  constructor(props) {
    super(props);
  }

  renderLabel() {
    if (this.props.label) {
      return (
        <Translation
          defaultValue={this.props.label}
          i18nKey={this.props.i18nKeyLabel}
        />
      );
    }

    return null;
  }

  render() {
    const {
      status, badgeSize,

      // Destructure these vars as they aren't valid as attributes on the HTML element button
      label, i18nKeyLabel, // eslint-disable-line no-unused-vars

      // Get the rest of the properties and put them in attrs
      // these will most likely be HTML attributes
      ...attrs
    } = this.props;

    const classes = classnames({
      "rui": true,
      "badge": true,
      "badge-small": (badgeSize === null || badgeSize === undefined || badgeSize === "small"),
      "badge-large": badgeSize === "large",
      "badge-cta": status === "cta",
      "badge-danger": status === "danger",
      "badge-default": !primary && (status === null || status === undefined || status === "default"),
      "badge-info": status === "info",
      "badge-primary": status === "primary",
      "badge-success": status === "success",
      "badge-warning": status ===  "warning"
    });

    return (
      <span className={classes} style={{ display: "inline-flex" }}>
        {this.renderLabel()}
      </span>
    );
  }
}

Badge.propTypes = {
  badgeSize: PropTypes.string,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  i18nKeyLabel: PropTypes.string,
  label: PropTypes.string,
  status: PropTypes.string
};

Badge.defaultProps = {
  badgeSize: "small",
  status: "default"
};

export default Badge;
