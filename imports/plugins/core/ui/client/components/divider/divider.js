import React, { Component, PropTypes } from "react";
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
        <div className={classes}>
          <hr />
          <span className="label">
            <Translation defaultValue={label} i18nKey={i18nKeyLabel}/>
          </span>
          <hr />
        </div>
      );
    }

    return (
      <hr className={classes} />
    );
  }
}

Divider.propTypes = {
  i18nKeyLabel: PropTypes.string,
  label: PropTypes.string
};

export default Divider;
