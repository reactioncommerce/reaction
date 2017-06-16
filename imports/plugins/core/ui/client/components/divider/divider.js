import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Translation } from "../";

class Divider extends Component {
  renderLabel() {
    return (
      <Translation defaultValue={this.props.label} />
    );
  }

  render() {
    const { label, i18nKeyLabel } = this.props;
    const classes = classnames({
      rui: true,
      separator: true,
      divider: true,
      labeled: label || i18nKeyLabel
    });

    if (label) {
      return (
        <div className={classes} id={this.props.id}>
          <hr />
          <span className="label">
            <Translation defaultValue={label} i18nKey={i18nKeyLabel} />
          </span>
          <hr />
        </div>
      );
    }

    return (
      <div className={classes}>
        <hr />
      </div>
    );
  }
}

Divider.propTypes = {
  i18nKeyLabel: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string
};

export default Divider;
