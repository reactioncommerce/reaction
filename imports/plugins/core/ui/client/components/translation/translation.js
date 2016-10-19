import { camelCase } from "lodash";
import React, { Component, PropTypes } from "react";
import { i18next } from "/client/api";

class Translation extends Component {
  render() {
    const i18nKey = this.props.i18nKey || camelCase(this.props.defaultValue);

    const translation = i18next.t(i18nKey, {
      defaultValue: this.props.defaultValue
    });

    return (
      <span>{translation}</span>
    );
  }
}

Translation.propTypes = {
  defaultValue: PropTypes.string,
  i18nKey: PropTypes.string
};

export default Translation;
