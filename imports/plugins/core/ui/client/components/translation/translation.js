import React, { Component, PropTypes, Children } from "react"; // eslint-disable-line
import { i18next } from "/client/api";
import camelcase from "lodash/camelcase";

class Translation extends Component {
  render() {
    const key = this.props.i18nKey || camelcase(this.props.defaultValue)

    const translation = i18next.t(key, {
      defaultValue: this.props.defaultValue
    })
    return (
      <span>{translation}</span>
    );
  }
}

// Translation.propTypes = {
//   translation: PropTypes.object.isRequired
// };

export default Translation
